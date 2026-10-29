const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const out='studio/preview-evidence/story'; fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const report={views:[],errors:[],failed:[]};
 for(const [name,width,height] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844],['small',320,640],['short',390,570]]){
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>report.errors.push(`${name}: ${e.message}`));
  page.on('response',r=>{if(r.status()>=400) report.failed.push(`${r.status()} ${r.url()}`);});
  await page.goto('http://127.0.0.1:8084/studio/index.html',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{sessionStorage.setItem('tedits-loader-studio','1');document.documentElement.classList.remove('loader-active');});
  await page.waitForTimeout(350);
  const positions=await page.evaluate(()=>{const el=document.querySelector('.scroll-story'),stage=el.querySelector('.story-stage');return{start:el.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(stage).top)||0),distance:el.offsetHeight-stage.offsetHeight,pinned:el.dataset.pinned};});
  const view={name,width,height,...positions,frames:[]};
  for(const [label,progress]of [['first',0],['middle',.4],['last',.85]]){
   await page.evaluate(({positions,progress})=>window.TeditsScroll.scrollTo(positions.start+positions.distance*progress,{immediate:true}),{positions,progress});
   await page.waitForTimeout(200);
   const frame=await page.evaluate(()=>{const scene=document.querySelector('.scroll-story'),stage=scene.querySelector('.story-stage'),active=[...scene.querySelectorAll('.story-chapter')].filter(el=>getComputedStyle(el).opacity>.99);return{progress:scene.dataset.progress,stageTop:stage.getBoundingClientRect().top,active:active.map(el=>el.querySelector('h3').innerText),bounds:active.map(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom})),overflow:document.documentElement.scrollWidth>innerWidth,lenis:!!window.TeditsScroll.instance};});
   view.frames.push({label,...frame});
   if(positions.pinned==='true') {assert(!frame.overflow,`${name} overflow`);assert(frame.active.length===1,`${name}/${label} chapter count`);assert(frame.bounds.every(b=>b.top>=65&&b.bottom<=height-40),`${name}/${label} clipped ${JSON.stringify(frame.bounds)}`);}
   await page.screenshot({path:`${out}/${name}-${label}.png`});
  }
  if(positions.pinned==='true'){
   await page.locator('[data-story-step="0"]').click();await page.waitForTimeout(1000);
   assert((await page.locator('[data-story-step="0"]').getAttribute('aria-current'))==='step');
   if(await page.locator('.story-controls>a').isVisible()) {
    await page.locator('.story-controls>a').click();await page.waitForTimeout(1000);
    assert((await page.locator('#your-website').boundingBox()).y<height);
   }
  }
  await page.evaluate(()=>window.TeditsScroll.scrollTo(document.querySelector('#why'),{immediate:true}));await page.waitForTimeout(200);
  await page.screenshot({path:`${out}/${name}-intro.png`});
  await page.evaluate(()=>document.querySelector('#rotation-pause').click());
  const old=await page.locator('.business-current').textContent();await page.waitForTimeout(3350);assert.equal(await page.locator('.business-current').textContent(),old);
  await page.evaluate(()=>window.TeditsScroll.scrollTo(document.querySelector('#work'),{immediate:true}));await page.waitForTimeout(650);
  await page.screenshot({path:`${out}/${name}-work.png`});
  await page.evaluate(()=>window.TeditsScroll.scrollTo(document.querySelector('#pricing'),{immediate:true}));await page.waitForTimeout(650);
  await page.screenshot({path:`${out}/${name}-offer.png`});
  report.views.push(view);await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto('http://127.0.0.1:8084/studio/index.html',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.scroll-story').getAttribute('data-pinned'),'false');
 assert.equal(await page.locator('.story-chapter[aria-hidden]').count(),0);
 assert.equal(await page.evaluate(()=>!!window.TeditsScroll.instance),false);
 await page.locator('#website-story').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/reduced-mobile.png`});
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);
 assert.equal(await page.locator('.scroll-story').getAttribute('data-pinned'),'true');
 await page.evaluate(()=>{document.documentElement.dataset.theme='dark';window.TeditsScroll.scrollTo(document.querySelector('.scroll-story').offsetTop-72,{immediate:true});});await page.waitForTimeout(200);
 await page.screenshot({path:`${out}/dark-mobile.png`});
 await page.goto('http://127.0.0.1:8084/studio/why-teditstudio.html',{waitUntil:'networkidle'});assert(page.url().endsWith('studio/index.html#why'));
 await page.close();
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 await nojs.goto('http://127.0.0.1:8084/studio/index.html',{waitUntil:'networkidle'});
 assert.equal(await nojs.locator('.story-chapter:visible').count(),3);
 await nojs.locator('#website-story').scrollIntoViewIfNeeded();await nojs.screenshot({path:`${out}/nojs-mobile.png`});
 await nojs.close();
 const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await touch.goto('http://127.0.0.1:8084/studio/index.html',{waitUntil:'networkidle'});
 await touch.evaluate(()=>{const scene=document.querySelector('.scroll-story');window.TeditsScroll.scrollTo(scene.offsetTop-72,{immediate:true});});
 await touch.waitForTimeout(200);
 const before=await touch.evaluate(()=>scrollY);
 const cdp=await touch.context().newCDPSession(touch);
 for(let swipe=0;swipe<3;swipe++){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:220,y:700}]});
  for(let step=1;step<=8;step++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:220,y:700-step*45}]});await touch.waitForTimeout(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.waitForTimeout(300);
 }
 const movement=await touch.evaluate(()=>({y:scrollY,top:document.querySelector('.story-stage').getBoundingClientRect().top,progress:document.querySelector('.scroll-story').dataset.progress,nativeTouch:window.TeditsScroll.instance.options.syncTouch===false}));
 assert(movement.y>before+600);assert(movement.nativeTouch);assert(movement.progress>.2);
 report.touch=movement;
 await touch.screenshot({path:`${out}/touch-mobile.png`});await touch.close();await browser.close();
 fs.writeFileSync(`${out}/checks.json`,JSON.stringify(report,null,2));
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failed,[]);
 console.log(JSON.stringify({views:report.views.map(v=>({name:v.name,pinned:v.pinned})),touch:report.touch,errors:report.errors,failed:report.failed},null,2));
})().catch(e=>{console.error(e);process.exit(1);});
