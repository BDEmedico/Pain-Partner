#!/usr/bin/env node
'use strict';

// Assistant-operated local drafting. Quote/hash checks establish traceability,
// not source authorship, interpretation, completeness or clinical suitability.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (value, key) => object(value) && Object.hasOwn(value, key);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const fail = message => { throw new Error(message); };
const codeRoot = path.resolve(__dirname, '..');
const within = (root, file) => file === root || file.startsWith(root + path.sep);

function privatePath(file, output = false) {
  const resolved = path.resolve(file);
  let actual;
  try { actual = fs.realpathSync(resolved); }
  catch {
    if (!output) fail('A local input/source file is unavailable.');
    try { actual = path.join(fs.realpathSync(path.dirname(resolved)), path.basename(resolved)); }
    catch { fail('The output directory is unavailable.'); }
  }
  if (within(fs.realpathSync(codeRoot), actual)) fail('Keep encounter inputs, sources and output outside the repository or installed skill directory.');
  return resolved;
}

function read(file, maxBytes, label) {
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile() || stat.size > maxBytes) fail(`${label} must be a regular file within the supported size limit.`);
    return fs.readFileSync(file);
  } catch (error) {
    if (error.message.startsWith(label)) throw error;
    fail(`${label} could not be read.`);
  }
}

function existing(candidates) { return candidates.find(file => fs.existsSync(file)); }

function loadEngine(options) {
  const htmlPath = options.html || existing([path.join(codeRoot, 'booking-builder.html'), path.join(codeRoot, 'assets', 'booking-builder.html')]);
  if (!htmlPath) fail('Booking HTML is unavailable. Supply --html.');
  const html = read(htmlPath, 4 * 1024 * 1024, 'Booking HTML').toString('utf8');
  const script = id => {
    const matches = [...html.matchAll(new RegExp(`<script\\b[^>]*\\bid=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script\\s*>`, 'gi'))];
    if (matches.length !== 1) fail(`Booking HTML must contain exactly one ${id} script.`);
    return matches[0][1];
  };
  let templates;
  try { templates = JSON.parse(script('booking-templates')); }
  catch { fail('The canonical booking template payload is invalid.'); }
  if (!object(templates) || !/^[a-f0-9]{64}$/.test(templates.source_sha256 || '')) fail('Booking templates lack a valid preferences checksum.');
  const preferencesPath = options.preferences || existing([
    path.join(path.dirname(htmlPath), 'WORKFLOW-PREFERENCES.md'),
    path.join(path.dirname(htmlPath), '..', 'references', 'preferences.md'),
    path.join(codeRoot, 'WORKFLOW-PREFERENCES.md'),
    path.join(codeRoot, 'references', 'preferences.md')
  ]);
  if (!preferencesPath) fail('Current preferences are unavailable. Supply --preferences.');
  const preferences = read(preferencesPath, 4 * 1024 * 1024, 'Preferences');
  if (sha256(preferences) !== templates.source_sha256) fail('Booking templates are stale relative to preferences. Rebuild the booking HTML before drafting.');
  const engine = script('booking-engine');
  const canonical = path.join(__dirname, 'booking_engine.cjs');
  if (!fs.existsSync(canonical)) fail('The canonical booking engine is unavailable.');
  if (engine.trim() !== read(canonical, 1024 * 1024, 'Canonical booking engine').toString('utf8').trim()) fail('The booking HTML engine differs from the canonical engine. Rebuild the booking HTML.');
  const context = vm.createContext({BOOKING_TEMPLATES: templates}, {codeGeneration: {strings: false, wasm: false}});
  try { vm.runInContext(engine, context, {timeout: 1000}); }
  catch { fail('The booking engine could not be loaded.'); }
  if (!context.BookingEngine || typeof context.BookingEngine.evaluate !== 'function') fail('The booking engine has no evaluator.');
  return {context, templates};
}

