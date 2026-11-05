'use strict';
// Synthetic source fixtures only. No patient records or clinical defaults.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'exam-cli-test-'));
let count=0;
try{
 const input=path.join(root,'input.json'),output=path.join(root,'exam.txt'),html=path.join(root,'exam.html'),prefs=path.join(root,'preferences.md'),guide=path.join(root,'guide.md'),source=path.join(root,'source.txt');
 fs.writeFileSync(prefs,'Synthetic policy\n');fs.writeFileSync(guide,'Synthetic physical examination guide\n');fs.writeFileSync(source,'Motor normal. Reflexes not examined. Right leg pain.\n');
 const catalog={version:1,regions:{lumbar:{lines:[{id:'motor',label:'Motor',text:'- Motor: [normal|abnormal].'},{id:'reflex',label:'Reflex',text:'[null|- Reflexes: [normal|reduced].]'}]}},macros:{}};
 const engine=fs.readFileSync(path.join(__dirname,'exam_engine.cjs'),'utf8');
 const makeHTML=(overrides={})=>{
  fs.writeFileSync(html,`<script id="exam-catalog" type="application/json">${JSON.stringify(catalog)}</script><script id="exam-source" type="application/json">${JSON.stringify({preferences_sha256:hash(fs.readFileSync(prefs)),physical_exam_sha256:hash(fs.readFileSync(guide)),...overrides})}</script><script id="exam-engine">\n${engine}\n</script><script id="exam-prefill" type="application/json">null</script>`);
 };
 makeHTML();
 const packet=()=>({state:{region:'lumbar',header:'EXAM',rows:{motor:{status:'supported',text:'- Motor: normal.'},reflex:{status:'omitted'}}},sources:[{id:'current',path:source,sha256:hash(fs.readFileSync(source)),role:'current'}],evidence:[{rowId:'motor',sourceId:'current',quote:'Motor normal.'},{rowId:'reflex',sourceId:'current',quote:'Reflexes not examined.'}]});
 const run=(p,args=[])=>{fs.writeFileSync(input,JSON.stringify(p));return spawnSync(process.execPath,[path.join(__dirname,'render_exam.cjs'),'--input',input,'--output',output,'--html',html,'--preferences',prefs,'--physical-exam',guide,...args],{encoding:'utf8'});};
 const success=(p,args=[])=>{const res=run(p,args);assert.equal(res.status,0,res.stderr);count++;return res;};
 const rejected=(p,args=[],pattern)=>{fs.writeFileSync(output,'UNCHANGED');const res=run(p,args);assert.equal(res.status,1,res.stderr);assert.equal(fs.readFileSync(output,'utf8'),'UNCHANGED');if(pattern)assert.match(res.stderr,pattern);count++;return res;};

 success(packet(),['--mode','final']);assert.equal(fs.readFileSync(output,'utf8'),'EXAM\n- Motor: normal.\n');
 let p=packet();p.state.rows={};p.sources=[];p.evidence=[];success(p);assert.match(fs.readFileSync(output,'utf8'),/\[normal\|abnormal\]/);rejected(p,['--mode','final'],/unresolved/);
 p=packet();p.evidence=[];rejected(p,[],/Source evidence is required/);
 p=packet();p.evidence[0].quote='Not in source';rejected(p,[],/absent/);
 p=packet();p.sources[0].sha256='0'.repeat(64);rejected(p,[],/Source changed/);
 p=packet();p.sources[0].role='historical';rejected(p,[],/Historical evidence/);
 p=packet();p.state.header='EXAM — current encounter';p.sources[0].role='historical';rejected(p,[],/Historical evidence/);
 p=packet();p.state.header='Previous EXAM';p.sources[0].role='historical';success(p,['--mode','final']);
 p=packet();p.state.rows.missing={status:'omitted'};rejected(p,[],/Unknown examination row/);
 p=packet();p.state.rows.motor={text:'- Motor: examUnknown',status:'supported'};success(p);rejected(p,['--mode','final'],/unresolved/);
 p=packet();p.state.rows.motor={text:'- Motor: [normal|abnormal].',status:'supported',selections:{g9:8}};rejected(p,[],/Invalid selection/);
 p=packet();p.state.rows.motor={text:'- Motor: [normal|abnormal].',status:'review',selections:{g9:0}};rejected(p,['--mode','final'],/unresolved/);p.state.rows.motor.confirmed=true;success(p,['--mode','final']);
 p=packet();p.state.rows.motor.text='- Motor: 4-/5.';success(p,['--mode','final']);assert.match(fs.readFileSync(output,'utf8'),/4-\/5/);
 makeHTML({physical_exam_sha256:'0'.repeat(64)});rejected(packet(),[],/receipt is stale/);makeHTML();
 fs.appendFileSync(html,'<script id="exam-catalog" type="application/json">{}</script>');rejected(packet(),[],/catalog or source receipt is invalid/);makeHTML();
 fs.writeFileSync(html,fs.readFileSync(html,'utf8').replace(engine,engine+'\n// stale\n'));rejected(packet(),[],/differs from the canonical/);makeHTML();
 const chart=path.join(root,'chart.txt'),changed=path.join(root,'updated.txt');const original='HPI\nUnchanged history.\r\n\r\nEXAM\nOld findings.\n\n\nIMPRESSION\nUnchanged assessment.\n\nPLAN\nUnchanged plan.\n';fs.writeFileSync(chart,original);
 success(packet(),['--mode','final','--chart',chart,'--chart-output',changed]);assert.equal(fs.readFileSync(changed,'utf8'),original.replace('Old findings.','- Motor: normal.'));assert.equal(fs.readFileSync(chart,'utf8'),original);
 rejected(packet(),['--chart',chart,'--chart-output',changed],/requires --mode final/);
 fs.writeFileSync(chart,'EXAM\none\nEXAM\ntwo\n');fs.writeFileSync(changed,'CHART UNCHANGED');rejected(packet(),['--mode','final','--chart',chart,'--chart-output',changed],/boundary/);assert.equal(fs.readFileSync(changed,'utf8'),'CHART UNCHANGED');
 rejected(packet(),['--mode','final','--chart',chart,'--chart-output',source],/must not replace/);
 p=packet();p.sources[0].path=path.join(__dirname,'exam_engine.cjs');p.sources[0].sha256=hash(fs.readFileSync(p.sources[0].path));rejected(p,[],/outside the repository/);
 const review=path.join(root,'review.html');p=packet();p.state.sourcePath='PRIVATE_STATE_PATH';p.state.rows.motor.evidence='PRIVATE_ROW_EVIDENCE';p.state.rows.motor.text='- Motor: source-backed literal </script><script>alert(1)</script> & \u2028 \u2029 internal';
 success(p,['--review-html',review]);const renderedHTML=fs.readFileSync(review,'utf8');const prefill=renderedHTML.match(/<script id="exam-prefill" type="application\/json">([\s\S]*?)<\/script>/)[1];const state=JSON.parse(prefill);
 assert.equal(state.rows.motor.text,p.state.rows.motor.text);assert.equal(state.region,'lumbar');assert.deepEqual(Object.keys(state).sort(),['header','region','rows']);assert.deepEqual(Object.keys(state.rows.motor).sort(),['status','text']);assert(!renderedHTML.includes('PRIVATE_STATE_PATH'));assert(!renderedHTML.includes('PRIVATE_ROW_EVIDENCE'));assert(!renderedHTML.includes(source));assert(!prefill.includes('<'));assert(!prefill.includes('&'));assert(!prefill.includes('\u2028'));assert(!prefill.includes('\u2029'));assert(prefill.includes('\\u003c'));assert(prefill.includes('\\u0026'));assert.equal(fs.readFileSync(output,'utf8'),'EXAM\n'+p.state.rows.motor.text.trim()+'\n');
 rejected(packet(),['--review-html',source],/must not replace/);rejected(packet(),['--review-html',html],/must not replace/);rejected(packet(),['--review-html',output],/must be distinct/);
 fs.writeFileSync(review,'HTML UNCHANGED');fs.writeFileSync(html,fs.readFileSync(html,'utf8').replace('<script id="exam-prefill" type="application/json">null</script>',''));rejected(packet(),['--review-html',review],/exactly one exam-prefill/);assert.equal(fs.readFileSync(review,'utf8'),'HTML UNCHANGED');makeHTML();
 fs.writeFileSync(html,fs.readFileSync(html,'utf8').replace('application/json">null</script>','application/json">{malformed}</script>'));rejected(packet(),['--review-html',review],/valid JSON/);assert.equal(fs.readFileSync(review,'utf8'),'HTML UNCHANGED');makeHTML();
 fs.appendFileSync(html,'<script id="exam-prefill" type="application/json">null</script>');rejected(packet(),['--review-html',review],/exactly one exam-prefill/);makeHTML();
 console.log(`PASS: ${count} exam CLI cases covering source evidence, source roles, review/final modes, stale HTML, unknown rows/macros, exact chart replacement and unchanged outputs on failure.`);
}finally{fs.rmSync(root,{recursive:true,force:true});}
