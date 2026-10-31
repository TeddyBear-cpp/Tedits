const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const server=require('../preview-server.cjs').createPreviewServer();await new Promise(r=>server.listen(8090,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],failedAssets=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:8090/')&&r.status()>=400)failedAssets.push(r.url());});
  const url='http://127.0.0.1:8090/studio/index.html';
  await page.goto(url,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>document.querySelector('.hero-art').dataset.renderer==='webgl');
  await page.waitForTimeout(1200);
  await page.screenshot({path:'preview-evidence/three-forms-light.png'});
  const before=await page.locator('.hero-art').screenshot();
  await page.waitForTimeout(1800);const after=await page.locator('.hero-art').screenshot();
  const moving=!before.equals(after);
  await page.waitForFunction(()=>Number(document.querySelector('.hero-art').dataset.collisions)>0,{timeout:12000});
  const collisions=Number(await page.locator('.hero-art').getAttribute('data-collisions'));
  await page.locator('#hero-motion-toggle').click();
  const paused=await page.locator('.hero-art').getAttribute('data-motion')==='paused';
  const stillBefore=await page.locator('.hero-art').screenshot();await page.waitForTimeout(400);const stillAfter=await page.locator('.hero-art').screenshot();
  const pauseFreezes=stillBefore.equals(stillAfter);
  await page.locator('#hero-motion-toggle').click();
  const resumes=await page.locator('.hero-art').getAttribute('data-motion')==='running';
  await page.locator('#about').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.hero-art').dataset.motion==='offscreen');
  const offscreen=await page.locator('.hero-art').getAttribute('data-motion')==='offscreen';
  await page.evaluate(()=>scrollTo(0,0));await page.waitForFunction(()=>document.querySelector('.hero-art').dataset.motion==='running');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(150);
  console.log('Reduced preference state:',await page.evaluate(()=>({matches:matchMedia('(prefers-reduced-motion: reduce)').matches,art:{...document.querySelector('.hero-art').dataset},disabled:document.querySelector('#hero-motion-toggle').disabled})));
  await page.waitForFunction(()=>document.querySelector('.hero-art').dataset.motion==='reduced',null,{timeout:3000});
  const reduced=await page.locator('#hero-motion-toggle').isDisabled();
  const reducedBefore=await page.locator('.hero-art').screenshot();await page.waitForTimeout(350);const reducedAfter=await page.locator('.hero-art').screenshot();
  const reducedFreezes=reducedBefore.equals(reducedAfter);
  const views=[];
  for(const theme of ['light','dark']){
   await page.evaluate(theme=>localStorage.setItem('tedits-studio-theme',theme),theme);await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,theme);
   for(const width of [320,390,600,768,1024,1280,1440]){
    await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(120);
    views.push(await page.evaluate(()=>{const hero=document.querySelector('.hero'),rect=hero.getBoundingClientRect(),inset=parseFloat(getComputedStyle(hero.querySelector('h1')).marginLeft);return {theme:document.documentElement.dataset.theme,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,renderer:hero.querySelector('.hero-art').dataset.renderer,inset,contained:[...hero.querySelectorAll('.hero-meta p,h1,.hero-bottom a,.hero-bottom>p')].every(n=>{const range=document.createRange();range.selectNodeContents(n);const r=range.getBoundingClientRect();return r.left>=rect.left+inset-1&&r.right<=rect.right-inset+1;}),anchors:[...document.querySelectorAll('a[href^="#"]')].every(a=>!!document.querySelector(a.getAttribute('href')))};}));
    if(width===390||width===1440)await page.screenshot({path:'preview-evidence/three-forms-'+theme+'-'+width+'.png'});
   }
  }
  const fallback=await browser.newPage({viewport:{width:390,height:844}});
  await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);};});
  await fallback.goto(url,{waitUntil:'domcontentloaded'});
  const staticFallback=await fallback.locator('.hero-art').getAttribute('data-renderer')==='static'&&await fallback.locator('.hero-art-fallback').isVisible();
  const result={moving,collisions,paused,pauseFreezes,resumes,offscreen,reduced,reducedFreezes,staticFallback,views,errors,failedAssets};
  fs.writeFileSync('preview-evidence/three-forms-checks.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
  if([moving,collisions>0,paused,pauseFreezes,resumes,offscreen,reduced,reducedFreezes,staticFallback].some(v=>!v)||views.some(v=>v.overflow||!v.contained||!v.anchors)||errors.length||failedAssets.length)throw Error('Hero validation failed');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