function validatePacket(packet, inputPath) {
  const errors = [];
  const issue = message => errors.push(message);
  if (!object(packet) || !object(packet.state)) fail('Input must be an object containing a state object.');
  const state = packet.state;
  if (!Array.isArray(packet.sources) || !packet.sources.length || packet.sources.length > 50) fail('Provide 1–50 local source records.');
  if (!Array.isArray(packet.evidence) || !packet.evidence.length || packet.evidence.length > 1000) fail('Provide field-linked source evidence.');
  if (packet.approvedDefaults !== undefined && !Array.isArray(packet.approvedDefaults)) fail('approvedDefaults must be an array of fixed field/rule entries.');
  const sources = new Map();
  for (const source of packet.sources) {
    if (!object(source) || !/^[a-zA-Z0-9_-]{1,64}$/.test(source.id || '') || !nonempty(source.path) || !/^[a-fA-F0-9]{64}$/.test(source.sha256 || '')) {
      issue('Each source needs an id, local path and SHA-256 digest.'); continue;
    }
    if (sources.has(source.id)) { issue('Source ids must be unique.'); continue; }
    if (source.role !== undefined && !['record', 'clinician_instruction'].includes(source.role)) { issue('Source role must be record or clinician_instruction.'); continue; }
    const sourcePath = privatePath(path.resolve(path.dirname(inputPath), source.path));
    const bytes = read(sourcePath, 4 * 1024 * 1024, 'Source');
    if (sha256(bytes) !== source.sha256.toLowerCase()) { issue('A source checksum does not match the current file. Re-read the source before drafting.'); continue; }
    sources.set(source.id, {text: bytes.toString('utf8'), role: source.role || 'record'});
  }
  const get = field => field.split('.').reduce((value, key) => value !== null && typeof value === 'object' && Object.hasOwn(value, key) ? value[key] : undefined, state);
  const fieldValid = field => typeof field === 'string' && field.length <= 160 && /^(?:appointments\.\d+\.)?(?:procedures\.\d+(?:\.(?:kind|side|guidance|targets))?|duration|steroid|purpose|dependsOn|condition)$/.test(field) ||
    typeof field === 'string' && /^(?:(?:ac|ap)\.(?:status|drugs(?:\.\d+)?|plan|custom)|platelets\.(?:status|count|date|decision)|scheduling\.(?:mode|instructions)|ativan|phenolPronoun)$/.test(field);
  const evidence = new Map();
  for (const entry of packet.evidence) {
    if (!object(entry) || !fieldValid(entry.field) || get(entry.field) === undefined || !nonempty(entry.quote) || entry.quote.length > 20000) {
      issue('Evidence must name an existing supported state field and a nonempty exact source quote.'); continue;
    }
    const source = sources.get(entry.sourceId);
    if (!source || !source.text.includes(entry.quote)) { issue(`Evidence for ${entry.field} does not match a verified source quote.`); continue; }
    const records = evidence.get(entry.field) || [];
    records.push({quote: entry.quote, role: source.role}); evidence.set(entry.field, records);
  }
  const defaults = new Map();
  for (const entry of packet.approvedDefaults || []) {
    if (!object(entry) || !fieldValid(entry.field) || typeof entry.rule !== 'string' || defaults.has(entry.field)) { issue('Each approved default needs one supported field and one fixed rule.'); continue; }
    const value = get(entry.field);
    const allowed = (entry.rule === 'duration_30' && /^(?:appointments\.\d+\.)?duration$/.test(entry.field) && value === 30) ||
      (entry.rule === 'ativan_ask' && entry.field === 'ativan' && value === 'ask') ||
      (entry.rule === 'reviewed_undocumented_medication' && /^(?:ac|ap)\.status$/.test(entry.field) && value === 'undocumented') ||
      (entry.rule === 'clinic_anticoagulant_continuation' && entry.field === 'ac.plan' && value === 'auto');
    if (!allowed) { issue('An approved default is unsupported or does not match its field value.'); continue; }
    defaults.set(entry.field, entry.rule);
  }
  const requireEvidence = (field, clinician = false) => {
    const entries = evidence.get(field) || [];
    const valid = clinician ? entries.some(entry => entry.role === 'clinician_instruction' && !/^(?:approved|yes|ok(?:ay)?|reviewed|confirmed|agreed|done)[\s.!]*$/i.test(entry.quote.trim())) : entries.length > 0;
    if (!valid) issue(`${field}: ${clinician ? 'an exact quoted clinician instruction' : 'source evidence'} is required.`);
  };
  const requireDefaultOrEvidence = (field, clinician = false) => { if (!defaults.has(field)) requireEvidence(field, clinician); };
  const hasAppointments = own(state, 'appointments');
  const appointments = hasAppointments ? state.appointments : [{procedures: state.procedures, duration: state.duration, steroid: state.steroid}];
  if (!Array.isArray(appointments) || !appointments.length || appointments.length > 20) issue('Provide 1–20 appointments or the legacy single-appointment fields.');
  else appointments.forEach((appointment, index) => {
    const prefix = hasAppointments ? `appointments.${index}.` : '';
    if (!object(appointment) || !Array.isArray(appointment.procedures) || !appointment.procedures.length || appointment.procedures.length > 20) { issue(`${prefix}procedures: provide 1–20 procedure objects.`); return; }
    if (!Number.isInteger(appointment.duration) || appointment.duration < 1 || appointment.duration > 240) issue(`${prefix}duration: use an integer number of minutes from 1 to 240.`);
    if (typeof appointment.steroid !== 'string') issue(`${prefix}steroid: use a supported text selection.`);
    if (hasAppointments && typeof appointment.condition !== 'string') issue(`${prefix}condition: use a text condition or an empty string.`);
    appointment.procedures.forEach((procedure, procedureIndex) => {
      const field = `${prefix}procedures.${procedureIndex}`;
      if (!object(procedure)) { issue(`${field}: a procedure object is required.`); return; }
      if (['kind', 'side', 'guidance', 'targets'].some(key => typeof procedure[key] !== 'string')) issue(`${field}: kind, side, guidance and targets must be text fields.`);
      if (evidence.has(field)) requireEvidence(field);
      else for (const key of ['kind', 'side', 'guidance', ...(nonempty(procedure.targets) ? ['targets'] : [])]) requireEvidence(`${field}.${key}`);
    });
    requireDefaultOrEvidence(prefix + 'duration', true);
    requireEvidence(prefix + 'steroid');
    if (hasAppointments && appointment.purpose !== 'routine') requireEvidence(prefix + 'purpose');
    if (appointment.dependsOn !== undefined && appointment.dependsOn !== null) {
      requireEvidence(prefix + 'dependsOn', true); requireEvidence(prefix + 'condition', true);
    } else if (nonempty(appointment.condition)) issue(`${prefix}condition: a condition requires an earlier-appointment dependency.`);
  });
  if (state.scheduling !== undefined && (!object(state.scheduling) || typeof state.scheduling.mode !== 'string' || typeof state.scheduling.instructions !== 'string')) issue('scheduling: mode and instructions must be text fields in an object.');
  if (Array.isArray(appointments) && appointments.length > 1) requireEvidence('scheduling.mode', true);
  if (object(state.scheduling) && nonempty(state.scheduling.instructions)) requireEvidence('scheduling.instructions', true);
  for (const which of ['ac', 'ap']) {
    const medication = state[which];
    if (!object(medication) || !Array.isArray(medication.drugs)) { issue(`${which}: provide medication status, drug array and management fields.`); continue; }
    if (medication.drugs.some(drug => !nonempty(drug)) || ['status', 'plan', 'custom'].some(key => typeof medication[key] !== 'string')) issue(`${which}: status, plan, custom and drug names must be text fields.`);
    // Absence is a source-review conclusion, so even the authorized undocumented
    // draft default needs an excerpt from the reviewed medication material.
    requireEvidence(which + '.status');
    if (medication.status === 'undocumented' && !defaults.has(which + '.status')) issue(`${which}.status: explicitly record the reviewed_undocumented_medication draft default.`);
    if (medication.status === 'yes') {
      if (evidence.has(which + '.drugs')) requireEvidence(which + '.drugs');
      else medication.drugs.forEach((_, index) => requireEvidence(`${which}.drugs.${index}`));
      if (which === 'ac' && medication.plan === 'auto') {
        if (!defaults.has('ac.plan')) issue('ac.plan: explicitly record the clinic_anticoagulant_continuation default.');
      } else requireEvidence(which + '.plan', true);
      if (medication.plan === 'custom') requireEvidence(which + '.custom', true);
    }
  }
  const platelet = state.platelets;
  if (!object(platelet)) issue('platelets: provide reviewed result availability.');
  else {
    requireEvidence('platelets.status');
    if (platelet.status === 'available') {
      if (!['number', 'string'].includes(typeof platelet.count)) issue('platelets.count: use a numeric count.');
      if (platelet.date !== undefined && typeof platelet.date !== 'string') issue('platelets.date: use a text date.');
      requireEvidence('platelets.count');
      if (nonempty(platelet.date) && platelet.date !== 'date not supplied') requireEvidence('platelets.date');
      if (Number(platelet.count) < 100 && platelet.decision !== 'cbc') requireEvidence('platelets.decision', true);
    }
    if (platelet.decision === 'cbc') requireEvidence('platelets.decision', true);
  }
  requireDefaultOrEvidence('ativan');
  if (state.phenolPronoun && state.phenolPronoun !== 'them') requireEvidence('phenolPronoun');
  if (state.reviewed !== true) issue('reviewed: the drafting assistant must review the source facts and selected plan.');
  return errors;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    const key = argv[index];
    if (key === '--help') { options.help = true; continue; }
    if (!['--input', '--output', '--html', '--preferences'].includes(key) || !argv[index + 1] || argv[index + 1].startsWith('--') || own(options, key.slice(2))) fail('Use --input FILE [--output FILE] [--html FILE] [--preferences FILE].');
    options[key.slice(2)] = path.resolve(argv[++index]);
  }
  if (!options.help && !options.input) fail('A local JSON packet is required: --input FILE.');
  return options;
}

