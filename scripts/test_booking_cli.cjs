#!/usr/bin/env node
'use strict';
// Synthetic source material only; all encounter-like files are created in /tmp.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {sha256} = require('./render_booking.cjs');
const engine = require('./booking_engine.cjs');

const root = path.resolve(__dirname, '..');
const cli = path.join(__dirname, 'render_booking.cjs');
const html = fs.readFileSync(path.join(root, 'booking-builder.html'), 'utf8');
const templates = JSON.parse(html.match(/<script id="booking-templates"[^>]*>([\s\S]*?)<\/script>/)[1]);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pain-partner-booking-cli-'));
let sequence = 0;
let passed = 0;

function fixture() {
  const directory = path.join(temporary, String(++sequence)); fs.mkdirSync(directory);
  const state = engine.initialState();
  Object.assign(state, {procedures: [{kind: 'sij', side: 'RIGHT', guidance: 'US', targets: ''}], duration: 30, steroid: 'no', reviewed: true});
  state.ac.status = 'no'; state.ap.status = 'no'; state.platelets.status = 'unavailable';
  const packet = {state, sources: [], evidence: [], approvedDefaults: [{field: 'duration', rule: 'duration_30'}, {field: 'ativan', rule: 'ativan_ask'}]};
  const texts = {record: 'Synthetic record. No anticoagulant reported. No non-ASA antiplatelet reported. No platelet result supplied.\n', clinician: 'Synthetic clinician instructions. Please book US RIGHT SIJ IA injection, no steroid.\n'};
  for (const [id, text] of Object.entries(texts)) {
    const file = path.join(directory, id + '.txt'); fs.writeFileSync(file, text);
    packet.sources.push({id, path: file, sha256: sha256(Buffer.from(text)), role: id === 'clinician' ? 'clinician_instruction' : 'record'});
  }
  const cite = (field, quote, sourceId = 'record') => packet.evidence.push({field, sourceId, quote});
  const append = (sourceId, quote) => {
    const source = packet.sources.find(item => item.id === sourceId);
    fs.appendFileSync(source.path, quote + '\n'); source.sha256 = sha256(fs.readFileSync(source.path));
    return quote;
  };
  cite('procedures.0', 'Please book US RIGHT SIJ IA injection, no steroid.', 'clinician');
  cite('steroid', 'Please book US RIGHT SIJ IA injection, no steroid.', 'clinician');
  cite('ac.status', 'No anticoagulant reported.');
  cite('ap.status', 'No non-ASA antiplatelet reported.');
  cite('platelets.status', 'No platelet result supplied.');
  return {directory, packet, cite, append};
}

function run(f, args = [], script = cli) {
  const input = path.join(f.directory, 'packet.json'); fs.writeFileSync(input, JSON.stringify(f.packet));
  return spawnSync(process.execPath, [script, '--input', input, ...args], {encoding: 'utf8', timeout: 5000});
}
function success(result) { assert.equal(result.status, 0, result.stderr); assert.equal(result.stderr, ''); }
function blocked(result, pattern) { assert.equal(result.status, 1, result.stderr); assert.equal(result.stdout, ''); assert.match(result.stderr, pattern); assert.match(result.stderr, /No new booking output was issued/); }
function test(name, callback) { callback(); passed++; process.stdout.write(`PASS ${name}\n`); }
function knownAc(f, plan = 'auto') {
  f.packet.state.ac = {status: 'yes', drugs: ['edoxaban'], plan, custom: '', reviewed: true};
  f.packet.evidence = f.packet.evidence.filter(entry => entry.field !== 'ac.status');
  const quote = f.append('record', 'Current medication: edoxaban.');
  f.cite('ac.status', quote); f.cite('ac.drugs', quote);
}

