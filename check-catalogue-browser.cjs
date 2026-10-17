const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const server=require('./preview-server.cjs').createPreviewServer();
 await new Promise(r=>server.listen(8092,'127.0.0.1',r));let browser;
 try {
  browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const width of [390,1440]) {
   await page.setViewportSize({width,height:900});
   for(const concept of ['catering','rivet-beam','afterhours']) {
    await page.goto(`http://127.0.0.1:8092/_site-video/studio/projects/${concept}/index.html`);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${concept} overflow`);
    if(concept==='catering') {
     await page.locator('[role=tab]').nth(1).click();
     assert.equal(await page.locator('#menu-title').innerText(),'A slower start.\nA lovely spread.');
     await page.keyboard.press('ArrowRight');
     assert.equal(await page.locator('[role=tab][aria-selected=true]').innerText(),'Everyday meals');
     await page.locator('#menu-enquiry').click();
     assert.equal(await page.locator('#occasion').inputValue(),'Weekly meal prep');
    }
    if(concept==='rivet-beam') {
     await page.locator('.product a').nth(1).click();
     assert.equal(await page.locator('#sample-material').inputValue(),'tubes');
    }
    if(concept==='afterhours') {
     await page.waitForFunction(()=>[...document.querySelectorAll('audio')].every(a=>a.duration>0));
     await page.locator('[data-play]').first().click();
     await page.waitForFunction(()=>!document.querySelector('audio').paused);
     await page.locator('[data-play]').nth(1).click();
     assert.ok(await page.locator('audio').first().evaluate(a=>a.paused));
     await page.keyboard.press('Escape');
    }
   }
  }
  assert.deepEqual(errors,[]);console.log('Desktop/mobile catalogue checks passed: menu tabs, enquiry mapping, audio playback, no overflow or JS errors.');
 } finally {await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
