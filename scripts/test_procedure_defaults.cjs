// Synthetic generator regressions: no patient records or identifiers.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'procedure-note-builder.html'), 'utf8');
let code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(code);
code = code.replace('  bindStatic();\n  syncStaticValues();\n  renderAll();',
  '  globalThis.api={PROCS,makeItem,mixDefault,mixValue,mixText,injText,injectateBlock,procedureNote,buildNote,screenBlock,tailBlock,procedureLine,procName,diagnosticSelected,tonVol,inModality,unanswered,paragraphFor,state};');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(code, ctx);
const a = ctx.api;
Object.assign(a.state, {modality:'fluoro', date:'2026-01-15', infection:'no', contrast:'no', anticoag:'no', antiplatelet:'no', assist:''});
assert.equal(a.state.allergies, 'nkda');
assert(a.screenBlock().includes('Allergies: NKDA'));
a.state.allergyText = 'Example medication — rash';
assert(a.screenBlock().includes('Allergies: Example medication — rash'));
assert(!a.screenBlock().includes('Allergies: NKDA'));
a.state.allergyText = '';

// Approved concise titles are checked through the assembled note, not a mock
// formatter. All values are synthetic; counts/block numbers are supplied only in
// the cases where they are known.
function titleItem(key, lat, values = {}) {
  return Object.assign(a.makeItem(key, lat), values);
}
const titleCases = [
  ['fluoro', [titleItem('tfesi', 'right', {levels:['L5'], approach:'supraneural'})], 'RIGHT L5 TFESI (L5–S1), supraneural'],
  ['fluoro', [titleItem('tfesi', 'right', {levels:['S1'], approach:'supraneural'})], 'RIGHT S1 TFESI'],
  ['fluoro', [titleItem('lumbar_root_sequence', 'left', {levels:['L5'], intent:'root_only'})], 'LEFT L5 SNRB'],
  ['fluoro', [titleItem('l_ilesi', 'right', {levels:['L4/5']})], 'L4–5 ILESI'],
  ['fluoro', [titleItem('caudal', 'right')], 'Caudal ESI'],
  ['fluoro', [titleItem('lumbar_facet', 'bilateral', {levels:['L4/5','L5/S1']})], 'B/L L4–5, L5–S1 IA facets'],
  ['fluoro', [titleItem('l_mbb', 'right', {levels:['L3','L4','L5 dorsal ramus'], toggles:{diagnostic:true}, blockNumber:2})], 'RIGHT L3, L4 MBB + L5 DR block, diagnostic #2'],
  ['fluoro', [titleItem('c_mbb', 'left', {levels:['C3','C4','C5'], toggles:{ton:true,diagnostic:false}})], 'LEFT TON + C3–C5 MBB, therapeutic'],
  ['fluoro', [titleItem('esp', 'bilateral', {levels:['L5']})], 'B/L L5 ESP'],
  ['fluoro', [titleItem('sij', 'right')], 'RIGHT SIJ IA injection'],
  ['fluoro', [titleItem('hip_ia_fl', 'right')], 'RIGHT hip IA injection'],
  ['us', [titleItem('knee_ia', 'right')], 'RIGHT knee IA injection'],
  ['us', [titleItem('peritroch', 'right', {levels:['Subgluteus maximus']})], 'RIGHT GT bursa injection'],
  ['us', [titleItem('tpi', 'right', {muscle:'gluteal muscles',siteCount:3})], 'RIGHT gluteal TPI ×3'],
  ['fluoro', [titleItem('impar', 'midline')], 'Ganglion impar block + sacrococcygeal/Co1–2 IA injections'],
  ['fluoro', [titleItem('lumbar_facet', 'bilateral', {levels:['L2/3']}),titleItem('esp', 'right', {levels:['L3']})], 'B/L L2–3 IA facets + RIGHT L3 ESP']
];
for (const [modality, selected, title] of titleCases) {
  a.state.modality = modality; a.state.selected = selected;
  const prefix = modality === 'fluoro' ? 'Fluoro' : 'US';
  assert.equal(a.buildNote().split('\n')[0], `Procedure performed: ${prefix}, ${title}.`);
}

