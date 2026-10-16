const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');

(async()=>{
  const evidence=__dirname;
  const server=require('../../preview-server.cjs').createPreviewServer();
  await new Promise(resolve=>server.listen(8091,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({headless:true,channel:'msedge'});
    const page=await browser.newPage();
    const errors=[],failedAssets=[],views=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.url().startsWith('http://127.0.0.1:8091/')&&response.status()>=400)failedAssets.push(response.url());});
    for(const width of [320,390,600,768,1024,1440]){
      await page.setViewportSize({width,height:900});
      await page.goto('http://127.0.0.1:8091/studio/projects/afterhours/index.html',{waitUntil:'domcontentloaded'});
      await page.evaluate(()=>document.fonts.ready);
      const view=await page.evaluate(()=>{
        const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
        const stage=box('.record-stage'),cue=box('.cue'),record=box('#record'),intro=box('.intro'),headline=box('h1'),label=box('.label'),labelTitle=box('.label strong');
        return{
          width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
          columns:getComputedStyle(document.querySelector('.hero')).gridTemplateColumns,
          headlineFont:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
          headlineLines:Math.round(headline.height/parseFloat(getComputedStyle(document.querySelector('h1')).lineHeight)),
          otherHeadingFont:Math.max(...[...document.querySelectorAll('h2,h3')].map(el=>parseFloat(getComputedStyle(el).fontSize))),
          cueFont:parseFloat(getComputedStyle(document.querySelector('.cue')).fontSize),
          stage,cue,record,intro,headline,
          labelTitleContained:labelTitle.x>=label.x&&labelTitle.right<=label.right,
          cueContained:cue.x>=stage.x&&cue.right<=stage.right&&cue.y>=stage.y&&cue.bottom<=stage.bottom,
          introRecordSeparated:innerWidth<=760?stage.y>=intro.bottom:stage.x>=intro.right,
          anchors:[...document.querySelectorAll('a[href^="#"]')].every(a=>!!document.querySelector(a.getAttribute('href'))),
          overflowElements:[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left<-.5||r.right>innerWidth+.5);}).map(el=>({element:el.tagName,class:el.className})).slice(0,12)
        };
      });
      await page.screenshot({path:path.join(evidence,`afterhours-${width}.png`),fullPage:true});
      assert.equal(view.scrollWidth,width,`Overflow at ${width}px`);
      assert.ok(view.headlineFont>view.otherHeadingFont,`Headline hierarchy at ${width}px`);
      assert.equal(view.headlineLines,3,`Headline should retain three lines at ${width}px`);
      assert.ok(view.cueContained,`Cue must fit stage at ${width}px`);
      assert.ok(view.labelTitleContained,`Label title must fit center circle at ${width}px`);
      assert.ok(view.introRecordSeparated,`Hero overlap at ${width}px`);
      assert.ok(view.anchors,`Missing anchor at ${width}px`);
      views.push(view);
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto('http://127.0.0.1:8091/studio/projects/afterhours/index.html',{waitUntil:'domcontentloaded'});
    const record=page.locator('#record');
    await record.focus();await page.keyboard.press('Enter');
    const enterStarts=await record.getAttribute('aria-pressed')==='true';
    const startedTransform=await page.locator('#vinyl').evaluate(el=>getComputedStyle(el).transform);
    await page.waitForTimeout(150);
    const continuousRotation=await page.locator('#vinyl').evaluate(el=>getComputedStyle(el).transform)!==startedTransform;
    await page.keyboard.press('Escape');
    const escapeStops=await record.getAttribute('aria-pressed')==='false';
    const stoppedTransform=await page.locator('#vinyl').evaluate(el=>getComputedStyle(el).transform);
    await page.waitForTimeout(100);
    const escapeStopsRotation=await page.locator('#vinyl').evaluate(el=>getComputedStyle(el).transform)===stoppedTransform;
    await record.focus();await page.keyboard.press('Space');
    const spaceStarts=await record.getAttribute('aria-pressed')==='true';
    await record.click();
    const clickStops=await record.getAttribute('aria-pressed')==='false';
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>document.querySelector('#cue-text').textContent.includes('Motion paused'));
    const reducedPaused=(await page.locator('#cue-text').textContent()).includes('Motion paused');
    await record.click();
    const reducedExplicitStart=await record.getAttribute('aria-pressed')==='true';
    await page.keyboard.press('Escape');
    const interaction={enterStarts,continuousRotation,escapeStops,escapeStopsRotation,spaceStarts,clickStops,reducedPaused,reducedExplicitStart};
    for(const [name,value]of Object.entries(interaction))assert.ok(value,name);
    assert.deepEqual(errors,[]);assert.deepEqual(failedAssets,[]);
    const report={url:'http://127.0.0.1:8091/studio/projects/afterhours/index.html',browser:'Microsoft Edge (headless Chromium)',views,interaction,errors,failedAssets};
    fs.writeFileSync(path.join(evidence,'afterhours-responsive-checks.json'),JSON.stringify(report,null,2));
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.setViewportSize({width:1280,height:900});
    await page.goto('http://127.0.0.1:8091/studio/projects/afterhours/index.html',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:path.join(evidence,'../assets/afterhours-preview.png')});
    await page.setViewportSize({width:390,height:1100});
    await page.goto('http://127.0.0.1:8091/studio/projects/afterhours/index.html',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:path.join(evidence,'afterhours-mobile-hero.png')});
    console.log(JSON.stringify(report,null,2));
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1});
