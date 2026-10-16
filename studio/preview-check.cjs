const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
  fs.mkdirSync('preview-evidence',{recursive:true});
  const server=require('../preview-server.cjs').createPreviewServer();
  await new Promise(resolve=>server.listen(8088,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage();
  const errors=[],failedAssets=[],views=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:8088/')&&r.status()>=400)failedAssets.push(r.url());});
  for(const [name,width,height]of[['small-mobile',320,780],['mobile',390,844],['tablet',768,1024],['laptop',1280,720],['desktop',1440,900]]){
    await page.setViewportSize({width,height});
    await page.goto('http://127.0.0.1:8088/studio/portfolio-preview.html',{waitUntil:'domcontentloaded'});
    for(const image of await page.locator('img').all())await image.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    const checks=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,anchors:[...document.querySelectorAll('a[href^="#"]')].every(a=>!!document.querySelector(a.getAttribute('href'))),projects:document.querySelectorAll('.project').length,email:[...document.querySelectorAll('a[href^="mailto:"]')].every(a=>a.href.startsWith('mailto:teditstudiozm@gmail.com')),music:document.querySelector('#about').textContent.includes('I make music'),gradient:getComputedStyle(document.querySelector('.hero'),'::before').animationName}));
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:`preview-evidence/${name}.png`,fullPage:true});
    views.push({name,width,height,...checks});
  }
  const paletteNames=[];
  for(let index=0;index<5;index++){
    paletteNames.push(await page.locator('#palette-name').textContent());
    await page.locator('#palette-next').click();
  }
  const paletteWrapped=await page.locator('#palette-name').textContent()==='INK WASH';
  await page.locator('#palette-previous').click();
  const previousWorks=(await page.locator('#palette-name').textContent()).includes('VIDEO');
  await page.locator('.palette-study').focus();
  await page.keyboard.press('Home');
  const keyboardWorks=await page.locator('#palette-name').textContent()==='INK WASH';
  await page.keyboard.press('ArrowRight');
  const keyboardNext=await page.locator('#palette-name').textContent()==='OLIVE & EMBER';
  await page.locator('.case-study summary').first().click();
  const caseStudyOpens=await page.locator('.case-study details').count()===0&&await page.locator('.case-study').first().getAttribute('open')!==null;
  const destinations=[];
  for(const target of ['projects/catering/index.html','projects/rivet-beam/index.html','projects/afterhours/index.html','../index.html']){
    const response=await page.request.get(new URL(target,'http://127.0.0.1:8088/studio/portfolio-preview.html').href);
    destinations.push({target,status:response.status()});
  }
  await page.goto('http://127.0.0.1:8088/studio/projects/afterhours/index.html',{waitUntil:'domcontentloaded'});
  const afterhours=await page.evaluate(()=>({layout:document.body.dataset.layout,noTweaks:!document.querySelector('#toggle-tweaks,#tweaks'),split:getComputedStyle(document.querySelector('.hero')).gridTemplateColumns.split(' ').length===2}));
  await page.locator('#record').click();
  afterhours.recordStarts=await page.locator('#record').getAttribute('aria-pressed')==='true';
  await page.keyboard.press('Escape');
  afterhours.recordStops=await page.locator('#record').getAttribute('aria-pressed')==='false';
  await page.emulateMedia({reducedMotion:'reduce'});
  afterhours.preferenceChangeSafe=await page.locator('#record').getAttribute('aria-pressed')==='false';
  await page.setViewportSize({width:390,height:844});
  afterhours.mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  await page.goto('http://127.0.0.1:8088/studio/portfolio-preview.html',{waitUntil:'domcontentloaded'});
  const reducedGradient=await page.evaluate(()=>getComputedStyle(document.querySelector('.hero'),'::before').animationName);
  await page.setViewportSize({width:1440,height:900});
  const model=await page.evaluate(()=>{
    const text=selector=>document.querySelector(selector).innerText.trim();
    return {
      hero:{meta:[...document.querySelectorAll('.hero-meta p')].map(p=>p.innerText),heading:text('h1'),intro:text('.hero-bottom>p')},
      work:{label:text('#work .eyebrow'),heading:text('#work h2'),intro:text('#work .section-heading>p')},
      projects:[...document.querySelectorAll('.project')].map(el=>({number:el.querySelector('.project-number').innerText,title:el.querySelector('h3').innerText,description:el.querySelector('.project-copy>p:not(.project-number)').innerText,scope:el.querySelector('.project-scope').innerText,bar:el.querySelector('.browser-bar>span:nth-child(2)').innerText})),
      approach:{label:text('#approach .eyebrow'),heading:text('#approach h2'),intro:text('#approach .section-intro'),caption:text('#palette-caption')},
      services:{label:text('#services .eyebrow'),heading:text('#services h2'),intro:text('#services .section-heading>p'),items:[...document.querySelectorAll('.service-list article')].map(el=>({number:el.querySelector('span').innerText,title:el.querySelector('h3').innerText,description:el.querySelector('p').innerText}))},
      about:{label:text('#about .eyebrow'),heading:text('#about h2'),location:text('.about-location'),paragraphs:[...document.querySelectorAll('.about-copy p')].map(p=>p.innerText)},
      contact:{label:text('#contact .eyebrow'),heading:text('#contact h2'),intro:text('.contact-bottom>p')}
    };
  });
  fs.writeFileSync('figma-content.json',JSON.stringify(model,null,2));
  const report={views,errors,failedAssets,paletteNames,paletteWrapped,previousWorks,keyboardWorks,keyboardNext,caseStudyOpens,destinations,afterhours,reducedGradient};
  fs.writeFileSync('preview-evidence/checks.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
