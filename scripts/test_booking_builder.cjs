// Synthetic booking-engine regressions. No patient records or identifiers.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'booking-builder.html'), 'utf8');
function scriptBlock(id) {
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attr = match[1].match(/\bid\s*=\s*(["'])(.*?)\1/i);
    if (attr && attr[2] === id) return match[2];
  }
  throw new Error(`Missing HTML script block: ${id}`);
}
const templates = JSON.parse(scriptBlock('booking-templates'));
const context = vm.createContext({BOOKING_TEMPLATES: templates});
const canonicalEngine = fs.readFileSync(path.join(__dirname, 'booking_engine.cjs'), 'utf8');
vm.runInContext(canonicalEngine, context, {filename: 'booking_engine.cjs'});
const engine = context.BookingEngine;
assert(engine && typeof engine.initialState === 'function' && typeof engine.makeAppointment === 'function' && typeof engine.evaluate === 'function',
  'The canonical engine must expose both legacy and appointment APIs.');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed++; }
  catch (error) { failures.push({name, error}); }
}
function procedure(kind = 'lumbar_facet') {
  const targets = {
    lumbar_facet: 'L4–5, L5–S1', lumbar_mbb: 'L3, L4 MBB + L5 DR block', lumbar_rfa: 'L3, L4 + L5 DR',
    cervical_facet: 'C4–5', cervical_mbb: 'TON + C3–C5', cervical_rfa: 'C3–C5',
    sij: 'SIJ', superficial_tpi: 'trapezius', gon: 'greater occipital nerve',
    tfesi: 'L5 (L5–S1)', ilesi: 'L4–5', caudal: 'caudal epidural', deep_nerve: 'deep peripheral nerve',
    other: 'clinician-selected target',
  };
  return {kind, side: ['ilesi', 'caudal'].includes(kind) ? 'MIDLINE' : 'LEFT',
    guidance: ['superficial_tpi', 'gon', 'deep_nerve'].includes(kind) ? 'US' : 'Fluoro',
    targets: targets[kind] || 'supplied target'};
}
function baseline(kind = 'lumbar_facet') {
  const s = engine.initialState();
  s.procedures = [procedure(kind)];
  s.duration = 30;
  s.ac = {status: 'no', drugs: [], plan: 'auto', custom: '', reviewed: false};
  s.ap = {status: 'no', drugs: [], plan: '', custom: '', reviewed: false};
  s.platelets = {status: 'available', count: '236', date: '2026-10-15', decision: 'proceed'};
  s.steroid = 'no';
  s.ativan = 'ask';
  s.reviewed = true;
  return s;
}
function ready(s) {
  const r = engine.evaluate(s);
  assert.equal(r.ready, true, JSON.stringify(r.issues));
  assert.equal(typeof r.text, 'string');
  assert(r.text.trim(), 'A ready handoff must contain text.');
  assert(Array.isArray(r.issues));
  assert.equal(r.issues.length, 0, JSON.stringify(r.issues));
  return r;
}
function blocked(s) {
  const r = engine.evaluate(s);
  assert.equal(r.ready, false, 'Incomplete or conflicting facts must not produce a ready handoff.');
  assert(Array.isArray(r.issues) && r.issues.length > 0, 'Explain the unresolved fields.');
  for (const issue of r.issues) {
    assert.equal(typeof issue.field, 'string');
    assert.equal(typeof issue.message, 'string');
    assert(issue.message.trim());
  }
  return r;
}
function knownAc(s, plan = 'auto', drug = 'apixaban') {
  s.ac = {status: 'yes', drugs: [drug], plan, custom: '', reviewed: plan !== 'auto'};
  return s;
}
function knownAp(s, plan = 'seven_day', drug = 'clopidogrel') {
  s.ap = {status: 'yes', drugs: [drug], plan, custom: '', reviewed: true};
  return s;
}
function occurrences(text, exact) { return text.split(exact).length - 1; }