// Abbreviations must not lose specific targets or invent number/intent metadata.
const unnumberedMbb = titleItem('l_mbb','right',{levels:['L5 dorsal ramus'],toggles:{diagnostic:true}});
a.state.selected = [unnumberedMbb];
assert.equal(a.procedureLine(), 'Procedure performed: Fluoro, RIGHT L5 DR block, diagnostic.');
assert(!a.procedureLine().includes('#'));
const uncountedTpi = titleItem('tpi','left',{muscle:'the gluteal muscles'});
a.state.selected = [uncountedTpi];
assert.equal(a.procedureLine(), 'Procedure performed: Fluoro, LEFT gluteal TPI.');
assert(!a.procedureLine().includes('×'));
const specificBursa = titleItem('peritroch','right',{levels:['Subgluteus medius','Subgluteus minimus']});
a.state.modality = 'us'; a.state.selected = [specificBursa];
assert.equal(a.procedureLine(), 'Procedure performed: US, RIGHT subgluteus medius, subgluteus minimus bursa injections.');
assert(!a.procedureLine().includes('GT bursa'));
const discontinuousMbb = titleItem('c_mbb','left',{levels:['C3','C5'],toggles:{diagnostic:true}});
a.state.selected = [discontinuousMbb];
assert.equal(a.procedureLine(), 'Procedure performed: US, LEFT C3, C5 MBB, therapeutic.');
assert(!a.procedureLine().includes('C3–C5'));
a.state.modality = 'landmark'; a.state.selected = [uncountedTpi];
assert.equal(a.procedureLine(), 'Procedure performed: LEFT gluteal TPI.');
a.state.modality = 'fluoro';
a.state.selected = [titleItem('caudal','midline'), titleItem('esp','right',{levels:['L3']})];
assert.equal(a.procedureLine(), 'Procedure performed: Fluoro, Caudal ESI + RIGHT L3 ESP.');
assert(!a.procedureLine().includes('midline'));

// US cervical blocks are therapeutic, including the TON-only route through the
// cervical MBB card. A stale diagnostic flag must not change the title or volume.
a.state.modality = 'us';
const usCervical = a.makeItem('c_mbb', 'left');
usCervical.levels = ['C3','C4']; usCervical.toggles.ton = true;
a.state.selected = [usCervical];
assert(!a.diagnosticSelected(usCervical));
assert.equal(a.mixValue(usCervical, 'la'), 'lidocaine 1%');
assert.equal(a.mixValue(usCervical, 'laVol'), '2');
assert.equal(a.mixValue(usCervical, 'stVol'), '');
let usCervicalNote = a.buildNote();
assert(usCervicalNote.startsWith('Procedure performed: US, LEFT TON + C3, C4 MBB, therapeutic.'));
assert(usCervicalNote.includes('- TON: 1cc lidocaine 1%'));
assert(usCervicalNote.includes('2cc lidocaine 1% split between 2 levels'));
assert(!/diagnostic|0\.5cc|bupivacaine|Depo-Medrol|Dexamethasone/i.test(usCervicalNote));
assert.equal((a.procedureNote().match(/lateral decubitus/g)||[]).length, 1);
usCervical.toggles.diagnostic = true; usCervical.blockNumber = 2;
assert(!/diagnostic/i.test(a.buildNote()));
assert(!/diagnostic/i.test(a.procName(usCervical)));
assert.equal(a.tonVol(usCervical), 1);
usCervical.lat = 'bilateral';
assert.equal(a.tonVol(usCervical), 2);
assert.equal(a.mixValue(usCervical, 'laVol'), '4');
assert(a.injectateBlock().includes('TON: 2cc lidocaine 1%'));
assert(a.injectateBlock().includes('4cc lidocaine 1% split between 4 levels'));
const usTonOnly = a.makeItem('c_mbb','right'); usTonOnly.toggles.ton = true;
a.state.selected = [usTonOnly];
assert(a.buildNote().startsWith('Procedure performed: US, RIGHT TON, therapeutic.'));
assert(a.injectateBlock().includes('TON: 1cc lidocaine 1%'));
assert(!a.injectateBlock().includes('Cervical medial branch:'));
assert(!a.inModality('ton'));
const unsupportedTon = a.makeItem('ton','left');
a.state.selected = [unsupportedTon];
assert(a.unanswered().some(s => s.includes('cervical medial branch card')));

