#!/usr/bin/env node
'use strict';

// Local source-linked assembly, not an independent clinical interpretation.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'&&v.trim().length>0;
const fail=m=>{throw new Error(m);};
const inside=(a,b)=>b===a||b.startsWith(a+path.sep);
const existing=paths=>paths.find(p=>fs.existsSync(p));
function identity(file){try{return fs.realpathSync(file);}catch{return path.resolve(file);}}
function privatePath(file,output=false){
 const resolved=path.resolve(file);let actual;
 try{actual=fs.realpathSync(resolved);}catch{
  if(!output)fail('A local encounter input or source is unavailable.');
  try{actual=path.join(fs.realpathSync(path.dirname(resolved)),path.basename(resolved));}catch{fail('The output directory is unavailable.');}
 }
 if(inside(fs.realpathSync(root),actual))fail('Keep encounter inputs, sources and outputs outside the repository or installed skill directory.');
 return resolved;
}
function read(file,label,max=4*1024*1024){
 try{const s=fs.statSync(file);if(!s.isFile()||s.size>max)fail(label+' must be a regular file within the size limit.');return fs.readFileSync(file);}catch(e){if(e.message.startsWith(label))throw e;fail(label+' could not be read.');}
}
function loadEngine(options={}){
 const htmlPath=options.html||existing([path.join(root,'exam-builder.html'),path.join(root,'assets','exam-builder.html')]);
 if(!htmlPath)fail('Examination HTML is unavailable.');
 const html=read(htmlPath,'Examination HTML').toString('utf8');
 function script(id){const m=[...html.matchAll(new RegExp(`<script\\b[^>]*\\bid=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script\\s*>`,'gi'))];if(m.length!==1)fail('Expected one '+id+' script.');return m[0][1];}
 let catalog,receipt;
 try{catalog=JSON.parse(script('exam-catalog'));receipt=JSON.parse(script('exam-source'));}catch{fail('Examination catalog or source receipt is invalid.');}
 if(!object(catalog)||catalog.version!==1||!object(catalog.regions)||!object(catalog.macros)||!object(receipt))fail('Unsupported examination catalog.');
 const preferences=options.preferences||existing([path.join(root,'WORKFLOW-PREFERENCES.md'),path.join(root,'references','preferences.md'),path.join(path.dirname(htmlPath),'..','references','preferences.md')]);
 const guide=options['physical-exam']||existing([path.join(root,'skills','clinic-visit','references','physical-exam.md'),path.join(root,'references','physical-exam.md'),path.join(path.dirname(htmlPath),'..','references','physical-exam.md')]);
 if(!preferences||!guide)fail('Current examination preferences and physical-exam reference are required.');
 for(const [key,file]of [['preferences_sha256',preferences],['physical_exam_sha256',guide]]){
  if(!/^[a-f0-9]{64}$/.test(receipt[key]||'')||receipt[key]!==sha256(read(file,'Examination policy')))fail('Examination HTML policy receipt is stale. Rebuild before drafting.');
 }
 const engine=script('exam-engine');
 if(engine.trim()!==read(path.join(__dirname,'exam_engine.cjs'),'Canonical examination engine').toString('utf8').trim())fail('Examination HTML differs from the canonical engine. Rebuild before drafting.');
 const context=vm.createContext({},{codeGeneration:{strings:false,wasm:false}});
 try{vm.runInContext(engine,context,{timeout:1000});}catch{fail('Examination engine could not be loaded.');}
 if(!context.ExamEngine||typeof context.ExamEngine.render!=='function')fail('Examination renderer is unavailable.');
 return {context,catalog,html,artifacts:[htmlPath,preferences,guide,path.join(__dirname,'exam_engine.cjs')]};
}
function validatePacket(packet,input,catalog){
 const errors=[];const issue=m=>errors.push(m);
 if(!object(packet)||!object(packet.state))fail('Provide a state object.');
 const state=packet.state;
 if(!object(catalog.regions[state.region])||!Array.isArray(catalog.regions[state.region].lines))fail('Select a known examination region.');
 if(!object(state.rows))fail('Provide a rows object; use an empty object for an unresolved review.');
 if(!Array.isArray(packet.sources)||packet.sources.length>50||!Array.isArray(packet.evidence)||packet.evidence.length>1000)fail('Provide sources and evidence arrays within supported limits.');
 const definitions=catalog.regions[state.region].lines;const ids=new Set(definitions.map(d=>d.id));
 if(ids.size!==definitions.length||definitions.some(d=>!object(d)||!text(d.id)||typeof d.text!=='string'))fail('Invalid or duplicate examination definitions.');
 const sources=new Map();
 for(const s of packet.sources){
  if(!object(s)||!text(s.id)||!text(s.path)||!/^[a-fA-F0-9]{64}$/.test(s.sha256||'')||!['current','historical','instruction'].includes(s.role)){issue('Each source needs a unique id, path, checksum and current/historical/instruction role.');continue;}
  if(sources.has(s.id)){issue('Duplicate source id.');continue;}
  const file=privatePath(path.resolve(path.dirname(input),s.path));const bytes=read(file,'Source');
  if(sha256(bytes)!==s.sha256.toLowerCase()){issue('Source changed; read it again before drafting.');continue;}
  sources.set(s.id,{text:bytes.toString('utf8'),role:s.role});
 }
 const evidence=new Map();
 for(const e of packet.evidence){
  if(!object(e)||!ids.has(e.rowId)||!Object.hasOwn(state.rows,e.rowId)||!text(e.quote)||e.quote.length>50000){issue('Evidence must name a populated row and an exact nonempty source quote.');continue;}
  const source=sources.get(e.sourceId);
  if(!source||!source.text.includes(e.quote)){issue('A row evidence quote is absent from its verified source.');continue;}
  if((state.header===undefined||/^EXAM(?: |$)/.test(state.header))&&source.role==='historical'){issue('Historical evidence cannot populate a current EXAM.');continue;}
  const list=evidence.get(e.rowId)||[];list.push(source.role);evidence.set(e.rowId,list);
 }
 for(const [id,row]of Object.entries(state.rows)){
  if(!ids.has(id)){issue('Unknown examination row: '+id);continue;}
  if(!object(row)){issue('Each examination row must be an object.');continue;}
  if(row.status!==undefined&&!['review','supported','omitted'].includes(row.status))issue('Unsupported row status: '+id);
  if(row.confirmed!==undefined&&typeof row.confirmed!=='boolean')issue('Row confirmation must be boolean: '+id);
  if(row.text!==undefined&&typeof row.text!=='string')issue('Row text must be a string: '+id);
  if(row.selections!==undefined&&!object(row.selections))issue('Selections must be an object: '+id);
  const changed=row.status==='supported'||row.status==='omitted'||row.confirmed===true||Object.hasOwn(row,'text')||(object(row.selections)&&Object.keys(row.selections).length>0);
  if(changed&&!evidence.has(id))issue('Source evidence is required for row '+id+'.');
 }
 return errors;
}
function prefilledHTML(html,state){
 const pattern=/(<script\b[^>]*\bid=["']exam-prefill["'][^>]*>)([\s\S]*?)(<\/script\s*>)/gi;
 const matches=[...html.matchAll(pattern)];
 if(matches.length!==1)fail('Review HTML requires exactly one exam-prefill script.');
 try{const initial=JSON.parse(matches[0][2]);if(initial!==null&&!object(initial))fail('invalid');}catch{fail('The exam-prefill script must contain valid JSON null or an object.');}
 const clean={region:state.region,rows:{}};
 if(state.header!==undefined)clean.header=state.header;
 for(const [id,row]of Object.entries(state.rows)){
  const target={};
  for(const key of ['status','text','confirmed'])if(Object.hasOwn(row,key))target[key]=row[key];
  if(row.selections!==undefined){
   target.selections={};
   for(const [key,value]of Object.entries(row.selections)){
    if(value!==null&&!Number.isInteger(value)&&!(Array.isArray(value)&&value.every(Number.isInteger)))fail('Review HTML selections must be indices, arrays of indices or null.');
    target.selections[key]=value;
   }
  }
  clean.rows[id]=target;
 }
 const payload=JSON.stringify(clean).replace(/</g,'\\u003c').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return html.replace(pattern,(_,start,content,end)=>start+payload+end);
}
function parseArgs(argv){
 const o={mode:'review'};const seen=new Set();
 for(let i=0;i<argv.length;i++){
  const k=argv[i];if(k==='--help'){o.help=true;continue;}
  if(!['--input','--output','--review-html','--mode','--html','--preferences','--physical-exam','--chart','--chart-output'].includes(k)||seen.has(k)||!argv[i+1]||argv[i+1].startsWith('--'))fail('Use --input FILE [--output FILE] [--review-html FILE] [--mode review|final] [--chart FILE --chart-output FILE].');
  seen.add(k);o[k.slice(2)]=k==='--mode'?argv[++i]:path.resolve(argv[++i]);
 }
 if(!o.help&&!o.input)fail('--input is required.');
 if(!['review','final'].includes(o.mode))fail('--mode must be review or final.');
 if(Boolean(o.chart)!==Boolean(o['chart-output']))fail('--chart and --chart-output must be supplied together.');
 if(o.chart&&o.mode!=='final')fail('Chart replacement requires --mode final.');
 return o;
}
function writeOutputs(outputs){
 const pending=[];const replaced=[];
 try{
  for(const [file,value]of outputs){const temporary=path.join(path.dirname(file),'.exam-'+process.pid+'-'+crypto.randomBytes(6).toString('hex')+'.tmp');const backup=fs.existsSync(file)?fs.readFileSync(file):null;fs.writeFileSync(temporary,value,{mode:0o600,flag:'wx'});pending.push({file,temporary,backup});}
  for(const item of pending){fs.renameSync(item.temporary,item.file);replaced.push(item);}
 }catch{
  for(const item of replaced.reverse()){try{if(item.backup===null)fs.unlinkSync(item.file);else fs.writeFileSync(item.file,item.backup,{mode:0o600});}catch{}}
  fail('Examination output could not be written.');
 }finally{for(const item of pending){try{fs.unlinkSync(item.temporary);}catch{}}}
}
function main(argv){
 try{
  const o=parseArgs(argv);if(o.help){process.stdout.write('Usage: node render_exam.cjs --input /tmp/exam.json [--output /tmp/exam.txt] [--review-html /tmp/review.html] [--mode review|final] [--chart /tmp/note.txt --chart-output /tmp/updated.txt] [--html FILE] [--preferences FILE] [--physical-exam FILE]\nReview retains unresolved choices; final requires a complete exam. Review HTML includes examination state only, without source paths or evidence metadata. Sources and exact quotes provide traceability, not clinical validation.\n');return 0;}
  const input=privatePath(o.input);let packet;
  try{packet=JSON.parse(read(input,'Input packet',1024*1024).toString('utf8'));}catch{fail('Input packet must be valid JSON within 1 MiB.');}
  const {context,catalog,html,artifacts}=loadEngine(o);const errors=validatePacket(packet,input,catalog);if(errors.length)fail(errors.slice(0,30).join('\n'));
  const outputs=[o.output,o['chart-output'],o['review-html']].filter(Boolean).map(p=>privatePath(p,true));
  const protectedFiles=[input,...artifacts,...packet.sources.map(s=>path.resolve(path.dirname(input),s.path)),...(o.chart?[privatePath(o.chart)]:[])].map(identity);
  if(new Set(outputs.map(identity)).size!==outputs.length||outputs.some(p=>protectedFiles.includes(identity(p))))fail('Outputs must be distinct and must not replace input/source/chart files.');
  context.EXAM_STATE=packet.state;context.EXAM_CATALOG=catalog;context.EXAM_MODE=o.mode;
  let result;try{result=vm.runInContext('ExamEngine.render(EXAM_STATE, EXAM_CATALOG, EXAM_MODE)',context,{timeout:1000});}catch{fail('Examination engine failed.');}
  if(!result||!Array.isArray(result.issues)||result.issues.length||typeof result.text!=='string')fail('Examination assembly failed. '+(result?.issues||[]).join(' '));
  if(o.mode==='final'&&result.ready!==true)fail('Final examination withheld: unresolved selections, macros, measurements or row confirmations remain.');
  const outputText=result.text+'\n';const writes=[];
  if(o.output)writes.push([o.output,outputText]);
  if(o['review-html'])writes.push([o['review-html'],prefilledHTML(html,packet.state)]);
  if(o.chart){
   if(!text(packet.state.header))fail('Chart replacement requires an explicit state.header.');
   context.EXAM_CHART=read(o.chart,'Chart').toString('utf8');context.EXAM_TEXT=result.text;
   let chart;try{chart=vm.runInContext('ExamEngine.replaceSection(EXAM_CHART, EXAM_STATE.header, EXAM_TEXT)',context,{timeout:1000});}catch{fail('Chart examination boundary is missing or ambiguous. No chart was changed.');}
   if(typeof chart!=='string')fail('Chart replacement failed.');writes.push([o['chart-output'],chart]);
  }
  writeOutputs(writes);if(!o.output)process.stdout.write(outputText);return 0;
 }catch(e){process.stderr.write('Examination output withheld:\n'+e.message+'\nAny existing output remains unchanged after validation failure.\n');return 1;}
}
if(require.main===module)process.exitCode=main(process.argv.slice(2));
module.exports={main,loadEngine,validatePacket,parseArgs,prefilledHTML,sha256};
