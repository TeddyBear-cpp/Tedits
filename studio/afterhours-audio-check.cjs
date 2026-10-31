const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
(async()=>{
 const server=require('../preview-server.cjs').createPreviewServer();await new Promise(r=>server.listen(8090,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],failedAssets=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:8090')&&r.status()>=400)failedAssets.push(r.url());});
  const url='http://127.0.0.1:8090/studio/projects/afterhours/index.html#beats';
  await page.goto(url,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>[...document.querySelectorAll('audio')].length===2&&[...document.querySelectorAll('audio')].every(a=>Number.isFinite(a.duration)&&a.duration>0));
  const durations=await page.locator('audio').evaluateAll(as=>as.map(a=>({source:a.currentSrc,duration:a.duration,paused:a.paused})));
  assert.ok(durations.every(a=>a.paused),'Audio must not autoplay');
  const first=page.locator('[data-audio-track]').nth(0),second=page.locator('[data-audio-track]').nth(1);
  await first.locator('[data-play]').click();await page.waitForFunction(()=>document.querySelector('audio').currentTime>.2&&!document.querySelector('audio').paused);
  await second.locator('[data-play]').click();await page.waitForFunction(()=>document.querySelectorAll('audio')[1].currentTime>.2&&!document.querySelectorAll('audio')[1].paused);
  const oneAtATime=await page.locator('audio').evaluateAll(as=>as[0].paused&&!as[1].paused);assert.ok(oneAtATime);
  await second.locator('[data-play]').click();assert.equal(await second.locator('[data-play]').getAttribute('aria-pressed'),'false');
  await second.locator('[data-seek]').evaluate(input=>{input.value=500;input.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(()=>Math.abs(document.querySelectorAll('audio')[1].currentTime/document.querySelectorAll('audio')[1].duration-.5)<.03);
  const seekWorks=true;
  await second.locator('[data-seek]').focus();const previous=await second.locator('audio').evaluate(a=>a.currentTime);await page.keyboard.press('ArrowRight');
  const keyboardSeek=Math.abs(await second.locator('audio').evaluate(a=>a.currentTime)-previous-5)<.1;assert.ok(keyboardSeek);
  await second.locator('[data-mute]').click();const muteWorks=await second.locator('audio').evaluate(a=>a.muted);assert.ok(muteWorks);
  await second.locator('[data-mute]').click();assert.ok(!(await second.locator('audio').evaluate(a=>a.muted)));
  await second.locator('[data-play]').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelectorAll('audio')[1].paused);await page.keyboard.press('Escape');
  const escapePauses=await page.locator('audio').evaluateAll(as=>as.every(a=>a.paused));assert.ok(escapePauses);
  await second.locator('audio').evaluate(a=>{a.currentTime=a.duration-.15;});await second.locator('[data-play]').click();await page.waitForFunction(()=>document.querySelectorAll('audio')[1].ended);
  const endedResets=await second.locator('[data-play]').getAttribute('aria-pressed')==='false';assert.ok(endedResets);
  await second.locator('[data-play]').click();await page.waitForFunction(()=>!document.querySelectorAll('audio')[1].paused&&document.querySelectorAll('audio')[1].currentTime<3);await page.keyboard.press('Escape');
  const replayWorks=true,views=[];
  for(const width of [320,390,600,768,1024,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('#beats').scrollIntoViewIfNeeded();
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const view=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,seekEnabled:[...document.querySelectorAll('[data-seek]')].every(i=>!i.disabled),credits:[...document.querySelectorAll('.track-title-group small')].every(i=>i.textContent.includes('TEDDYBEAR')),noPlaceholderTracks:!document.querySelector('#beats').textContent.includes('Audio pending')}));
   console.log('Audio layout:',view);
   if(view.overflow||!view.seekEnabled||!view.credits||!view.noPlaceholderTracks)console.log('Audio state:',await page.evaluate(()=>({audio:[...document.querySelectorAll('audio')].map(a=>({duration:a.duration,currentTime:a.currentTime,error:a.error&&a.error.code,networkState:a.networkState})),overflows:[...document.querySelectorAll('body *')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&(r.left<-.5||r.right>innerWidth+.5)}).map(n=>({tag:n.tagName,class:n.className,left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right}))})));
   assert.ok(!view.overflow&&view.seekEnabled&&view.credits&&view.noPlaceholderTracks);views.push(view);
   if(width===390||width===1440)await page.screenshot({path:'preview-evidence/afterhours-audio-'+width+'.png'});
  }
  const response=await page.request.get('http://127.0.0.1:8090/studio/projects/afterhours/assets/audio/the-lead-teddybear.mp3',{headers:{Range:'bytes=0-99'}});
  const rangeSupport=response.status()===206&&response.headers()['content-type']==='audio/mpeg'&&(await response.body()).length===100;assert.ok(rangeSupport);
  const fallback=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await fallback.goto(url,{waitUntil:'domcontentloaded'});
  const nativeFallback=await fallback.locator('audio[controls]').count()===2&&await fallback.locator('audio').first().isVisible();assert.ok(nativeFallback);
  const broken=await browser.newPage();await broken.route('**/assets/audio/the-lead-teddybear.mp3',route=>route.fulfill({status:404,body:''}));await broken.goto(url,{waitUntil:'domcontentloaded'});
  await broken.locator('[data-audio-track]').nth(1).locator('.track-error').waitFor({state:'visible'});const loadErrorVisible=true;
  const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const copiesMatch=hash('C:/Users/user/Downloads/THE -EAD-TeddyBear.mp3')===hash('projects/afterhours/assets/audio/the-lead-teddybear.mp3')&&hash('C:/Users/user/Downloads/do-this-often-TeddyBear.mp3')===hash('projects/afterhours/assets/audio/do-this-often-teddybear.mp3');assert.ok(copiesMatch);
  const report={durations,oneAtATime,seekWorks,keyboardSeek,muteWorks,escapePauses,endedResets,replayWorks,rangeSupport,nativeFallback,loadErrorVisible,copiesMatch,views,errors,failedAssets};
  fs.writeFileSync('preview-evidence/afterhours-audio-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert.deepEqual(errors,[]);assert.deepEqual(failedAssets,[]);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