// Creating under US does not erase Fluoro's diagnostic default. An explicit
// Fluoro therapeutic choice survives a round trip, as do explicit drug values.
const modalityCervical = a.makeItem('c_mbb','right');
modalityCervical.levels = ['C3','C4']; modalityCervical.toggles.ton = true;
a.state.selected = [modalityCervical];
a.state.modality = 'fluoro';
assert(a.diagnosticSelected(modalityCervical));
assert(a.procedureLine().endsWith('diagnostic.'));
assert.equal(a.tonVol(modalityCervical), 0.6);
assert.equal(a.mixValue(modalityCervical, 'la'), 'bupivacaine 0.5%');
assert.equal(a.mixValue(modalityCervical, 'laVol'), '0.5');
a.state.modality = 'us';
assert(a.procedureLine().endsWith('therapeutic.'));
assert.equal(a.tonVol(modalityCervical), 1);
assert.equal(a.mixValue(modalityCervical, 'la'), 'lidocaine 1%');
assert.equal(a.mixValue(modalityCervical, 'laVol'), '2');
a.state.modality = 'fluoro'; modalityCervical.toggles.diagnostic = false;
modalityCervical.mix.la = 'bupivacaine 0.25%'; modalityCervical.mixTouch.la = true;
modalityCervical.mix.laVol = '1.5'; modalityCervical.mixTouch.laVol = true;
for (const mode of ['us','fluoro']) {
  a.state.modality = mode;
  assert(a.procedureLine().endsWith('therapeutic.'));
  assert.equal(a.mixValue(modalityCervical, 'la'), 'bupivacaine 0.25%');
  assert.equal(a.mixValue(modalityCervical, 'laVol'), '1.5');
  assert.equal(a.mixValue(modalityCervical, 'stVol'), '');
}
const freshFluoroTon = a.makeItem('ton','right');
a.state.selected = [freshFluoroTon];
assert(a.diagnosticSelected(freshFluoroTon));
assert.equal(a.mixValue(freshFluoroTon, 'laVol'), '0.6');
assert.equal(a.mixValue(freshFluoroTon, 'la'), 'bupivacaine 0.5%');
a.state.modality = 'us';
const unrelatedDiagnostic = a.makeItem('t_mbb','right');
unrelatedDiagnostic.levels = ['T5']; unrelatedDiagnostic.toggles.diagnostic = true;
a.state.selected = [unrelatedDiagnostic];
assert(a.procedureLine().endsWith('diagnostic.'));
a.state.modality = 'fluoro';

// Drug identity follows the procedure family. This must not add steroid to a
// local-anesthetic-only selection or alter the existing default steroid volume.
const epiduralKeys = new Set(['c_epidural', 'tfesi', 'lumbar_root_sequence', 'l_ilesi', 'caudal']);
for (const key of Object.keys(a.PROCS)) {
  const item = a.makeItem(key, 'right');
  a.state.selected = [item];
  const expected = epiduralKeys.has(key) ? 'Dexamethasone 10 mg/mL' : 'Depo-Medrol 40 mg/mL';
  assert.equal(a.mixValue(item, 'st'), expected, `${key}: steroid default`);
  if (Number(a.mixValue(item, 'stVol')) > 0) {
    assert(a.injectateBlock().includes(expected), `${key}: assembled injectate must use its default`);
  }
}
const noSteroidKeys = ['gon', 'lon', 'ton', 'c_mbb', 't_mbb', 'l_mbb', 'l_rfa', 'sij_rfa', 'esp', 'tpi', 'lumbar_root_sequence'];
for (const key of noSteroidKeys) {
  const item = a.makeItem(key, 'right');
  if (key === 'lumbar_root_sequence') { item.intent = 'root_only'; item.levels = ['L4']; }
  a.state.selected = [item];
  assert.equal(a.mixValue(item, 'stVol'), '', `${key}: no default steroid volume`);
  assert(!/Depo-Medrol|Methylprednisolone|Dexamethasone|Triamcinolone/i.test(a.injectateBlock()), `${key}: steroid must stay absent`);
}