test('canonical templates preserve the approved two-branch and clopidogrel wording', () => {
  const prefs = fs.readFileSync(path.join(root, 'WORKFLOW-PREFERENCES.md'), 'utf8');
  const approved = prefs.split('<!-- approved-two-day-anticoagulant:start -->')[1]
    ?.split('<!-- approved-two-day-anticoagulant:end -->')[0];
  assert(approved, 'Preferences must retain the authoritative two-branch block.');
  assert(Array.isArray(templates.acBranches));
  assert.equal(templates.acBranches.length, 2);
  assert.equal(templates.acBranches[0],
    'If procedure on Tuesday, last day of blood thinner on Saturday (none on Sunday and onward). Restart on Wednesday if all feels well.');
  assert.equal(templates.acBranches[1],
    'If procedure on Wednesday, last day of blood thinner on Sunday (none on Monday and onward). Restart on Thursday if all feels well.');
  for (const branch of templates.acBranches) assert(approved.includes(branch));
  const clopidogrel = 'Antiplatelets (excluding ASA): Yes — clopidogrel. Hold — last dose one week before the procedure.\n' +
    'For example, if procedure on Tuesday, last dose on Tuesday the week before. No doses starting Wednesday.';
  assert.equal(templates.clopidogrel, clopidogrel);
  assert(prefs.includes(clopidogrel));
});

test('initial state is unresolved and independent between calls', () => {
  const a = engine.initialState();
  const b = engine.initialState();
  assert.equal(a.reviewed, false);
  assert.equal(a.ac.status, 'unreviewed');
  assert.equal(a.ap.status, 'unreviewed');
  assert.equal(a.platelets.status, 'unreviewed');
  blocked(a);
  a.procedures[0].targets = 'changed';
  a.ac.drugs.push('apixaban');
  assert.equal(b.procedures[0].targets, '');
  assert.equal(b.ac.drugs.length, 0);
});

test('complete baseline renders the requested compact booking fields', () => {
  const r = ready(baseline());
  assert.equal(r.category, 'continue');
  assert(r.text.startsWith('Please book:'));
  assert(r.text.includes('Procedure:'));
  assert(r.text.includes('Fluoro'));
  assert(r.text.includes('LEFT'));
  assert(r.text.includes('L4–5, L5–S1'));
  assert(r.text.includes('Duration: 30 minutes'));
  assert(r.text.includes('Anticoagulation: No. Please confirm.'));
  assert(r.text.includes('Antiplatelets (excluding ASA): No. Please confirm.'));
  assert(r.text.includes('Steroid: No'));
  assert(r.text.includes('Ativan: Please ask'));
  assert(!/driver|9\s*a\.?m\.?|72 hours|24 hours/i.test(r.text));
});

test('final clinician review is required even when all facts are populated', () => {
  const s = baseline(); s.reviewed = false; blocked(s);
});

test('unknown medication status cannot become the reviewed-absence default', () => {
  for (const field of ['ac', 'ap']) {
    const s = baseline(); s[field].status = 'unreviewed'; blocked(s);
  }
});

test('reviewed undocumented medication status uses the authorized draft negative', () => {
  const s = baseline(); s.ac.status = 'undocumented'; s.ap.status = 'undocumented';
  const r = ready(s);
  assert(r.text.includes('Anticoagulation: No. Please confirm.'));
  assert(r.text.includes('Antiplatelets (excluding ASA): No. Please confirm.'));
});

test('known medication names cannot be absent or silently overwritten by negative status', () => {
  for (const field of ['ac', 'ap']) {
    const unnamed = baseline(); unnamed[field].status = 'yes'; blocked(unnamed);
    for (const status of ['no', 'undocumented', 'conflict']) {
      const s = baseline(); s[field].status = status;
      s[field].drugs = [field === 'ac' ? 'apixaban' : 'clopidogrel']; blocked(s);
    }
  }
});

test('covered procedure families continue a known anticoagulant without inventing a hold', () => {
  for (const kind of ['lumbar_facet', 'lumbar_mbb', 'lumbar_rfa', 'cervical_facet', 'cervical_mbb', 'sij', 'superficial_tpi']) {
    const r = ready(knownAc(baseline(kind), 'auto', 'edoxaban'));
    assert.equal(r.category, 'continue', kind);
    assert(r.text.includes('Anticoagulation: Yes — edoxaban. Continue; no hold required.'), kind);
    assert(!r.text.includes(templates.acBranches[0]), kind);
  }
});

