/* Deterministic examination text assembly. No clinical inference or persistence. */
(function(root){
'use strict';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const obj=o=>o&&typeof o==='object'&&!Array.isArray(o);
function parse(text,prefix='',offset=0,depth=0){
 if(typeof text!=='string')throw new Error('Examination text must be a string.');
 if(depth>40)throw new Error('Examination nesting is too deep.');
 const nodes=[];let start=0;
 const push=end=>{if(end>start)nodes.push({type:'text',text:text.slice(start,end),offset:offset+start});};
 for(let i=0;i<text.length;i++){
  if(text[i]===']'||text[i]==='}')throw new Error('Unexpected examination selection delimiter.');
  if(text[i]!== '['&&text[i]!== '{')continue;
  push(i);const open=text[i],close=open==='['?']':'}';let stack=[close],j=i+1;
  for(;j<text.length&&stack.length;j++){
   const c=text[j];if(c==='[')stack.push(']');else if(c==='{')stack.push('}');
   else if(c===']'||c==='}') {if(c!==stack.pop())throw new Error('Mismatched examination selection delimiters.');}
  }
  if(stack.length)throw new Error('Unclosed examination selection.');
  const raw=text.slice(i,j),id=prefix+(open==='['?'g':'b')+(offset+i);
  if(open==='{')nodes.push({type:'opaque',id,raw});
  else {
   const inner=raw.slice(1,-1);let from=0,nest=0;const options=[];
   for(let k=0;k<=inner.length;k++){
    const c=inner[k];if(c==='['||c==='{')nest++;else if(c===']'||c==='}')nest--;
    if(k===inner.length||(c==='|'&&nest===0)){
     const option=inner.slice(from,k);options.push({raw:option,nodes:parse(option,prefix,offset+i+1+from,depth+1)});from=k+1;
    }
   }
   nodes.push({type:'group',id,raw,options});
  }
  i=j-1;start=j;
 }
 push(text.length);return nodes;
}
function cleanup(text){
 return text.split(/\r?\n/).map(line=>line.replace(/[ \t]{2,}/g,' ').replace(/\s+([,.;:])/g,'$1').replace(/,\s*([.;])/g,'$1').replace(/\.\s*\./g,'.').trim()).filter(line=>line&&!/^[-•]?[\s.,;:]*$/.test(line)).join('\n');
}
// IDs from parse offsets remain stable. Macro groups use `<origin>/m<name>/g<offset>`.
// Arrays explicitly select multiple square-group options; no multi-select is inferred.
function renderLine(text,selections={},macros={},options={}){
 if(!obj(selections)||!obj(macros))throw new Error('Selections and macros must be objects.');
 const unresolved=[],controls=[],issues=[];let omitted=false,expanded=false;
 function expandText(node,allowed,path,chain){
  return node.text.replace(/\bexam[A-Za-z0-9_]+\b/g,(name,at)=>{
   const id=path+'m'+name+'@'+(node.offset+at);
   if(!own(macros,name)||typeof macros[name]!=='string') {unresolved.push({id,kind:'macro',name});return name;}
   if(!allowed){unresolved.push({id,kind:'macro',name,available:true});return name;}
   if(chain.includes(name)||chain.length>20){issues.push('Cyclic macro expansion: '+name);unresolved.push({id,kind:'macro',name});return name;}
   expanded=true;return walk(parse(macros[name],id+'/',0),true,id+'/',chain.concat(name));
  });
 }
 function walk(nodes,allowed=false,path='',chain=[]){
  return nodes.map(node=>{
   if(node.type==='text')return expandText(node,allowed,path,chain);
   if(node.type==='opaque'){
    controls.push({id:node.id,kind:'opaque',raw:node.raw,options:[],value:null});
    unresolved.push({id:node.id,kind:'opaque',raw:node.raw});return node.raw;
   }
   const has=own(selections,node.id),choice=has?selections[node.id]:undefined;
   const indices=Array.isArray(choice)?choice:[choice];
   controls.push({id:node.id,kind:'group',raw:node.raw,options:node.options.map(o=>o.raw),value:has?choice:null});
   if(!has||choice===null||choice===undefined||indices.length===0){unresolved.push({id:node.id,kind:'selection'});return node.raw;}
   if(indices.some(i=>!Number.isInteger(i)||i<0||i>=node.options.length)||new Set(indices).size!==indices.length){issues.push('Invalid selection for '+node.id);unresolved.push({id:node.id,kind:'selection'});return node.raw;}
   const nulls=indices.filter(i=>node.options[i].raw.trim()==='null');
   if(nulls.length){
    if(indices.length!==1){issues.push('null cannot be combined with another option: '+node.id);unresolved.push({id:node.id,kind:'selection'});return node.raw;}
    omitted=true;return '';
   }
   return indices.map(i=>walk(node.options[i].nodes,true,node.id+'/o'+i+'/',chain)).join(' ');
  }).join('');
 }
 let rendered=walk(parse(text),options.expandRawMacros===true);
 if(/___/.test(rendered))unresolved.push({id:'measurement',kind:'measurement'});
 if(omitted||expanded)rendered=cleanup(rendered);
 if(rendered.split(/\r?\n/).some(line=>/^\s*-?\s*[^:\[\]{}]+:\s*[.;]?\s*$/.test(line)))unresolved.push({id:'empty-label',kind:'empty_label'});
 return {text:rendered,unresolved,controls,issues};
}
function render(state,catalog,mode='review'){
 const issues=[],unresolved=[];const lines=[];const rowResults=[];
 if(!['review','final'].includes(mode))return {text:'',ready:false,issues:['Unknown output mode.'],unresolved:[],rows:[]};
 if(!obj(state)||!obj(catalog)||!obj(catalog.regions)||!own(catalog.regions,state.region))return {text:'',ready:false,issues:['Select a known examination region.'],unresolved:[],rows:[]};
 const region=catalog.regions[state.region];const definitions=region.lines;
 if(!Array.isArray(definitions))return {text:'',ready:false,issues:['Region lines must be an array.'],unresolved:[],rows:[]};
 if(!definitions.length)issues.push('The selected region has no examination rows.');
 const header=state.header===undefined?'EXAM':state.header;
 if(typeof header!=='string'||! /^(?:EXAM|Previous EXAM|previous EXAM|Referral exam)(?: [^\r\n]+)?$/.test(header))issues.push('Use an explicit current or historical examination header.');
 if(state.rows!==undefined&&!obj(state.rows))issues.push('Examination rows must be an object.');
 const rows=obj(state.rows)?state.rows:{};const ids=new Set(definitions.map(d=>d.id));
 if(ids.size!==definitions.length)issues.push('Examination row identifiers must be unique.');
 for(const id of Object.keys(rows))if(!ids.has(id))issues.push('Unknown examination row: '+id);
 for(const def of definitions){
  const row=own(rows,def.id)?rows[def.id]:{};
  if(!obj(row)){issues.push('Invalid row: '+def.id);continue;}
  const status=row.status||'review';
  if(!['review','supported','omitted'].includes(status)){issues.push('Invalid row status: '+def.id);continue;}
  if(status==='omitted'){rowResults.push({id:def.id,text:'',omitted:true,controls:[],unresolved:[]});continue;}
  const text=own(row,'text')?row.text:def.text;
  try {
   const result=renderLine(text,row.selections||{},catalog.macros||{},{expandRawMacros:status==='supported'});
   const line=result.text.trim();rowResults.push({id:def.id,...result});
   issues.push(...result.issues.map(x=>def.id+': '+x));unresolved.push(...result.unresolved.map(x=>({row:def.id,...x})));
   if(line){
    lines.push(line);
    // The whole row must be supported or explicitly confirmed, including fixed macro
    // suffixes such as Contralateral 5/5. A selected side/grade is not that confirmation.
    if(status!=='supported'&&row.confirmed!==true)unresolved.push({row:def.id,id:'confirmation',kind:'confirmation'});
   }
  }catch(error){issues.push(def.id+': '+error.message);}
 }
 const ready=issues.length===0&&unresolved.length===0;
 const text=[header,...lines].join('\n');
 return {text:mode==='final'&&!ready?'':text,issues,unresolved,ready,rows:rowResults};
}
// Exact current/historical header selection; adjacent content and surrounding
// whitespace remain byte-for-byte unchanged. Unknown/duplicate headers fail closed.
function replaceSection(chart,header,exam){
 if([chart,header,exam].some(v=>typeof v!=='string')||/[\r\n]/.test(header))throw new Error('Invalid section replacement input.');
 const matches=[];let offset=0;const all=chart.match(/[^\r\n]*(?:\r\n|\n|\r|$)/g)||[];
 for(const raw of all){if(!raw)continue;const content=raw.replace(/[\r\n]+$/,'');if(content===header)matches.push({start:offset,end:offset+raw.length});offset+=raw.length;}
 if(matches.length!==1)throw new Error('Examination header must occur exactly once.');
 if(!exam.startsWith(header+'\n')&&!exam.startsWith(header+'\r\n')&&exam!==header)throw new Error('Replacement must retain the selected examination header.');
 const start=matches[0].start;let end=chart.length;offset=matches[0].end;
 const tail=chart.slice(offset).match(/[^\r\n]*(?:\r\n|\n|\r|$)/g)||[];
 for(const raw of tail){
  if(!raw)continue;const content=raw.replace(/[\r\n]+$/,'');
  if(/^(?:[A-Z][A-Z /_-]{2,}|(?:Previous EXAM|previous EXAM|Referral exam)(?: .*)?|CC:)\s*$/.test(content)){end=offset;break;}
  offset+=raw.length;
 }
 const section=chart.slice(start,end);const spacing=(section.match(/(?:\r\n|\n|\r)+$/)||[''])[0];
 return chart.slice(0,start)+exam.replace(/(?:\r\n|\n|\r)+$/,'')+spacing+chart.slice(end);
}
const api={parse,renderLine,render,replaceSection};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.ExamEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
