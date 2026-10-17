const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.argv[2]||'http://127.0.0.1:8084/_site-video/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage(),errors=[],views=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  for(const route of ['studio/index.html','studio/projects/catering/index.html','studio/projects/rivet-beam/index.html','studio/projects/afterhours/index.html']){
   for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(base+route,{waitUntil:'domcontentloaded'});
    for(const img of await page.locator('img').all())await img.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    await page.evaluate(()=>document.fonts.ready);
    const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,anchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.getAttribute('href')!=='#').every(a=>document.querySelector(a.getAttribute('href'))),title:document.title}));
    assert.equal(state.overflow,false,`${route} ${width} overflow`);assert.ok(state.anchors,`${route} anchors`);
    views.push({route,width,...state});
    if(width===390){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`preview-evidence/live-${route.split('/').slice(-2,-1)[0]}-390.png`});}
   }
  }
  await page.goto(base+'studio/index.html');
  const before=await page.locator('html').getAttribute('data-theme');
  await page.locator('#theme-toggle').click();
  const after=await page.locator('html').getAttribute('data-theme');assert.notEqual(before,after);
  await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),after);
  await page.locator('#palette-next').click();assert.equal(await page.locator('#palette-name').textContent(),'OLIVE & EMBER');
  await page.locator('.palette-study').focus();await page.keyboard.press('Home');assert.equal(await page.locator('#palette-name').textContent(),'INK WASH');
  await page.locator('.case-study summary').first().click();assert.notEqual(await page.locator('.case-study').first().getAttribute('open'),null);
  assert.equal(await page.locator('meta[name="robots"]').count(),0);
  assert.ok((await page.locator('link[rel="icon"]').getAttribute('href')).includes('studio-favicon.svg'));
  await page.locator('.site-footer a').last().click();await page.waitForURL(base+'index.html');
  await page.locator('.web-design-note a').click();await page.waitForURL(base+'studio/index.html');
  for(const concept of ['catering','rivet-beam','afterhours']){
   await page.goto(base+`studio/projects/${concept}/index.html`);
   assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex');
   assert.ok((await page.locator('body').textContent()).toLowerCase().includes('fictional'));
   await page.locator('a[href="../../index.html#work"]').first().click();await page.waitForURL(base+'studio/index.html#work');
  }
  await page.goto(base+'studio/projects/rivet-beam/index.html');
  await page.locator('#sample-material').selectOption('custom');assert.ok(await page.locator('#project-description').isVisible());
  await page.locator('#project-drawings').setInputFiles({name:'sample-drawing.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nlocal test\n%%EOF')});
  assert.ok((await page.locator('#drawing-list').textContent()).includes('sample-drawing.pdf'));
  await page.goto(base+'studio/projects/afterhours/index.html');
  await page.waitForFunction(()=>[...document.querySelectorAll('audio')].every(a=>Number.isFinite(a.duration)&&a.duration>0));
  const audio=await page.evaluate(async()=>{const a=[...document.querySelectorAll('audio')];a.forEach(x=>x.muted=true);await a[0].play();await a[1].play();const result={oneAtATime:a[0].paused&&!a[1].paused,durations:a.map(x=>x.duration)};a[1].pause();return result;});assert.ok(audio.oneAtATime);
  assert.equal(await page.locator('.spotify-link').getAttribute('href'),'https://open.spotify.com/track/27u7xjcsQDKrIi4J2n9Bnm');
  assert.deepEqual(errors,[]);
  const report={base,views,errors,themePersistence:true,paletteKeyboard:true,caseStudy:true,crossLinks:true,localDrawingPreview:true,audio,spotifyLink:true};
  fs.writeFileSync('preview-evidence/studio-deployment-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