test('epidurals and deep peripheral blocks never receive automatic continuation', () => {
  for (const kind of ['tfesi', 'ilesi', 'caudal', 'deep_nerve']) {
    const r = blocked(knownAc(baseline(kind)));
    assert.equal(r.category, 'hold', kind);
    const continuation = knownAc(baseline(kind), 'continue');
    blocked(continuation);
  }
});

test('a mixed appointment containing an epidural requires an interruption plan', () => {
  const s = knownAc(baseline()); s.procedures.push(procedure('tfesi'));
  assert.equal(blocked(s).category, 'hold');
  s.ac.plan = 'two_day'; s.ac.reviewed = true;
  const r = ready(s);
  assert.equal(r.category, 'hold');
  assert(r.text.includes('L4–5, L5–S1') && r.text.includes('L5 (L5–S1)'));
});

test('cervical RFA and other unassigned procedures do not inherit continuation', () => {
  for (const kind of ['cervical_rfa', 'other']) {
    const r = blocked(knownAc(baseline(kind)));
    assert.equal(r.category, 'review', kind);
  }
});

test('an explicitly selected unknown-date schedule contains both exact branches once', () => {
  const s = knownAc(baseline('tfesi'), 'two_day');
  const r = ready(s);
  assert(r.text.includes('Anticoagulation: Yes — apixaban. Hold before the procedure.'));
  for (const branch of templates.acBranches) assert.equal(occurrences(r.text, branch), 1);
  assert(r.text.indexOf(templates.acBranches[0]) < r.text.indexOf(templates.acBranches[1]));
  assert(!/hold three days|hold 72 hours|9\s*a\.?m\.?/i.test(r.text));
});

test('the two-branch plan requires individualized clinician acknowledgment', () => {
  const s = knownAc(baseline('tfesi'), 'two_day'); s.ac.reviewed = false; blocked(s);
});

test('a shared two-branch plan cannot silently cover multiple anticoagulants', () => {
  const s = knownAc(baseline('tfesi'), 'two_day'); s.ac.drugs.push('warfarin'); blocked(s);
});

test('individualized anticoagulant wording is retained only after supplied-plan review', () => {
  const s = knownAc(baseline('tfesi'), 'custom'); blocked(s);
  s.ac.custom = 'Last dose: Monday before a Friday procedure.\nNo doses: Tuesday onward.\nRestart: Saturday if all feels well.';
  s.ac.reviewed = false; blocked(s);
  s.ac.reviewed = true;
  const r = ready(s);
  assert(r.text.includes('apixaban'));
  assert(r.text.includes(s.ac.custom));
  assert(!r.text.includes(templates.acBranches[0]));
});

test('custom anticoagulant labels each require their own completed instruction', () => {
  const instructions = ['Last dose: Monday before a Friday procedure.', 'No doses: Tuesday onward.', 'Restart: Saturday if all feels well.'];
  for (let missing = 0; missing < instructions.length; missing++) {
    const s = knownAc(baseline('tfesi'), 'custom');
    s.ac.custom = instructions.map((line, index) => index === missing ? line.split(':')[0] + ':' : line).join('\n');
    blocked(s);
  }
});

test('clopidogrel renders its exact one-example instruction without altering anticoagulation', () => {
  const s = knownAp(knownAc(baseline('tfesi'), 'two_day'));
  const r = ready(s);
  assert.equal(occurrences(r.text, templates.clopidogrel), 1);
  for (const branch of templates.acBranches) assert.equal(occurrences(r.text, branch), 1);
  assert.equal(occurrences(r.text, 'For example,'), 1);
});

test('known non-ASA antiplatelet management remains a separate reviewed decision', () => {
  const s = knownAp(baseline(), ''); blocked(s);
  s.ap.plan = 'seven_day'; s.ap.reviewed = false; blocked(s);
});

