// Synthetic browser interactions only. Requires Playwright and Chromium.
const {chromium}=require('playwright');
const assert=require('assert/strict');
const path=require('path');
const fs=require('fs');

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1050}});
  const errors=[];const requests=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requests.push(request.url()));
  await page.setContent(fs.readFileSync(path.join(__dirname,'..','booking-builder.html'),'utf8'),{waitUntil:'load'});
  const copy=page.locator('#copy');
  const output=()=>page.locator('#output').inputValue();
  const reviewed=()=>page.locator('#reviewed').check();
  const select=async(id,value)=>page.locator('#'+id).selectOption(value);
  const fillProcedure=async(appointment,procedure,kind,side='LEFT',targets='synthetic target',guidance='US')=>{
   const prefix=`Appointment ${appointment} procedure ${procedure}`;
   await page.getByLabel(prefix,{exact:true}).selectOption(kind);
   await page.getByLabel(prefix+' guidance',{exact:true}).selectOption(guidance);
   await page.getByLabel(prefix+' side',{exact:true}).selectOption(side);
   await page.getByLabel(prefix+' targets',{exact:true}).fill(targets);
  };
  const noDrugs=async()=>{await select('ac-status','undocumented');await select('ap-status','undocumented');};
  const reset=async()=>page.locator('#reset').click();

  assert(await copy.isDisabled());
  assert((await output()).startsWith('DRAFT — NOT READY TO SEND'));
  assert.equal(await page.locator('#appointment-1-depends-on').count(),0);
  assert(await page.locator('#phenol-section').isHidden());
  assert(await page.locator('#platelets-decision-wrap').isHidden());

  // Existing single-appointment continuation and both independent hold templates.
  await fillProcedure(1,1,'lumbar_facet','B/L','L4–5, L5–S1','Fluoro');
  await select('appointment-1-steroid','yes');
  await select('ac-status','yes');await page.getByLabel('edoxaban',{exact:true}).check();
  await select('ap-status','asa_only');await select('platelets-status','unavailable');
  await reviewed();assert(await copy.isEnabled());
  let text=await output();
  assert(text.includes('Fluoro, B/L L4–5, L5–S1 IA facets'));
  assert(text.includes('Anticoagulation: Yes — edoxaban. Continue; no hold required.'));
  assert(text.includes('Antiplatelets (excluding ASA): No. Please confirm.'));
  assert(!text.includes('Platelets:'));assert(!text.includes('Day 1'));
  assert((await page.locator('#status').textContent()).includes('source and plan review completed'));
  assert(!(await page.locator('#status').textContent()).includes('clinician review completed'));
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedBooking=value;}}}));
  await copy.click();assert.equal(await page.evaluate(()=>window.copiedBooking),text);
  assert.equal(await page.locator('#copy-result').textContent(),'Booking copied.');
  await page.getByRole('button',{name:'Add procedure to appointment 1',exact:true}).click();
  assert(await copy.isDisabled());assert(!(await page.locator('#reviewed').isChecked()));
  await fillProcedure(1,2,'sij','RIGHT','','Fluoro');await reviewed();
  assert(await copy.isEnabled());assert((await output()).includes('IA facets + RIGHT SIJ IA injection'));
  await page.getByRole('button',{name:'Remove appointment 1 procedure 2',exact:true}).click();
  assert(await copy.isDisabled());
  await fillProcedure(1,1,'tfesi','LEFT','S1','Fluoro');
  await select('ac-plan','two_day');await page.locator('#ac-reviewed').check();await reviewed();
  assert(await copy.isEnabled());text=await output();
  assert.equal((text.match(/If procedure on Tuesday/g)||[]).length,1);
  assert.equal((text.match(/If procedure on Wednesday/g)||[]).length,1);
  await select('ap-status','yes');await page.getByLabel('clopidogrel',{exact:true}).check();
  await select('ap-plan','seven_day');await page.locator('#ac-reviewed').check();await page.locator('#ap-reviewed').check();await reviewed();
  assert(await copy.isEnabled());text=await output();
  assert(text.includes('For example, if procedure on Tuesday, last dose on Tuesday the week before. No doses starting Wednesday.'));
  assert.equal((text.match(/If procedure on Wednesday/g)||[]).length,1);
  await select('ac-status','no');await reviewed();
  assert(await copy.isDisabled());assert((await page.locator('#issues').textContent()).includes('Known medication'));

  // Count display cutoff: unavailable and 100 need no action; below 100 does.
  await reset();await fillProcedure(1,1,'gon','LEFT','');await select('appointment-1-steroid','no');await noDrugs();
  await select('platelets-status','available');await page.locator('#platelets-count').fill('100');await reviewed();
  assert(await copy.isEnabled());assert(await page.locator('#platelets-decision-wrap').isHidden());assert(!(await output()).includes('Platelets:'));
  await page.locator('#platelets-cbc').check();assert(await copy.isDisabled());await reviewed();
  assert(await copy.isEnabled());assert((await output()).includes('Obtain/review CBC before the procedure.'));assert(!(await output()).includes('Platelets:'));
  await page.locator('#platelets-cbc').uncheck();
  await page.locator('#platelets-count').fill('99.9');
  assert(!(await page.locator('#reviewed').isChecked()));assert(await page.locator('#platelets-decision-wrap').isVisible());
  await reviewed();assert(await copy.isDisabled());
  await select('platelets-decision','cbc');await reviewed();assert(await copy.isEnabled());text=await output();
  assert(text.includes('Platelets: 99.9 ×10⁹/L (date not supplied). Obtain/review CBC before the procedure.'));
  await page.locator('#platelets-count').fill('100');await reviewed();
  assert(await copy.isEnabled());assert.equal(await page.locator('#platelets-decision').inputValue(),'');assert(!(await output()).includes('Platelets:'));
  await page.locator('#platelets-count').fill('80');await page.locator('#platelets-date').fill('2026-10-01');
  await select('platelets-decision','defer');await reviewed();assert(await copy.isDisabled());
  assert((await output()).startsWith('DRAFT — NOT READY TO SEND'));
  await select('platelets-decision','proceed');await reviewed();assert(await copy.isEnabled());
  assert((await output()).includes('Platelets: 80 ×10⁹/L (2026-10-01). Proceed per clinician decision.'));
  await select('platelets-status','unavailable');await reviewed();
  assert(await copy.isDisabled());assert(await page.locator('#platelets-result').isVisible());
  assert((await page.locator('#issues').textContent()).includes('Known platelet count'));
  await page.locator('#platelets-count').fill('');await reviewed();
  assert(await copy.isEnabled());assert(await page.locator('#platelets-decision-wrap').isHidden());assert(!(await output()).includes('Platelets:'));
  await page.locator('#platelets-cbc').check();await reviewed();assert(await copy.isEnabled());
  assert((await output()).includes('Obtain/review CBC before the procedure.'));assert(!(await output()).includes('Platelets:'));

  // Separate appointments preserve the diagnostic-to-conditional-phenol sequence.
  await reset();await fillProcedure(1,1,'diagnostic_sensory','LEFT','synthetic cutaneous nerve A');
  await select('appointment-1-purpose','diagnostic');await select('appointment-1-steroid','no');
  await page.getByRole('button',{name:'Add procedure to appointment 1',exact:true}).click();
  await fillProcedure(1,2,'diagnostic_sensory','RIGHT','synthetic cutaneous nerve B');
  await page.locator('#add-appointment').click();
  await fillProcedure(2,1,'phenol','LEFT','synthetic cutaneous nerve A');
  await select('appointment-2-purpose','treatment');await select('appointment-2-steroid','no');
  assert(await page.locator('#phenol-section').isVisible());
  await select('phenol-pronoun','her');await select('appointment-2-depends-on','1');
  await page.locator('#appointment-2-condition').fill('the diagnostic block response is satisfactory after Dr. Tian review');
  await noDrugs();await select('platelets-status','unavailable');await reviewed();
  assert(await copy.isDisabled());assert((await page.locator('#issues').textContent()).includes('appointments'));
  await select('scheduling-mode','consecutive_days');await reviewed();assert(await copy.isEnabled());text=await output();
  assert(text.includes('Procedure:\n- Day 1: US, LEFT synthetic cutaneous nerve A diagnostic sensory nerve block + RIGHT synthetic cutaneous nerve B diagnostic sensory nerve block'));
  assert(text.includes('- Day 2: Possible US, LEFT synthetic cutaneous nerve A phenol neurolysis; after Day 1 only if the diagnostic block response is satisfactory after Dr. Tian review. Dr. Tian review required before proceeding.'));
  assert(text.includes('Duration: 30 minutes per appointment'));assert(text.includes('Scheduling: Consecutive days.'));
  assert(text.includes('Steroid:\n- Day 1: No\n- Day 2: No'));
  assert(text.includes("Once you have a date, let me know. I'll need to send the prescription to Medicine Shoppe on Baltzan."));
  assert(text.includes('Please book her later in the day (after 11 a.m.)'));
  assert(text.includes("Please don't book on a Tuesday after a long weekend."));
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:'/tmp/booking-builder-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.setViewportSize({width:1440,height:1050});

  // Timing choice, individual durations and a missing custom plan invalidate review.
  await page.locator('#appointment-2-duration').fill('45');await reviewed();assert(await copy.isEnabled());
  assert((await output()).includes('Duration:\n- Day 1: 30 minutes\n- Day 2: 45 minutes'));
  await select('scheduling-mode','separate_days');await reviewed();assert((await output()).includes('Scheduling: Separate days.'));
  await select('scheduling-mode','same_day');await reviewed();text=await output();assert(await copy.isEnabled());
  assert(text.includes('- Appointment 1:'));assert(text.includes('after Appointment 1 only if'));assert(!text.includes('- Day 1:'));
  await select('scheduling-mode','custom');await reviewed();assert(await copy.isDisabled());
  assert(await page.locator('#scheduling-instructions').getAttribute('required')!==null);
  await page.locator('#scheduling-instructions').fill('Two separate visits after the response review; preserve the stated local stay.');
  await reviewed();assert(await copy.isEnabled());assert((await output()).includes('Scheduling: Two separate visits after the response review; preserve the stated local stay.'));
  await select('appointment-1-steroid','yes');await reviewed();assert(await copy.isDisabled());
  assert((await page.locator('#issues').textContent()).includes('Diagnostic appointments'));
  await select('appointment-1-steroid','no');await reviewed();assert(await copy.isEnabled());

  // One-procedure restart wording must not govern an appointment sequence.
  await select('ac-status','yes');await page.getByLabel('edoxaban',{exact:true}).check();await select('ac-plan','two_day');
  await page.locator('#ac-reviewed').check();await reviewed();assert(await copy.isDisabled());
  assert((await page.locator('#issues').textContent()).includes('entire sequence'));
  assert(!(await output()).includes('If procedure on Tuesday'));

  // Removing an earlier appointment clears its direct dependency and reindexes later ones.
  await page.locator('#add-appointment').click();await select('appointment-3-depends-on','2');
  await page.locator('#appointment-3-condition').fill('the second appointment has been reviewed');
  await page.getByRole('button',{name:'Remove appointment 1',exact:true}).click();
  assert.equal(await page.locator('.appointment').count(),2);
  assert.equal(await page.locator('#appointment-1-depends-on').count(),0);
  assert.equal(await page.locator('#appointment-1-condition').count(),0);
  assert.equal(await page.locator('#appointment-1-procedure-1-kind').inputValue(),'phenol');
  assert.equal(await page.locator('#appointment-2-depends-on').inputValue(),'1');
  assert.equal(await page.locator('#appointment-2-condition').inputValue(),'the second appointment has been reviewed');
  assert(!(await output()).includes('the diagnostic block response is satisfactory'));
  await select('appointment-2-depends-on','');assert(await page.locator('#appointment-2-condition').isHidden());
  assert.equal(await page.locator('#appointment-2-condition').inputValue(),'');
  await page.getByRole('button',{name:'Remove appointment 2',exact:true}).click();
  assert(await page.locator('#scheduling-section').isHidden());assert.equal(await page.locator('#scheduling-mode').inputValue(),'');

  // Mobile controls fit, edits still invalidate review, and reset erases all patient state.
  await page.setViewportSize({width:390,height:844});
  await page.getByLabel('edoxaban',{exact:true}).uncheck();await noDrugs();await reviewed();assert(await copy.isEnabled());
  await select('phenol-pronoun','them');assert(await copy.isDisabled());assert(!(await page.locator('#reviewed').isChecked()));
  await reviewed();assert(await copy.isEnabled());assert((await output()).includes('Please book them later in the day'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.screenshot({path:'/tmp/booking-builder-mobile.png',fullPage:true});
  await reset();assert(await copy.isDisabled());text=await output();
  assert(!text.includes('edoxaban'));assert(!text.includes('clopidogrel'));assert(!text.includes('synthetic'));assert(!text.includes('Medicine Shoppe'));
  assert(!text.includes('No. Please confirm.'));assert(text.startsWith('DRAFT — NOT READY TO SEND'));
  assert.equal(await page.locator('.appointment').count(),1);assert.equal(await page.locator('.procedure').count(),1);
  assert.equal(await page.locator('#platelets-count').inputValue(),'');assert.equal(await page.locator('#phenol-pronoun').inputValue(),'them');
  assert(await page.locator('#phenol-section').isHidden());assert(await page.locator('#scheduling-section').isHidden());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  console.log('PASS: browser appointment/procedure editing, dependencies, timing, conditional phenol, platelet cutoff, anticoagulant branches, review invalidation, reset and mobile layout; no network requests.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