// A clinician override wins after changing the side, targets or modality. A blank
// steroid volume is an explicit omission, not a request to restore the default.
for (const key of ['lumbar_facet', 'tfesi', 'caudal', 'ton', 'c_mbb']) {
  const item = a.makeItem(key, 'right');
  item.levels = key === 'c_mbb' ? ['C3'] : key === 'lumbar_facet' ? ['L4/5'] : ['L4'];
  item.mix.st = 'Triamcinolone 40 mg/mL'; item.mixTouch.st = true;
  item.mix.stVol = '0.75'; item.mixTouch.stVol = true;
  a.state.selected = [item];
  for (const modality of a.PROCS[key].modes.filter(mode => ['fluoro', 'us'].includes(mode))) {
    a.state.modality = modality;
    for (const side of a.PROCS[key].midline ? ['midline'] : ['right', 'bilateral']) {
      item.lat = side;
      assert.equal(a.mixValue(item, 'st'), 'Triamcinolone 40 mg/mL', `${key}: overridden drug survives ${modality}/${side}`);
      assert.equal(a.mixValue(item, 'stVol'), '0.75', `${key}: overridden volume survives ${modality}/${side}`);
      assert(a.injectateBlock().includes('Triamcinolone 40 mg/mL'), `${key}: override is rendered`);
    }
  }
  item.mix.stVol = '';
  assert.equal(a.mixValue(item, 'stVol'), '', `${key}: explicit no-steroid volume`);
  assert(!/Depo-Medrol|Methylprednisolone|Dexamethasone|Triamcinolone/i.test(a.injectateBlock()), `${key}: explicit no-steroid output`);
}
a.state.modality = 'fluoro';

// Cards with bespoke multi-line injectates must also honor a manual replacement.
for (const key of ['ton', 'c_mbb', 'impar', 'interscapular_5in1']) {
  const item = a.makeItem(key, 'left');
  item.injTouched = true; item.mixOn = false;
  item.inj = '2 cc lidocaine 1%; no corticosteroid';
  a.state.selected = [item];
  const injectate = a.injectateBlock();
  assert(injectate.includes(item.inj), `${key}: manual injectate replacement is rendered`);
  assert(!/Depo-Medrol|Methylprednisolone|Dexamethasone|Triamcinolone/i.test(injectate), `${key}: manual replacement excludes old steroid`);
}

// Impar uses a bespoke default line; verify the rendered drug as well as the
// mixture default. The combined root sequence keeps epidural steroid separate.
const imparDefault = a.makeItem('impar', 'midline');
a.state.selected = [imparDefault];
assert(a.injectateBlock().includes('Depo-Medrol 40 mg/mL'));
const combinedRoot = a.makeItem('lumbar_root_sequence', 'left');
combinedRoot.levels = ['L4']; combinedRoot.intent = 'epidural_then_root';
a.state.selected = [combinedRoot];
assert.equal(a.mixValue(combinedRoot, 'stVol'), '1');
assert(a.injectateBlock().includes('Dexamethasone 10 mg/mL (steroid only)'));
combinedRoot.intent = 'root_only';
assert(!/Dexamethasone|steroid only/.test(a.injectateBlock()));

// Technique must not claim a default drug that the clinician replaced or omitted.
const infraneural = a.makeItem('tfesi', 'right');
infraneural.levels = ['L4']; infraneural.approach = 'infraneural';
infraneural.mix.st = 'Triamcinolone 40 mg/mL'; infraneural.mixTouch.st = true;
infraneural.mix.stVol = '0.5'; infraneural.mixTouch.stVol = true;
a.state.selected = [infraneural];
assert(!/dexamethasone injected/i.test(a.procedureNote()));
assert(!/Non-particulate steroid was used/i.test(a.buildNote()));
infraneural.mix.stVol = '';
assert(!/Non-particulate steroid was used|dexamethasone injected/i.test(a.buildNote()));

