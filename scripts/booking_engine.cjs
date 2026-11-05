/* Canonical deterministic booking engine. Browser and CommonJS; no storage or transmission. */
(function(root){
'use strict';
const catalog={
 lumbar_facet:{label:'Lumbar / thoracic IA facets',name:'IA facets',category:'continue',target:true},
 lumbar_mbb:{label:'Lumbar / thoracic MBB',name:'MBB',category:'continue',target:true},
 lumbar_rfa:{label:'Lumbar / thoracic medial branch RFA',name:'medial branch RFA',category:'continue',target:true},
 cervical_facet:{label:'Cervical IA facets',name:'IA facets',category:'continue',target:true},
 cervical_mbb:{label:'Cervical MBB / TON',name:'MBB',category:'continue',target:true},
 sij:{label:'SIJ IA injection',name:'SIJ IA injection',category:'continue'},
 superficial_tpi:{label:'Superficial / compressible TPI',name:'TPI',category:'continue',target:true},
 gon:{label:'Superficial GON block',name:'GON block',category:'continue'},
 tfesi:{label:'TFESI',name:'TFESI',category:'hold',target:true},
 ilesi:{label:'ILESI',name:'ILESI',category:'hold',target:true,midline:true},
 caudal:{label:'Caudal ESI',name:'Caudal ESI',category:'hold',midline:true},
 deep_nerve:{label:'Deep peripheral nerve block',name:'block',category:'hold',target:true},
 cervical_rfa:{label:'Cervical medial branch RFA',name:'medial branch RFA',category:'review',target:true},
 diagnostic_sensory:{label:'Diagnostic sensory nerve block',name:'diagnostic sensory nerve block',category:'review',target:true},
 phenol:{label:'Phenol neurolysis',name:'phenol neurolysis',category:'review',target:true},
 other:{label:'Other — specify exact procedure',name:'',category:'review',target:true}
};
const makeProcedure=()=>({kind:'',side:'',guidance:'',targets:''});
const makeAppointment=()=>({procedures:[makeProcedure()],duration:30,steroid:'',purpose:'routine',dependsOn:null,condition:''});
const initialState=()=>({procedures:[makeProcedure()],duration:30,ac:{status:'unreviewed',drugs:[],plan:'auto',custom:'',reviewed:false},ap:{status:'unreviewed',drugs:[],plan:'',custom:'',reviewed:false},platelets:{status:'unreviewed',count:'',date:'',decision:''},steroid:'',ativan:'ask',reviewed:false,scheduling:{mode:'',instructions:''},phenolPronoun:'them'});
const clean=value=>String(value??'').trim();
const oneLine=value=>clean(value).replace(/[\r\n]+/g,' ');
function getTemplates(supplied){
 if(supplied)return supplied;
 if(root.BOOKING_TEMPLATES)return root.BOOKING_TEMPLATES;
 if(typeof document!=='undefined'){
  const payload=document.getElementById('booking-templates');
  if(payload){try{return JSON.parse(payload.textContent);}catch{return {};}}
 }
 return {};
}
function evaluate(input,suppliedTemplates){
 const s=input&&typeof input==='object'?input:{};
 const templates=getTemplates(suppliedTemplates);
 const issues=[];const issue=(field,message)=>issues.push({field,message});
 const hasAppointments=Object.hasOwn(s,'appointments');
 const appointments=hasAppointments?(Array.isArray(s.appointments)?s.appointments:[]):[{procedures:s.procedures,duration:s.duration,steroid:s.steroid,purpose:'routine',dependsOn:null,condition:''}];
 if(!appointments.length)issue('procedures','Add an appointment with a procedure.');
 const multi=appointments.length>1;
 const scheduling=s.scheduling&&typeof s.scheduling==='object'?s.scheduling:{};
 if(scheduling.instructions!==undefined&&typeof scheduling.instructions!=='string')issue('scheduling','Scheduling instructions must be text.');
 const modes={separate_days:'Separate days.',consecutive_days:'Consecutive days.',same_day:'Same day.',custom:''};
 const validMode=Object.hasOwn(modes,scheduling.mode);
 if(multi&&!validMode)issue('scheduling','Choose whether the appointments are on separate days, consecutive days, the same day or a custom schedule.');
 if(scheduling.mode==='custom'&&!clean(scheduling.instructions))issue('scheduling','Complete the custom scheduling instructions.');
 const label=index=>(['separate_days','consecutive_days'].includes(scheduling.mode)?'Day ':'Appointment ')+(index+1);
 let category='continue';let hasPhenol=false;
 const raiseCategory=value=>{if(value==='hold'||(value==='review'&&category!=='hold'))category=value;};
 const rendered=appointments.map((raw,appointmentIndex)=>{
  const a=raw&&typeof raw==='object'?raw:{};
  const context=multi?label(appointmentIndex)+': ':'';
  const procedures=Array.isArray(a.procedures)?a.procedures:[];
  if(!procedures.length)issue('procedures',context+'Add a procedure.');
  const parts=[];let hasDiagnosticSensory=false;
  procedures.forEach((rawProcedure,i)=>{
   const p=rawProcedure&&typeof rawProcedure==='object'?rawProcedure:{};
   const c=Object.hasOwn(catalog,p.kind)?catalog[p.kind]:null;
   if(!c){issue('procedures',context+`Procedure ${i+1}: choose the procedure.`);raiseCategory('review');return;}
   raiseCategory(c.category);if(p.kind==='phenol')hasPhenol=true;if(p.kind==='diagnostic_sensory')hasDiagnosticSensory=true;
   if(!['Fluoro','US','Landmark'].includes(p.guidance))issue('procedures',context+`Procedure ${i+1}: choose guidance.`);
   if(!['LEFT','RIGHT','B/L','MIDLINE'].includes(p.side))issue('procedures',context+`Procedure ${i+1}: choose a side or midline.`);
   if(p.targets!==undefined&&typeof p.targets!=='string')issue('procedures',context+`Procedure ${i+1}: targets must be text.`);
   if(c.midline&&p.side!=='MIDLINE')issue('procedures',context+`Procedure ${i+1}: confirm the midline target.`);
   if(c.target&&!clean(p.targets))issue('procedures',context+`Procedure ${i+1}: enter the confirmed targets; they are not inferred.`);
   const title=[p.side==='MIDLINE'?'':p.side,oneLine(p.targets),c.name].filter(Boolean).join(' ');
   parts.push({guidance:p.guidance,title});
  });
  if(!['number','string'].includes(typeof a.duration)||!Number.isInteger(Number(a.duration))||Number(a.duration)<1||Number(a.duration)>240)issue('duration',context+'Choose a duration from 1 to 240 minutes.');
  if(!['yes','no'].includes(a.steroid))issue('steroid',context+'Confirm whether steroid is planned.');
  if(!['routine','diagnostic','treatment'].includes(a.purpose))issue('procedures',context+'Choose the appointment purpose.');
  if((a.purpose==='diagnostic'||hasDiagnosticSensory)&&a.steroid!=='no')issue('steroid',context+'Diagnostic appointments and diagnostic sensory nerve blocks require an explicit no-steroid plan.');
  const dependent=a.dependsOn!==null&&a.dependsOn!==undefined;
  if(a.condition!==undefined&&typeof a.condition!=='string')issue('procedures',context+'The appointment condition must be text.');
  if(dependent){
   if(!Number.isInteger(a.dependsOn)||a.dependsOn<1||a.dependsOn>appointmentIndex)issue('procedures',context+'Select a strictly earlier appointment as the dependency.');
   if(!clean(a.condition))issue('procedures',context+'Complete the clinician-selected condition for the dependent appointment.');
  }
  const prefix=g=>g==='Landmark'?'':g+', ';
  let procText=parts.length&&parts.every(p=>p.guidance===parts[0].guidance)?prefix(parts[0].guidance)+parts.map(p=>p.title).join(' + '):parts.map(p=>prefix(p.guidance)+p.title).join(' + ');
  if(!procText)procText='[Select procedure]';
  if(dependent){
   const condition=oneLine(a.condition)||'[clinician-selected condition required]';
   procText='Possible '+procText+'; after '+label(Number(a.dependsOn)-1)+' only if '+condition+(/[.!?]$/.test(condition)?'':'.')+' Dr. Tian review required before proceeding.';
  }
  return {procText,duration:a.duration,steroid:a.steroid};
 });
 const medication=(raw,which)=>{
  const m=raw&&typeof raw==='object'?raw:{};
  const ac=which==='ac';const title=ac?'Anticoagulation':'Antiplatelets (excluding ASA)';
  const drugs=(Array.isArray(m.drugs)?m.drugs:[]).map(oneLine).filter(Boolean);const names=drugs.join(', ');
  const negative=['no','undocumented',...(ac?[]:['asa_only'])];
  if(negative.includes(m.status)){
   if(drugs.length){issue(which,'Known medication remains recorded. Resolve the status conflict before using “No.”');return title+': [Resolve known medication/status conflict]';}
   return title+': No. Please confirm.';
  }
  if(m.status!=='yes'){issue(which,`${title}: review the sources and select a status.`);return title+': [Review required]';}
  if(!drugs.length)issue(which,`${title}: select the documented medication.`);
  let plan=m.plan;
  if(ac&&plan==='auto')plan=category==='continue'?'continue':'';
  if(!plan){issue(which,`${title}: choose the clinical management plan.`);return title+': Yes — '+(names||'[medication]')+'. [Select plan]';}
  if(ac&&plan==='continue'&&category==='hold'){issue(which,'An epidural/deep block needs an interruption plan; continuation is not an automatic option.');return title+': Yes — '+names+'. [Interruption plan required]';}
  if((!ac||m.plan!=='auto')&&m.reviewed!==true)issue(which,`${title}: review the selected drug-specific plan.`);
  const heading=title+': Yes — '+(names||'[medication]')+'. ';
  if(plan==='continue')return heading+'Continue; no hold required.';
  if(ac&&plan==='two_day'){
   if(multi){issue(which,'Multiple appointments require an individualized anticoagulant plan covering the entire sequence; the single-procedure next-day restart template cannot be used.');return heading+'[Individualized plan covering all appointments required]';}
   if(drugs.length!==1)issue(which,'Use individual instructions for multiple anticoagulants.');
   if(!Array.isArray(templates.acBranches)||templates.acBranches.length!==2){issue(which,'The approved two-branch template is unavailable.');return heading+'[Template unavailable]';}
   return heading+'Hold before the procedure.\n\n'+templates.acBranches.join('\n\n');
  }
  if(!ac&&plan==='seven_day'){
   if(drugs.length!==1||drugs[0].toLowerCase()!=='clopidogrel'){issue(which,'The one-week template is approved here for clopidogrel; select the actual drug-specific plan.');return heading+'[Drug-specific plan required]';}
   if(!templates.clopidogrel){issue(which,'Clopidogrel template unavailable.');return heading+'[Template unavailable]';}
   return templates.clopidogrel;
  }
  if(plan==='custom'){
   const text=clean(m.custom);
   if(!text||/\.\.\.|…/.test(text))issue(which,`${title}: complete the individualized instructions.`);
   if(ac&&!['Last dose:','No doses:','Restart:'].every(label=>{const match=text.match(new RegExp('^'+label+'[ \t]*(\\S[^\\r\\n]*)$','im'));return match&&!/^(Last dose:|No doses:|Restart:)/i.test(match[1]);}))issue(which,'Include completed Last dose:, No doses: and Restart: instructions on separate lines.');
   return heading+'\n'+(text||'[Individualized instructions required]');
  }
  issue(which,`${title}: unsupported plan selection.`);return heading+'[Select plan]';
 };
 const ac=medication(s.ac,'ac');const ap=medication(s.ap,'ap');
 const plt=s.platelets&&typeof s.platelets==='object'?s.platelets:{};let pltLine='';let plateletAction='';
 if(plt.status==='available'){
  const validCount=['number','string'].includes(typeof plt.count)&&clean(plt.count)!==''&&Number.isFinite(Number(plt.count))&&Number(plt.count)>=0;
  if(!validCount)issue('platelets','Enter the actual platelet count.');
  const date=clean(plt.date);
  if(date&&date.toLowerCase()!=='date not supplied'&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))issue('platelets','Enter a valid platelet sample date or state “date not supplied”.');
  if(validCount&&Number(plt.count)<100){
   pltLine='Platelets: '+clean(plt.count)+' ×10⁹/L ('+(date||'date not supplied')+').';
   if(!['proceed','cbc','defer'].includes(plt.decision))issue('platelets','Select the clinician decision for the platelet count below 100.');
   if(plt.decision==='cbc')pltLine+=' Obtain/review CBC before the procedure.';
   if(plt.decision==='proceed')pltLine+=' Proceed per clinician decision.';
   if(plt.decision==='defer'){pltLine+=' Defer booking pending Dr. Tian review.';issue('platelets','Booking is deferred pending Dr. Tian review of the platelet count.');}
  }else if(validCount&&plt.decision==='cbc')plateletAction='Obtain/review CBC before the procedure.';
 }else if(plt.status==='unavailable'){
  if(clean(plt.count)!=='')issue('platelets','Known platelet count remains recorded. Resolve the result-availability conflict before omitting it.');
  if(plt.decision==='cbc')plateletAction='Obtain/review CBC before the procedure.';
 }else issue('platelets','Review platelet result availability.');
 const ativanChoices={ask:'Please ask',no:'No',requested:'Patient requests it; prescription to be arranged',prescribed:'Prescription already faxed; instructions above'};
 const ativan=Object.hasOwn(ativanChoices,s.ativan)?ativanChoices[s.ativan]:null;
 if(!ativan)issue('ativan','Select an Ativan booking instruction.');
 if(s.reviewed!==true)issue('reviewed','Review the facts and instructions before copying.');
 const procLine=multi?'Procedure:\n'+rendered.map((a,i)=>'- '+label(i)+': '+a.procText).join('\n'):'Procedure: '+(rendered[0]?.procText||'[Select procedure]');
 const durationLine=multi?(rendered.every(a=>Number(a.duration)===Number(rendered[0].duration))?'Duration: '+rendered[0].duration+' minutes per appointment':'Duration:\n'+rendered.map((a,i)=>'- '+label(i)+': '+a.duration+' minutes').join('\n')):'Duration: '+(rendered[0]?.duration??'[Select]')+' minutes';
 const steroidText=value=>({yes:'Yes',no:'No'}[value]||'[Confirm]');
 const pairedLumbarDiagnostic=appointments.length===4&&appointments.every(a=>a.purpose==='diagnostic'&&a.steroid==='no'&&a.procedures?.length===1&&/L3, L4 MBB \+ L5 DR block/.test(a.procedures[0].targets||''));
 const steroidLine=pairedLumbarDiagnostic?'Steroid: No':multi?'Steroid:\n'+rendered.map((a,i)=>'- '+label(i)+': '+steroidText(a.steroid)).join('\n'):'Steroid: '+steroidText(rendered[0]?.steroid);
 const lines=['Please book:','',procLine,durationLine];
 if(pairedLumbarDiagnostic)lines.push('');
 if(multi)lines.push('Scheduling: '+([validMode?modes[scheduling.mode]:'[Select schedule]',clean(scheduling.instructions)].filter(Boolean).join(' ')));
 else if(clean(scheduling.instructions))lines.push('Scheduling: '+clean(scheduling.instructions));
 if(pairedLumbarDiagnostic)lines.push('');
 lines.push(ac,ap);if(pltLine)lines.push(pltLine);if(plateletAction)lines.push(plateletAction);lines.push(steroidLine,'Ativan: '+(ativan||'[Select]'));
 if(hasPhenol){
  const pronoun=s.phenolPronoun??'them';
  if(!['her','him','them'].includes(pronoun))issue('procedures','Choose her, him or them for the phenol booking instructions.');
  const paragraphs=Array.isArray(templates.phenol)?templates.phenol:typeof templates.phenol==='string'?templates.phenol.trim().split(/\n\s*\n/):[];
  if(paragraphs.length!==2||paragraphs.some(p=>typeof p!=='string'||!clean(p)))issue('procedures','The approved phenol booking instructions are unavailable.');
  else lines.push('',paragraphs.map(p=>p.replace(/\bher\b/g,['her','him','them'].includes(pronoun)?pronoun:'them')).join('\n\n'));
 }
 return {ready:issues.length===0,text:lines.join('\n'),issues,category};
}
const api={initialState,makeAppointment,evaluate,catalog};
root.BookingEngine=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