test('the clopidogrel seven-day template is not assigned to another antiplatelet', () => {
  for (const drug of ['ticagrelor', 'prasugrel']) {
    blocked(knownAp(baseline('tfesi'), 'seven_day', drug));
  }
});

test('ASA alone does not produce an ASA hold or confirmation prompt', () => {
  const s = baseline(); s.ap.status = 'asa_only';
  const r = ready(s);
  assert(r.text.includes('Antiplatelets (excluding ASA): No. Please confirm.'));
  assert(!/^ASA\s*:/im.test(r.text));
  assert(!/(?:hold|stop|confirm)\s+(?:the\s+)?ASA|ASA.{0,20}(?:hold|stop)/i.test(r.text));
  s.ap.drugs = ['clopidogrel']; blocked(s);
});

test('low platelets retain the supplied value and date without a safety verdict', () => {
  const s = baseline(); s.platelets.count = '99';
  const r = ready(s);
  assert(r.text.includes('99'));
  assert(r.text.includes('2026-10-15'));
  assert(!/normal platelet|platelets? (?:is|are) normal|safe threshold|safe to proceed/i.test(r.text));
  for (const field of ['count', 'decision']) {
    const incomplete = baseline(); incomplete.platelets.count = '99'; incomplete.platelets[field] = ''; blocked(incomplete);
  }
});

test('missing platelets omit the row without requiring a clinical decision', () => {
  const s = baseline();
  s.platelets = {status: 'unavailable', count: '', date: '', decision: ''};
  const r = ready(s);
  assert(!r.text.includes('Platelets:'));
  assert(!/normal platelet|platelets? (?:is|are) normal|CBC (?:has been )?ordered|platelet count (?:has been )?ordered/i.test(r.text));
});

test('steroid choice is explicit and Ativan remains a preference question', () => {
  const s = baseline(); s.steroid = ''; blocked(s);
  s.steroid = 'yes';
  const r = ready(s);
  assert(r.text.includes('Steroid: Yes'));
  assert(r.text.includes('Ativan: Please ask'));
  assert(!/Ativan.{0,40}\b\d+(?:\.\d+)?\s*mg/i.test(r.text));
});

test('procedure and duration omissions are surfaced without fabricated defaults', () => {
  const empty = baseline(); empty.procedures = []; blocked(empty);
  for (const field of ['kind', 'side', 'guidance', 'targets']) {
    const s = baseline(); s.procedures[0][field] = ''; blocked(s);
  }
  for (const duration of [0, -5, NaN, Infinity, true]) {
    const s = baseline(); s.duration = duration; blocked(s);
  }
  const s = baseline(); s.duration = 45;
  assert(ready(s).text.includes('Duration: 45 minutes'));
});

test('unrecognized extraction enums fail visibly rather than choosing a clinical branch', () => {
  for (const value of ['unrecognized', 'constructor', 'toString']) {
    const kind = baseline(); kind.procedures[0].kind = value; blocked(kind);
    const ativan = baseline(); ativan.ativan = value; blocked(ativan);
  }
  for (const field of ['ac', 'ap']) {
    const status = baseline(); status[field].status = 'unrecognized'; blocked(status);
    const action = field === 'ac' ? knownAc(baseline()) : knownAp(baseline());
    action[field].plan = 'unrecognized'; blocked(action);
  }
});

test('imported truthy values cannot stand in for explicit review booleans', () => {
  for (const value of ['false', 'true', 1]) {
    const s = baseline(); s.reviewed = value; blocked(s);
    const ac = knownAc(baseline('tfesi'), 'two_day'); ac.ac.reviewed = value; blocked(ac);
    const ap = knownAp(baseline()); ap.ap.reviewed = value; blocked(ap);
  }
});

test('evaluation preserves input facts and gives reproducible output', () => {
  const s = knownAp(knownAc(baseline('tfesi'), 'two_day'));
  const before = JSON.stringify(s);
  const first = ready(s);
  assert.equal(JSON.stringify(s), before);
  assert.equal(ready(s).text, first.text);
});