const root = a.makeItem('lumbar_root_sequence', 'left');
root.levels = ['L5']; root.intent = 'root_only';
a.state.selected = [root];
let note = a.buildNote();
assert(note.startsWith('Procedure performed: Fluoro, LEFT L5 SNRB.'));
assert(!/^PROCEDURE NOTE$/m.test(note));
assert(!/^Diagnosis:/m.test(note));
assert(note.includes('observed for 15 minutes'));
assert(note.includes('bupivacaine 0.5%'));
assert(/Surgical safety check\s*list[^\n]*briefing[^\n]*time[- ]out[^\n]*debriefing[^\n]*completed/i.test(note));
a.state.planNext = true;
assert(!a.buildNote().includes('radiofrequency ablation'));
a.state.planNext = false;

// Dictated inability to establish selective spread must replace, not coexist with,
// the successful-access defaults. The performed procedure's title stays intact.
root.techniqueOverride = 'A high iliac crest limited access. Contrast did not convincingly outline the root. Further attempts were stopped when contrast obscured the anatomy';
root.mixTouch.contrast = true; root.mix.contrast = '4';
root.mixTouch.laVol = true; root.mix.laVol = '0.5';
note = a.buildNote();
assert(note.includes('did not convincingly outline the root'));
assert(!note.includes('advanced through the left L5/S1 foramen'));
assert(!note.includes('demonstrated nerve root spread'));
assert(!note.includes('without arterial, intrathecal or venous uptake'));
assert(!/Procedure performed:.*attempted/i.test(note));
assert(note.includes('0.5 cc bupivacaine 0.5%'));
assert(note.includes('Contrast (Left L5): 4 cc'));

const facet = a.makeItem('lumbar_facet','right'); facet.levels = ['L3/4','L5/S1']; facet.local = true;
const si = a.makeItem('sij','right'); si.local = true;
const esp = a.makeItem('esp','right'); esp.levels = ['L5'];
const tp = a.makeItem('tpi','right'); tp.muscle = 'gluteal muscles';
a.state.selected = [facet,si,esp,tp];
note = a.buildNote();
assert(!/^\s*(PROCEDURE NOTE|Right L3\/4 facets:|Right SI joint:|Right L5 ESP:)\s*$/m.test(note));
assert.equal((a.procedureNote().match(/Local anesthetic was infiltrated with a 25g 1.5 inch needle\./g)||[]).length, 1);
assert(!a.PROCS.tpi.body(tp,0,'right').includes('seen dispersing'));
assert(a.PROCS.tpi.body(tp,0,'right').includes('injectate was delivered'));
assert(note.includes('observed for 30 minutes'));
assert.equal((note.match(/Consent and Preparation:/g)||[]).length, 1);
assert.equal((note.match(/^Injectate:/gm)||[]).length, 1);
assert.equal((note.match(/Surgical safety check\s*list/g)||[]).length, 1);
a.state.modality = 'us';
assert(a.PROCS.tpi.body(tp,0,'right').includes('seen dispersing'));
tp.techniqueOverride = 'Injection was discontinued before aspiration or injectate delivery';
assert(!a.procedureNote().includes('Aspiration was negative for blood before injection at each site'));
tp.techniqueOverride = '';

// An event must not silently inherit a recovered/stable-discharge claim.
a.state.compHypo = true;
note = a.tailBlock();
assert(note.toLowerCase().includes('hypotension'));
assert(!note.includes('Transient'));
assert(!note.includes('recovered without further issue'));
assert(!note.includes('discharged home in stable condition'));
a.state.compHypo = false;
a.state.complications = 'Right leg weakness after the injection';
assert(!a.tailBlock().includes('discharged home in stable condition'));
a.state.aftercareText = 'Repeat motor examination returned to baseline. Discharged with assistance.';
assert(a.tailBlock().includes(a.state.aftercareText));
console.log('PASS: 16 concise titles and target/metadata fidelity, catalog steroid defaults, explicit drug/no-steroid overrides, assembled injectates, shared safety checklist, NKDA precedence, narrative format, technical overrides, dose changes, fluoroscopy TPI wording and adverse-event aftercare');