function main(argv) {
  let output;
  try {
    const options = parseArgs(argv);
    if (options.help) {
      process.stdout.write('Usage: node render_booking.cjs --input /tmp/booking.json [--output /tmp/booking.txt] [--html FILE] [--preferences FILE]\nRead references/booking-workflow.md for the source/evidence packet. Local drafting only; no transmission or clinical validation.\n'); return 0;
    }
    const input = privatePath(options.input);
    output = options.output ? privatePath(options.output, true) : null;
    const identity = file => { try { return fs.realpathSync(file); } catch { return file; } };
    if (output && identity(output) === identity(input)) fail('Output must not replace the input packet.');
    let packet;
    try { packet = JSON.parse(read(input, 1024 * 1024, 'Input packet').toString('utf8')); }
    catch { fail('Input packet must be readable valid JSON within 1 MiB.'); }
    if (output && Array.isArray(packet.sources) && packet.sources.some(source => object(source) && nonempty(source.path) && identity(path.resolve(path.dirname(input), source.path)) === identity(output))) fail('Output must not replace a source file.');
    const errors = validatePacket(packet, input);
    if (errors.length) fail(errors.slice(0, 50).join('\n'));
    const {context} = loadEngine(options);
    context.BOOKING_STATE = packet.state;
    let result;
    try { result = vm.runInContext('BookingEngine.evaluate(BOOKING_STATE, BOOKING_TEMPLATES)', context, {timeout: 1000}); }
    catch { fail('The booking engine failed while evaluating the packet.'); }
    if (!result || result.ready !== true || !Array.isArray(result.issues) || result.issues.length || typeof result.text !== 'string' || !result.text.startsWith('Please book:')) {
      const issues = result && Array.isArray(result.issues) ? result.issues.map(item => typeof item.message === 'string' ? item.message.replace(/[\r\n]+/g, ' ').slice(0, 400) : 'Resolve an engine issue.') : [];
      fail(['The booking engine withheld output.', ...issues.slice(0, 30)].join('\n'));
    }
    const text = result.text + '\n';
    if (output) {
      const temporary = path.join(path.dirname(output), `.booking-${process.pid}-${crypto.randomBytes(6).toString('hex')}.tmp`);
      try { fs.writeFileSync(temporary, text, {encoding: 'utf8', mode: 0o600, flag: 'wx'}); fs.renameSync(temporary, output); }
      catch { try { fs.unlinkSync(temporary); } catch {} fail('Booking output could not be written.'); }
    } else process.stdout.write(text);
    return 0;
  } catch (error) {
    process.stderr.write(`Booking not issued:\n${error.message}\nNo new booking output was issued; any existing output file was left unchanged.\n`);
    return 1;
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));
module.exports = {main, validatePacket, sha256};