function appointment(kind = 'lumbar_facet', overrides = {}) {
  return Object.assign(engine.makeAppointment(), {procedures: [procedure(kind)], steroid: 'no'}, overrides);
}
function multiple(mode = 'separate_days') {
  const s = baseline();
  s.appointments = [appointment(), appointment('tfesi')];
  s.scheduling = {mode, instructions: ''};
  return s;
}

test('CommonJS and browser APIs use identical deterministic logic', () => {
  const cjs = require('./booking_engine.cjs');
  const s = knownAc(baseline('tfesi'), 'two_day');
  assert.equal(cjs.evaluate(s, templates).text, ready(s).text);
  assert.equal(typeof cjs.makeAppointment, 'function');
  const a = cjs.makeAppointment(); const b = cjs.makeAppointment();
  a.procedures[0].targets = 'changed';
  assert.equal(b.procedures[0].targets, '');
  assert.equal(b.dependsOn, null);
  assert.equal(b.purpose, 'routine');
});

test('platelet display boundary is below 100, including zero, without a safety verdict', () => {
  for (const count of ['0', '99', '99.9']) {
    const s = baseline(); s.platelets.count = count;
    const r = ready(s);
    assert(r.text.includes(`Platelets: ${count} ×10⁹/L`), count);
    assert(!/safe|normal|threshold/i.test(r.text));
  }
  for (const count of ['100', '236']) {
    const s = baseline(); s.platelets = {status: 'available', count, date: '', decision: ''};
    assert(!ready(s).text.includes('Platelets:'), count);
  }
});

test('unknown platelet source status blocks and invalid available counts cannot disappear', () => {
  const unreviewed = baseline(); unreviewed.platelets.status = 'unreviewed'; blocked(unreviewed);
  const unknown = baseline(); unknown.platelets.status = 'unknown'; blocked(unknown);
  for (const count of ['', '-1', 'unknown', 'Infinity', false, true]) {
    const s = baseline(); s.platelets.count = count; blocked(s);
  }
});

test('low platelets require a selected action and deferral cannot become ready to book', () => {
  const s = baseline(); s.platelets.count = '99'; s.platelets.decision = ''; blocked(s);
  s.platelets.decision = 'proceed'; assert(ready(s).text.includes('Proceed per clinician decision.'));
  s.platelets.decision = 'cbc'; assert(ready(s).text.includes('Obtain/review CBC before the procedure.'));
  s.platelets.decision = 'defer'; assert(blocked(s).text.includes('Defer booking pending Dr. Tian review.'));
  s.platelets.decision = 'unknown'; blocked(s);
});

test('low platelet date can be explicitly unavailable without inventing a sample date', () => {
  const s = baseline(); s.platelets.count = '99'; s.platelets.date = '';
  assert(ready(s).text.includes('(date not supplied)'));
  s.platelets.date = 'date not supplied'; assert(ready(s).text.includes('(date not supplied)'));
  for (const date of ['2026-02-30', 'yesterday']) { s.platelets.date = date; blocked(s); }
});

test('an explicit CBC decision remains an action without a normal or unavailable platelet row', () => {
  for (const platelets of [
    {status: 'available', count: '100', date: '', decision: 'cbc'},
    {status: 'unavailable', count: '', date: '', decision: 'cbc'},
  ]) {
    const s = baseline(); s.platelets = platelets;
    const text = ready(s).text;
    assert(!text.includes('Platelets:'));
    assert.equal(occurrences(text, 'Obtain/review CBC before the procedure.'), 1);
    assert(!/CBC (?:has been )?ordered|normal|safe/i.test(text));
  }
});

test('changing platelet availability cannot silently drop a recorded count', () => {
  for (const count of ['0', '99', '100', '236']) {
    const s = baseline(); s.platelets.count = count; s.platelets.status = 'unavailable';
    assert(blocked(s).issues.some(issue => /Known platelet count/.test(issue.message)));
  }
});

test('one new-shape appointment retains compact unnumbered legacy output', () => {
  const s = baseline();
  s.appointments = [appointment()];
  const r = ready(s);
  assert.equal(r.text, ready(baseline()).text);
  assert(!/Day 1|Appointment 1|Scheduling:/.test(r.text));
  // When appointments are supplied they own procedures, duration and steroid.
  s.procedures = []; s.duration = 0; s.steroid = '';
  assert.equal(ready(s).text, r.text);
});

