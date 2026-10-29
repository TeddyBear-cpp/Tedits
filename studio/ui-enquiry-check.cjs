const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='studio/preview-evidence/enquiry-steps';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=require('../preview-server.cjs').createPreviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`, browser=await chromium.launch({headless:true,channel:'msedge'});
 const report={views:[],errors:[],failed:[],submissions:[]};
 try{
 for(const [label,width,height]of[['desktop',1440,900],['mobile',390,844],['small',320,640]]){
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)report.failed.push(r.url());});
  let submits=0,success=false;
  await page.route('https://formspree.io/f/mbggrwra',async route=>{submits++;report.submissions.push({view:label,data:route.request().postData()});await new Promise(r=>setTimeout(r,120));await route.fulfill({status:success?200:500,contentType:'application/json',body:JSON.stringify(success?{ok:true}:{error:'test'})});});
  await page.goto(`${base}/studio/enquire.html`,{waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-enquiry-step]:visible').count(),1);
  await page.locator('#quote-form').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${label}-project.png`});
  await page.locator('#quote-next').click();assert.equal(await page.locator('#needs-error').isVisible(),true);assert.equal(submits,0);
  await page.getByLabel('Refresh my website',{exact:false}).check();await page.locator('#quote-business').fill('Test & <script>business</script>');
  await page.locator('#quote-business').press('Enter');await page.locator('#details-step-title').waitFor({state:'visible'});assert.equal(submits,0);
  assert(await page.locator('#existing-site-field').isVisible());await page.locator('#quote-website').fill('example.test');
  await page.locator('#quote-next').click();assert(await page.locator('#details-error').isVisible());
  await page.locator('#quote-details').fill('A test project to make enquiries easier.');await page.locator('#quote-timeline').selectOption('Within a month');
  await page.locator('#quote-next').click();await page.locator('#contact-step-title').waitFor({state:'visible'});
  assert((await page.locator('#review-project').textContent()).includes('<script>business</script>'));assert.equal(await page.locator('#quote-review script').count(),0);
  await page.goBack();assert(await page.locator('#details-step-title').isVisible());assert.equal(await page.locator('#quote-details').inputValue(),'A test project to make enquiries easier.');
  await page.goForward();assert(await page.locator('#contact-step-title').isVisible());
  await page.locator('#quote-submit').click();assert(await page.locator('#name-error').isVisible());assert(await page.locator('#email-error').isVisible());assert.equal(submits,0);
  await page.locator('#quote-name').fill('Preview Test');await page.locator('#quote-email').fill('invalid');await page.locator('#quote-submit').click();assert(await page.locator('#email-error').isVisible());
  await page.locator('#quote-email').fill('preview@example.test');
  await page.screenshot({path:`${out}/${label}-contact.png`});
  await page.locator('[data-edit-step="0"]').click();await page.getByLabel('Help me figure it out',{exact:false}).check();await page.locator('#quote-next').click();assert(!(await page.locator('#existing-site-field').isVisible()));assert(await page.locator('#quote-website').isDisabled());
  await page.screenshot({path:`${out}/${label}-details.png`});
  await page.locator('#quote-next').click();assert.equal(await page.locator('#quote-name').inputValue(),'Preview Test');
  await page.locator('#quote-submit').click();await page.waitForFunction(()=>document.querySelector('#quote-status').dataset.state==='error');
  assert.equal(await page.locator('#quote-email').inputValue(),'preview@example.test');assert.equal(await page.locator('#quote-details').inputValue(),'A test project to make enquiries easier.');
  assert(!report.submissions.at(-1).data.includes('name="existing_website"'));assert(report.submissions.at(-1).data.includes('Help me figure it out'));
  success=true;await page.locator('#quote-submit').click();await page.locator('#quote-success').waitFor({state:'visible'});assert.equal(submits,2);assert.equal(await page.locator('#quote-controls').isVisible(),false);
  await page.screenshot({path:`${out}/${label}-success.png`});await page.locator('#quote-restart').click();assert(await page.locator('#project-step-title').isVisible());assert.equal(await page.locator('#quote-name').inputValue(),'');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert(!overflow);report.views.push({label,width,height,overflow});
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByLabel('A new website',{exact:false}).check();await page.locator('#quote-next').focus();await page.keyboard.press('Enter');
  assert(await page.locator('#details-step-title').isVisible());assert.equal(await page.locator('[data-enquiry-step]:visible').evaluate(el=>el.getAnimations().filter(a=>a.playState==='running').length),0);
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(`${base}/studio/index.html`,{waitUntil:'networkidle'});await page.waitForTimeout(2600);
 const magnet=page.locator('[data-magnetic]'),bounds=await magnet.boundingBox();await page.mouse.move(bounds.x+bounds.width*.88,bounds.y+bounds.height*.5);await page.waitForTimeout(400);
 const displaced=await magnet.evaluate(el=>parseFloat(el.style.getPropertyValue('--wa-x')));assert(displaced>2,'magnetic motion missing');
 await page.mouse.move(bounds.x-40,bounds.y-40);await page.waitForTimeout(1100);assert(Math.abs(await magnet.evaluate(el=>parseFloat(el.style.getPropertyValue('--wa-x'))))<.1);
 const details=page.locator('.case-study').first();await details.locator('summary').click();await page.waitForTimeout(350);assert(await details.getAttribute('open')!==null);await details.locator('summary').click();await page.waitForTimeout(350);assert.equal(await details.getAttribute('open'),null);
 await details.locator('summary').click();await page.waitForTimeout(40);await details.locator('summary').click();await page.waitForTimeout(350);assert.equal(await details.getAttribute('open'),null);
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);await page.locator('#theme-toggle').click();await page.waitForTimeout(350);
 const icons=await page.locator('#theme-toggle svg').evaluateAll(els=>els.map(el=>getComputedStyle(el).opacity));assert.deepEqual(icons.sort(),['0','1']);
 await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(bounds.x+bounds.width*.9,bounds.y+bounds.height*.5);await page.waitForTimeout(100);assert.equal(await magnet.evaluate(el=>parseFloat(el.style.getPropertyValue('--wa-x'))),0);
 assert.equal(await page.locator('.story-chapter h3').last().textContent(),'An easier next step.');await page.close();
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(`${base}/studio/enquire.html`,{waitUntil:'networkidle'});assert.equal(await nojs.locator('[data-enquiry-step]:visible').count(),3);assert(await nojs.locator('#quote-submit').isVisible());assert.equal(await nojs.locator('#quote-form').getAttribute('action'),'https://formspree.io/f/mbggrwra');await nojs.close();
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failed,[]);fs.writeFileSync(`${out}/checks.json`,JSON.stringify({...report,submissions:report.submissions.map(s=>({view:s.view,intercepted:true}))},null,2));console.log(JSON.stringify({views:report.views,submissions:report.submissions.length,magnetic:true,details:true,theme:true,reducedMotion:true,noJS:true,errors:report.errors,failed:report.failed},null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