try {
  test('real HTML renders only the exact canonical booking text', () => {
    const f = fixture(), result = run(f); success(result);
    assert.equal(result.stdout, engine.evaluate(f.packet.state, templates).text + '\n');
    assert.doesNotMatch(result.stdout, /Platelets:/);
  });
  test('atomic output has private permissions and stdout stays empty', () => {
    const f = fixture(), output = path.join(f.directory, 'booking.txt'), result = run(f, ['--output', output]);
    success(result); assert.equal(result.stdout, '');
    assert.equal(fs.readFileSync(output, 'utf8'), engine.evaluate(f.packet.state, templates).text + '\n');
    assert.equal(fs.statSync(output).mode & 0o777, 0o600);
  });
  test('missing procedure source evidence blocks output', () => {
    const f = fixture(); f.packet.evidence = f.packet.evidence.filter(entry => entry.field !== 'procedures.0');
    blocked(run(f), /procedures\.0\.kind.*source evidence/);
  });
  test('changed source content is rejected without leaking its contents', () => {
    const f = fixture(); fs.appendFileSync(f.packet.sources[0].path, 'SYNTHETIC_PRIVATE_MARKER');
    const result = run(f); blocked(result, /checksum does not match/); assert.doesNotMatch(result.stderr, /SYNTHETIC_PRIVATE_MARKER/);
  });
  test('fabricated quote is rejected', () => {
    const f = fixture(); f.packet.evidence[0].quote = 'Not present in the synthetic source.';
    blocked(run(f), /does not match a verified source quote/);
  });
  test('unknown or broad approved-default strings cannot authorize a plan', () => {
    const f = fixture(); f.packet.approvedDefaults.push({field: 'ac.plan', rule: 'approved'});
    blocked(run(f), /approved default is unsupported/);
  });
  test('explicit plan requires a clinician-instruction source', () => {
    const f = fixture(); knownAc(f, 'continue');
    f.cite('ac.plan', f.append('record', 'Continue edoxaban for the SIJ injection.'));
    blocked(run(f), /ac\.plan.*exact quoted clinician instruction/);
  });
  test('bare approval in a clinician-labelled source is insufficient', () => {
    const f = fixture(); knownAc(f, 'continue'); f.cite('ac.plan', f.append('clinician', 'approved'), 'clinician');
    blocked(run(f), /ac\.plan.*exact quoted clinician instruction/);
  });
  test('source-backed explicit continuation renders without invented review claims', () => {
    const f = fixture(); knownAc(f, 'continue'); f.cite('ac.plan', f.append('clinician', 'Continue edoxaban for the SIJ injection.'), 'clinician');
    const result = run(f); success(result); assert.match(result.stdout, /edoxaban\. Continue; no hold required\./); assert.doesNotMatch(result.stdout, /clinician review completed/i);
  });
  test('clinic continuation requires its explicit default marker', () => {
    const f = fixture(); knownAc(f); blocked(run(f), /clinic_anticoagulant_continuation/);
    f.packet.approvedDefaults.push({field: 'ac.plan', rule: 'clinic_anticoagulant_continuation'}); success(run(f));
  });
  test('undocumented medication status needs both review evidence and default marker', () => {
    const f = fixture(); f.packet.state.ac.status = 'undocumented';
    blocked(run(f), /reviewed_undocumented_medication/);
    f.packet.approvedDefaults.push({field: 'ac.status', rule: 'reviewed_undocumented_medication'}); success(run(f));
    f.packet.evidence = f.packet.evidence.filter(entry => entry.field !== 'ac.status'); blocked(run(f), /ac\.status.*source evidence/);
  });
  test('source-backed two-branch plan retains both complete branches', () => {
    const f = fixture(); knownAc(f, 'two_day');
    f.cite('ac.plan', f.append('clinician', 'Use the two-day Tuesday and Wednesday edoxaban schedule for this procedure.'), 'clinician');
    const result = run(f); success(result); templates.acBranches.forEach(branch => assert.ok(result.stdout.includes(branch)));
  });
  test('custom instructions need their own exact clinician-source quote', () => {
    const f = fixture(); knownAc(f, 'custom'); f.packet.state.ac.custom = 'Last dose: clinician-specified day.\nNo doses: clinician-specified period.\nRestart: clinician-specified day.';
    f.cite('ac.plan', f.append('clinician', 'Use the following individualized edoxaban plan.'), 'clinician');
    blocked(run(f), /ac\.custom.*exact quoted clinician instruction/);
    f.cite('ac.custom', f.append('clinician', f.packet.state.ac.custom), 'clinician'); success(run(f));
  });
  test('available count at least 100 needs no decision or invented date', () => {
    const f = fixture(); f.packet.state.platelets = {status: 'available', count: 188, date: '', decision: ''};
    f.packet.evidence = f.packet.evidence.filter(entry => entry.field !== 'platelets.status');
    const quote = f.append('record', 'Platelets 188 ×10⁹/L; sample date not supplied.'); f.cite('platelets.status', quote); f.cite('platelets.count', quote);
    const result = run(f); success(result); assert.doesNotMatch(result.stdout, /Platelets:/);
  });
  test('CBC action with no count requires a clinician instruction', () => {
    const f = fixture(); f.packet.state.platelets.decision = 'cbc';
    blocked(run(f), /platelets\.decision.*exact quoted clinician instruction/);
    f.cite('platelets.decision', f.append('clinician', 'Obtain and review CBC before the procedure.'), 'clinician');
    const result = run(f); success(result); assert.match(result.stdout, /Obtain\/review CBC before the procedure\./); assert.doesNotMatch(result.stdout, /Platelets:/);
  });
  test('low count cannot proceed without an exact clinician decision', () => {
    const f = fixture(); f.packet.state.platelets = {status: 'available', count: 88, date: '', decision: 'proceed'};
    f.packet.evidence = f.packet.evidence.filter(entry => entry.field !== 'platelets.status');
    const quote = f.append('record', 'Platelets 88 ×10⁹/L; sample date not supplied.'); f.cite('platelets.status', quote); f.cite('platelets.count', quote);
    blocked(run(f), /platelets\.decision.*exact quoted clinician instruction/);
    f.cite('platelets.decision', f.append('clinician', 'Proceed with the planned procedure with platelets 88.'), 'clinician');
    const result = run(f); success(result); assert.match(result.stdout, /Platelets: 88.*date not supplied.*Proceed per clinician decision/);
  });
  test('appointment procedures, scheduling and dependencies each require evidence', () => {
    const f = fixture(), s = f.packet.state;
    s.appointments = [{procedures: s.procedures, duration: 30, steroid: 'no', purpose: 'diagnostic', dependsOn: null, condition: ''}, {procedures: [{kind: 'phenol', side: 'RIGHT', guidance: 'US', targets: 'synthetic sensory nerve'}], duration: 30, steroid: 'no', purpose: 'treatment', dependsOn: 1, condition: 'the diagnostic block provides sufficient relief and Dr. Tian confirms treatment'}];
    s.scheduling = {mode: 'separate_days', instructions: ''};
    f.packet.evidence = f.packet.evidence.filter(entry => !['procedures.0', 'steroid'].includes(entry.field));
    f.packet.approvedDefaults = [{field: 'ativan', rule: 'ativan_ask'}, ...[0, 1].map(i => ({field: `appointments.${i}.duration`, rule: 'duration_30'}))];
    const first = f.append('clinician', 'Please book a diagnostic US RIGHT SIJ IA injection, no steroid.');
    const second = f.append('clinician', 'Possible treatment with US RIGHT synthetic sensory nerve phenol neurolysis without steroid only after the diagnostic block provides sufficient relief and Dr. Tian confirms treatment.');
    for (const suffix of ['procedures.0', 'steroid', 'purpose']) { f.cite('appointments.0.' + suffix, first, 'clinician'); f.cite('appointments.1.' + suffix, second, 'clinician'); }
    f.cite('appointments.1.dependsOn', second, 'clinician'); f.cite('appointments.1.condition', second, 'clinician');
    blocked(run(f), /scheduling\.mode.*exact quoted clinician instruction/);
    f.cite('scheduling.mode', f.append('clinician', 'Book these appointments on separate days.'), 'clinician');
    const result = run(f); success(result); assert.match(result.stdout, /- Day 1:/); assert.match(result.stdout, /- Day 2: Possible/); assert.match(result.stdout, /only if the diagnostic block/); assert.match(result.stdout, /Medicine Shoppe/);
    f.packet.evidence = f.packet.evidence.filter(entry => entry.field !== 'appointments.1.condition'); blocked(run(f), /appointments\.1\.condition.*clinician instruction/);
  });
  test('engine rejection produces no draft and retains a pre-existing output unchanged', () => {
    const f = fixture(); f.packet.state.procedures[0].guidance = 'unsupported';
    const output = path.join(f.directory, 'prior-output.txt'); fs.writeFileSync(output, 'previous draft: do not use as a new result');
    blocked(run(f, ['--output', output]), /engine withheld output/);
    assert.equal(fs.readFileSync(output, 'utf8'), 'previous draft: do not use as a new result');
  });
  test('missing assistant review blocks without requiring imaginary clinician review', () => {
    const f = fixture(); f.packet.state.reviewed = false; blocked(run(f), /drafting assistant must review/);
  });
  test('non-text scheduling cannot bypass its evidence check through coercion', () => {
    const f = fixture(); f.packet.state.scheduling = {mode: 'custom', instructions: {unsupported: 'value'}};
    blocked(run(f), /scheduling: mode and instructions must be text fields/);
  });
  test('non-text appointment conditions are rejected before engine coercion', () => {
    const f = fixture(), s = f.packet.state;
    s.appointments = [{procedures: s.procedures, duration: 30, steroid: 'no', purpose: 'routine', dependsOn: null, condition: {unsupported: 'value'}}];
    f.packet.evidence = f.packet.evidence.map(entry => ['procedures.0', 'steroid'].includes(entry.field) ? {...entry, field: 'appointments.0.' + entry.field} : entry);
    f.packet.approvedDefaults[0].field = 'appointments.0.duration';
    blocked(run(f), /appointments\.0\.condition: use a text condition/);
  });
  test('stale template preferences checksum blocks output', () => {
    const f = fixture(), altered = path.join(f.directory, 'stale.html');
    fs.writeFileSync(altered, html.replace(templates.source_sha256, '0'.repeat(64)));
    blocked(run(f, ['--html', altered, '--preferences', path.join(root, 'WORKFLOW-PREFERENCES.md')]), /templates are stale/);
  });
  test('noncanonical embedded engine blocks output', () => {
    const f = fixture(), altered = path.join(f.directory, 'altered.html');
    fs.writeFileSync(altered, html.replace('<script id="booking-engine">', '<script id="booking-engine">\n// unbuilt change'));
    blocked(run(f, ['--html', altered, '--preferences', path.join(root, 'WORKFLOW-PREFERENCES.md')]), /differs from the canonical engine/);
  });
  test('repository output and input/source replacement are prevented', () => {
    const f = fixture(); blocked(run(f, ['--output', path.join(root, 'do-not-create-patient-output.txt')]), /outside the repository/);
    blocked(run(f, ['--output', path.join(f.directory, 'packet.json')]), /must not replace the input/);
    blocked(run(f, ['--output', f.packet.sources[0].path]), /must not replace a source/);
  });
  test('malformed input fails closed without echoing clinical content', () => {
    const input = path.join(temporary, 'bad.json'); fs.writeFileSync(input, '{SYNTHETIC_PRIVATE_MARKER');
    const result = spawnSync(process.execPath, [cli, '--input', input], {encoding: 'utf8'});
    blocked(result, /valid JSON/); assert.doesNotMatch(result.stderr, /SYNTHETIC_PRIVATE_MARKER/);
  });
  test('packaged scripts/assets/references paths work without flags', () => {
    const bundle = path.join(temporary, 'bundle'); for (const name of ['scripts', 'assets', 'references']) fs.mkdirSync(path.join(bundle, name), {recursive: true});
    for (const name of ['render_booking.cjs', 'booking_engine.cjs']) fs.copyFileSync(path.join(__dirname, name), path.join(bundle, 'scripts', name));
    fs.writeFileSync(path.join(bundle, 'assets', 'booking-builder.html'), html);
    fs.copyFileSync(path.join(root, 'WORKFLOW-PREFERENCES.md'), path.join(bundle, 'references', 'preferences.md'));
    const result = run(fixture(), [], path.join(bundle, 'scripts', 'render_booking.cjs')); success(result); assert.match(result.stdout, /^Please book:/);
  });
  process.stdout.write(`${passed} booking CLI checks passed.\n`);
} finally { fs.rmSync(temporary, {recursive: true, force: true}); }