test('multiple appointments require an explicit scheduling decision', () => {
  for (const mode of ['', 'unrecognized', 'constructor']) {
    const s = multiple(mode); blocked(s);
  }
  const custom = multiple('custom'); blocked(custom);
  custom.scheduling.instructions = 'Book two appointments after the clinician confirms availability.';
  assert(ready(custom).text.includes(custom.scheduling.instructions));
});

test('a single appointment retains explicit scheduling instructions without day numbering', () => {
  const s = baseline(); s.scheduling = {mode: 'custom', instructions: ''}; blocked(s);
  s.scheduling.instructions = 'Contact the surgeon before confirming the appointment.';
  const text = ready(s).text;
  assert(text.includes('Scheduling: '+s.scheduling.instructions));
  assert(!/Day 1|Appointment 1/.test(text));
});

test('separate-day and consecutive-day decisions remain distinct', () => {
  const separate = ready(multiple('separate_days')).text;
  const consecutive = ready(multiple('consecutive_days')).text;
  for (const text of [separate, consecutive]) {
    assert(text.includes('Procedure:\n- Day 1:'));
    assert(text.includes('\n- Day 2:'));
    assert(text.includes('Duration: 30 minutes per appointment'));
  }
  assert(separate.includes('Scheduling: Separate days.'));
  assert(!/consecutive/i.test(separate));
  assert(consecutive.includes('Scheduling: Consecutive days.'));
});

test('same-day and custom schedules use appointment labels and preserve instructions', () => {
  for (const mode of ['same_day', 'custom']) {
    const s = multiple(mode); s.scheduling.instructions = 'Confirm the local-stay arrangement with the patient.';
    const text = ready(s).text;
    assert(text.includes('- Appointment 1:') && text.includes('- Appointment 2:'));
    assert(!/Day [12]:/.test(text));
    assert(text.includes(s.scheduling.instructions));
  }
});

test('per-appointment duration and steroid remain separate', () => {
  const s = multiple(); s.appointments[0].duration = 20; s.appointments[1].duration = 45;
  s.appointments[0].steroid = 'no'; s.appointments[1].steroid = 'yes';
  const text = ready(s).text;
  assert(text.includes('Duration:\n- Day 1: 20 minutes\n- Day 2: 45 minutes'));
  assert(text.includes('Steroid:\n- Day 1: No\n- Day 2: Yes'));
  s.appointments[1].duration = 0; blocked(s);
  s.appointments[1].duration = 45; s.appointments[1].steroid = ''; blocked(s);
});

test('diagnostic appointments require no steroid before a conditional treatment', () => {
  const s = multiple();
  s.appointments[0] = appointment('diagnostic_sensory', {purpose: 'diagnostic', steroid: 'no'});
  s.appointments[1] = appointment('phenol', {purpose: 'treatment', dependsOn: 1, condition: 'the diagnostic response is reviewed and the clinician selects treatment'});
  const text = ready(s).text;
  assert(text.includes('Possible Fluoro'));
  assert(text.includes('after Day 1 only if the diagnostic response is reviewed'));
  assert(text.includes('Dr. Tian review required before proceeding.'));
  s.appointments[0].steroid = 'yes'; blocked(s);
});

test('dependent appointments require a condition and strictly earlier appointment reference', () => {
  const s = multiple(); s.appointments[1].dependsOn = 1;
  blocked(s);
  s.appointments[1].condition = 'the clinician approves the next step'; ready(s);
  for (const dependsOn of [0, 2, 3, '1', 1.5]) { s.appointments[1].dependsOn = dependsOn; blocked(s); }
  s.appointments[1].dependsOn = null; s.appointments[0].dependsOn = 1;
  s.appointments[0].condition = 'reviewed'; blocked(s);
});

