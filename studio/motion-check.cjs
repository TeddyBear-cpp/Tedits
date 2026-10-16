const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
  const server=require('../preview-server.cjs').createPreviewServer();
  await new Promise(resolve=>server.listen(8090,'127.0.0.1',resolve));
  let browser;
  try {
    browser=await chromium.launch({headless:true,channel:'msedge'});
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const url='http://127.0.0.1:8090/studio/portfolio-preview.html';
    if(process.argv.includes('--routes-only')){
      await page.emulateMedia({reducedMotion:'reduce'});
      const routes=[];
      for(const width of [320,1440]){
        await page.setViewportSize({width,height:900});
        for(const route of ['index.html','projects/catering/index.html','projects/rivet-beam/index.html','projects/afterhours/index.html']){
          const response=await page.goto('http://127.0.0.1:8090/studio/'+route,{waitUntil:'domcontentloaded'});
          const returnLink=route==='index.html'?true:await page.locator('a[href="../../index.html#work"]').count()>0;
          const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
          routes.push({route,width,status:response.status(),returnLink,overflow});
        }
      }
      fs.writeFileSync('preview-evidence/routes-checks.json',JSON.stringify({routes,errors},null,2));
      console.log(JSON.stringify({routes,errors},null,2));
      if(errors.length||routes.some(r=>r.status!==200||!r.returnLink||r.overflow))throw new Error('Portfolio route check failed');
      return;
    }
    if(process.argv.includes('--reduced-only')){
      await page.goto(url,{waitUntil:'domcontentloaded'});
      await page.locator('#palette-next').click();
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>matchMedia('(prefers-reduced-motion: reduce)').matches&&document.getAnimations().every(a=>a.playState!=='running'));
      const report=JSON.parse(fs.readFileSync('preview-evidence/motion-checks.json','utf8'));
      report.cancellation=true;
      fs.writeFileSync('preview-evidence/motion-checks.json',JSON.stringify(report,null,2));
      console.log(JSON.stringify({liveReducedMotionCancellation:report.cancellation,errors},null,2));
      if(errors.length)throw new Error('Runtime error during reduced-motion check');
      return;
    }
    await page.goto(url,{waitUntil:'domcontentloaded'});
    const heroAnimations=await page.evaluate(()=>document.getAnimations().filter(a=>a.effect.target.closest('.hero')).length);
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(1100);
    await page.screenshot({path:'preview-evidence/studio-motion-hero.png'});
    const views=[];
    for(const width of [320,390,600,768,1024,1440]){
      await page.setViewportSize({width,height:900});
      await page.goto(url,{waitUntil:'domcontentloaded'});
      for(const target of await page.locator('.project,.approach-grid,.service-list,.about-grid,.contact').all()){
        await target.scrollIntoViewIfNeeded();
        await page.waitForTimeout(850);
      }
      views.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,
        visible:[...document.querySelectorAll('.project,.about-grid,.contact-bottom')].every(n=>getComputedStyle(n).opacity==='1'),
        anchors:[...document.querySelectorAll('a[href^="#"]')].every(a=>!!document.querySelector(a.getAttribute('href')))})));
    }
    await page.locator('#palette-next').click();
    const paletteAnimated=await page.evaluate(()=>document.querySelector('#palette-swatches').getAnimations({subtree:true}).length===4);
    await page.waitForTimeout(600);
    const paletteWorks=await page.locator('#palette-name').textContent()==='OLIVE & EMBER';
    await page.locator('#palette-next').click();
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>matchMedia('(prefers-reduced-motion: reduce)').matches&&document.getAnimations().every(a=>a.playState!=='running'));
    const cancellation=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length===0);
    await page.goto(url,{waitUntil:'domcontentloaded'});
    const reduced=await page.evaluate(()=>({animations:document.getAnimations().length,gradient:getComputedStyle(document.querySelector('.hero'),'::before').animationName,visible:getComputedStyle(document.querySelector('h1')).opacity==='1'}));
    await page.locator('#palette-next').click();
    reduced.paletteAnimations=await page.evaluate(()=>document.getAnimations().length);
    await page.locator('.palette-study').focus();await page.keyboard.press('End');
    reduced.keyboardWorks=(await page.locator('#palette-name').textContent()).includes('VIDEO');
    await page.setViewportSize({width:390,height:844});
    await page.goto(url,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:'preview-evidence/studio-motion-mobile.png'});
    const report={heroAnimations,paletteAnimated,paletteWorks,cancellation,reduced,views,errors};
    fs.writeFileSync('preview-evidence/motion-checks.json',JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
    if(!heroAnimations||!paletteAnimated||!paletteWorks||!cancellation||reduced.animations||reduced.paletteAnimations||!reduced.visible||!reduced.keyboardWorks||errors.length||views.some(v=>v.overflow||!v.visible||!v.anchors))throw new Error('Motion or responsiveness check failed');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});
