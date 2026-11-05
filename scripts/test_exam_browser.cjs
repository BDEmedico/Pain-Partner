'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1400,height:1000}}),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.setContent(fs.readFileSync(path.join(__dirname,'..','exam-builder.html'),'utf8'));
  assert.equal(errors.length,0);assert(await page.locator('#copy-final').isDisabled());
  assert((await page.locator('#output').inputValue()).includes('[Comfortable|Uncomfortable|Distressed]'));
  assert.equal(await page.locator('#final-output').inputValue(),'');
  const load=async(region,rows)=>page.evaluate(({region,rows})=>{
   const c=JSON.parse(document.getElementById('exam-catalog').textContent),state={region,header:'EXAM',rows:Object.fromEntries(c.regions[region].lines.map(r=>[r.id,{status:'omitted'}]))};Object.assign(state.rows,rows);ExamReview.load(state);
  },{region,rows});
  // Null removes the whole optional line, not its nested alternatives.
  await load('lumbar',{vascular:{status:'review',selections:{}}});
  await page.getByLabel('Vascular (optional) g0',{exact:true}).selectOption('0');
  assert.equal((await page.locator('#output').inputValue()).trim(),'EXAM');assert(await page.locator('#copy-final').isEnabled());
  // Reset does not turn an omitted finding into normal.
  await page.locator('#reset').click();assert(await page.locator('#copy-final').isDisabled());
  // Detailed cuff expansion produces nested controls, with no normal preselection.
  await load('shoulder',{cuff:{status:'review',selections:{}}});
  let select=page.locator('details.card').filter({has:page.locator('summary', {hasText:'Rotator cuff'})}).locator('select').first();
  await select.selectOption('1');
  assert((await page.locator('#output').inputValue()).includes('empty can [5|4|3|2]/5'));
  assert(await page.locator('#copy-final').isDisabled());
  // Cervical macro normal suffix needs the whole-line confirmation.
  await load('cervical',{motor:{status:'review',selections:{}}});
  await page.getByLabel('Motor g9',{exact:true}).selectOption('1');
  assert((await page.locator('#output').inputValue()).includes('Contralateral 5/5'));
  assert((await page.locator('.warning').allTextContents()).some(t=>t.includes('Contralateral 5/5')));
  let state=await page.evaluate(()=>{
   const s=ExamReview.getState(),c=JSON.parse(document.getElementById('exam-catalog').textContent),row=s.rows.motor,spec=c.regions.cervical.lines.find(x=>x.id==='motor');
   for(let i=0;i<5;i++){const r=ExamEngine.renderLine(spec.text,row.selections,c.macros);for(const ctl of r.controls){if(ctl.kind==='group'&&!(ctl.id in row.selections))row.selections[ctl.id]=0;}}return s;
  });
  await page.evaluate(s=>ExamReview.load(s),state);assert(await page.locator('#copy-final').isDisabled());
  await page.getByLabel('Confirm Motor',{exact:true}).check();assert(await page.locator('#copy-final').isEnabled());
  // Explicit abnormal literals can preserve findings outside the dropdown options.
  await load('lumbar',{motor:{status:'supported',text:'- Motor: RIGHT L4 1/5; LEFT L4 4-/5.'}});
  assert.equal(await page.locator('#final-output').inputValue(),'EXAM\n- Motor: RIGHT L4 1/5; LEFT L4 4-/5.');
  // Changing literal text invalidates the prior support/confirmation.
  const motorCard=page.locator('details.card').filter({has:page.locator('summary',{hasText:'Motor'})});
  await motorCard.getByText('Edit wording / enter a specific finding',{exact:true}).click();
  await page.getByLabel('Motor wording',{exact:true}).fill('- Motor: LEFT L4 3/5.');await page.getByLabel('Motor wording',{exact:true}).blur();
  assert(await page.locator('#copy-final').isDisabled());
  // Native curly syntax preserved until explicitly edited; no invented meaning.
  await load('cervical',{reflexes:{status:'review'}});
  assert((await page.locator('#output').inputValue()).includes('{bilateral biceps'));
  assert(await page.locator('#copy-final').isDisabled());
  assert((await page.locator('#issues').innerText()).includes('native brace'));
  // Demonstration screenshot contains no patient data.
  await load('lumbar',{motor:{status:'supported',text:'- Motor: L2–S1 5/5 B/L.'},reflexes:{status:'review',text:'- Reflexes: RIGHT patellar and Achilles B/L 2+. LEFT patellar [decreased|1+|0].'},sensation:{status:'supported',text:'- Sensation: L2–S1 intact to light touch B/L.'},vascular:{status:'review'}});
  await page.screenshot({path:'/tmp/exam-builder-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.screenshot({path:'/tmp/exam-builder-mobile.png',fullPage:true});
  // Copy review is intentional; it does not unlock incomplete final output.
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedExam=text;}},configurable:true}));
  await page.locator('#copy-review').click();assert.equal(await page.evaluate(()=>window.copiedExam),await page.locator('#output').inputValue());
  assert(await page.locator('#copy-final').isDisabled());assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  console.log('PASS: browser unresolved/null/reset, macro expansion, confirmation, abnormal literal override, native braces, copy, mobile and no network.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