test('dependent appointment conditions keep supplied punctuation without a duplicate period', () => {
  const s = multiple(); s.appointments[1].dependsOn = 1;
  s.appointments[1].condition = 'the clinician approves the next step.';
  const text = ready(s).text;
  assert(text.includes('next step. Dr. Tian review required'));
  assert(!text.includes('next step..'));
});

test('diagnostic sensory blocks forbid steroid even if purpose is mistakenly routine', () => {
  const s = baseline('diagnostic_sensory'); s.steroid = 'yes'; blocked(s);
  s.steroid = 'no'; ready(s);
  s.appointments = [appointment('diagnostic_sensory', {purpose: 'routine', steroid: 'yes'})]; blocked(s);
  s.appointments[0].steroid = 'no'; ready(s);
});

test('phenol and diagnostic sensory procedures require named targets and reviewed management', () => {
  for (const kind of ['phenol', 'diagnostic_sensory']) {
    const s = knownAc(baseline(kind));
    assert.equal(blocked(s).category, 'review');
    s.ac.plan = 'continue'; s.ac.reviewed = true; ready(s);
    s.procedures[0].targets = ''; blocked(s);
  }
});

test('phenol appends both canonical paragraphs once with only selected pronoun changes', () => {
  assert(Array.isArray(templates.phenol) && templates.phenol.length === 2);
  const prefs = fs.readFileSync(path.join(root, 'WORKFLOW-PREFERENCES.md'), 'utf8');
  for (const paragraph of templates.phenol) assert(prefs.includes(paragraph));
  for (const pronoun of ['her', 'him', 'them']) {
    const s = baseline('phenol'); s.phenolPronoun = pronoun;
    s.procedures.push(procedure('phenol'));
    const text = ready(s).text;
    for (const paragraph of templates.phenol) assert.equal(occurrences(text, paragraph.replace(/\bher\b/g, pronoun)), 1);
    assert(text.includes('Please book '+pronoun+' later in the day (after 11 a.m.)'));
  }
  const unspecified = baseline('phenol'); delete unspecified.phenolPronoun;
  assert(ready(unspecified).text.includes('Please book them later'));
  unspecified.phenolPronoun = 'unknown'; blocked(unspecified);
});

test('multi-appointment anticoagulation requires a plan covering the sequence', () => {
  const s = knownAc(multiple('consecutive_days'), 'two_day');
  const r = blocked(s);
  assert(r.issues.some(issue => /entire sequence/.test(issue.message)));
  for (const branch of templates.acBranches) assert(!r.text.includes(branch));
  s.ac.plan = 'custom';
  s.ac.custom = 'Last dose: Monday before the first appointment.\nNo doses: From Tuesday through both appointments.\nRestart: After the final appointment, at the clinician-selected time.';
  assert(ready(s).text.includes(s.ac.custom));
});

test('malformed appointment inputs report issues instead of throwing or silently selecting a plan', () => {
  for (const appointments of [null, {}, [], [null], [{procedures: [null]}]]) {
    const s = baseline(); s.appointments = appointments; blocked(s);
  }
  blocked({});
});

test('conditions, scheduling instructions and targets reject non-text facts', () => {
  for (const value of [true, false, {}, ['a condition'], 1, null]) {
    const conditional = multiple();
    conditional.appointments[1].dependsOn = 1;
    conditional.appointments[1].condition = value;
    assert(blocked(conditional).issues.some(issue => /condition must be text/.test(issue.message)));
    const single = baseline(); single.scheduling.instructions = value;
    assert(blocked(single).issues.some(issue => /instructions must be text/.test(issue.message)));
    for (const kind of ['lumbar_facet', 'sij']) {
      const target = baseline(kind); target.procedures[0].targets = value;
      assert(blocked(target).issues.some(issue => /targets must be text/.test(issue.message)));
    }
  }
});

for (const {name, error} of failures) {
  console.error(`FAIL: ${name}\n${error.stack || error}`);
}
if (failures.length) {
  console.error(`${failures.length} booking regression(s) failed; ${passed} passed.`);
  process.exitCode = 1;
} else {
  console.log(`PASS: ${passed} booking regressions covering source states, explicit decisions, canonical branches, separate antiplatelets, platelet review and invalid inputs.`);
}
