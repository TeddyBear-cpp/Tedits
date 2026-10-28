const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');
(async () => {
  fs.mkdirSync('preview-evidence', { recursive: true });
  const server=require('./preview-server.cjs').createPreviewServer();
  await new Promise(resolve=>server.listen(8082,'127.0.0.1',resolve));
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  const page = await browser.newPage();
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  const results=[];
  for(const [name,width,height] of [['mobile',390,844],['desktop',1440,900]]){
    await page.setViewportSize({width,height});
    await page.goto('http://127.0.0.1:8082/index.html',{waitUntil:'domcontentloaded'});
    const entranceMotion=await page.evaluate(()=>document.getAnimations().length>0);
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    const firstPlayer=page.locator('.custom-player').first();
    await firstPlayer.locator('.transport-play').click();
    await page.waitForFunction(()=>!document.querySelector('video').paused);
    await firstPlayer.locator('.transport-play').click();
    await page.waitForFunction(()=>document.querySelector('video').paused);
    await firstPlayer.locator('.timeline-seek').focus();
    await page.keyboard.press('End');
    await page.waitForFunction(()=>{const v=document.querySelector('video');return v.currentTime>v.duration*.95;});
    await page.keyboard.press('Home');
    await page.waitForFunction(()=>document.querySelector('video').currentTime<1);
    await firstPlayer.locator('.transport-sound').click();
    const muteWorked=await page.evaluate(()=>document.querySelector('video').muted);
    await firstPlayer.locator('.transport-sound').click();
    await firstPlayer.locator('.transport-fullscreen').click();
    await page.waitForFunction(()=>!!document.fullscreenElement);
    await firstPlayer.locator('.transport-fullscreen').click();
    await page.waitForFunction(()=>!document.fullscreenElement);
    const ui={playPause:true,keyboardSeek:true,muteWorked,fullscreen:true};
    await page.evaluate(()=>document.querySelectorAll('.work-card video').forEach(video=>video.load()));
    await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>v.readyState>=2));
    const playback=await page.evaluate(async()=>{
      const videos=[...document.querySelectorAll('video')];
      const first=videos[0];
      first.muted=true;
      await first.play();
      await new Promise(resolve=>first.requestVideoFrameCallback(resolve));
      first.pause();
      await new Promise(resolve=>{first.addEventListener('seeked',resolve,{once:true});first.currentTime=2;});
      const frameChecks=videos.map(video=>{
        const canvas=video.parentElement.querySelector('canvas');
        const reference=document.createElement('canvas');
        reference.width=canvas.width;reference.height=canvas.height;
        const context=reference.getContext('2d',{alpha:false});
        const scale=Math.max(canvas.width/video.videoWidth,canvas.height/video.videoHeight);
        const w=canvas.width/scale,h=canvas.height/scale;
        context.drawImage(video,(video.videoWidth-w)/2,(video.videoHeight-h)/2,w,h,0,0,canvas.width,canvas.height);
        const actual=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
        const expected=context.getImageData(0,0,canvas.width,canvas.height).data;
        return {oneVideo:video.parentElement.querySelectorAll('video').length===1,frameMatches:actual.every((v,i)=>v===expected[i])};
      });
      await first.play();
      videos[1].muted=true;await videos[1].play();
      const otherPaused=first.paused;
      videos[1].pause();
      return {featured:first.getAttribute('src'),frameChecks,otherPaused};
    });
    const checks=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),
      anchors:[...document.querySelectorAll('a[href^="#"]')].every(a=>document.querySelector(a.getAttribute('href'))),
      video:[...document.querySelectorAll('video')].map(v=>({src:v.getAttribute('src'),ready:v.readyState,error:v.error?.message||null})),
      headingFont:getComputedStyle(document.querySelector('h1')).fontFamily
    }));
    await page.screenshot({path:`preview-evidence/${name}.png`,fullPage:true});
    const controlOverflow=await page.evaluate(()=>[...document.querySelectorAll('.transport')].some(el=>el.scrollWidth>el.clientWidth));
    await firstPlayer.screenshot({path:`preview-evidence/${name}-player.png`});
    const portfolioLink=page.locator('.web-design-note a');
    await portfolioLink.click();
    await page.waitForURL('**/studio/index.html');
    const studioPage=await page.evaluate(()=>({title:document.title,overflow:document.documentElement.scrollWidth>innerWidth,backLink:!!document.querySelector('a[href="../index.html"]')}));
    await page.screenshot({path:`preview-evidence/${name}-studio-intro.png`,fullPage:true});
    results.push({name,width,height,...checks,playback,ui,controlOverflow,entranceMotion,studioPage});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:8082/index.html',{waitUntil:'domcontentloaded'});
  const reducedMotion=await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior);
  const reducedAnimations=await page.evaluate(()=>document.getAnimations().length);
  const contactResults=[];
  let requestCount=0, mockStatus=200;
  await page.route('https://formspree.io/f/myekdopv',async route=>{
    requestCount++;
    await route.fulfill({status:mockStatus,contentType:'application/json',body:JSON.stringify(mockStatus===200?{ok:true}:{error:'Simulated failure'})});
  });
  await page.locator('#submit-btn').click();
  if(requestCount!==0)throw new Error('Empty form was submitted');
  for(const status of [200,500]){
    mockStatus=status;
    await page.locator('#name').fill('Local preview test');
    await page.locator('#email').fill('preview@example.com');
    await page.locator('#details').fill('Simulated form test. Nothing is sent.');
    await page.locator('#submit-btn').click();
    await page.waitForFunction(state=>document.querySelector('#form-status').dataset.state===state,status===200?'success':'error');
    contactResults.push({mockStatus:status,message:await page.locator('#form-status').textContent(),detailsRetained:await page.locator('#details').inputValue(),buttonEnabled:await page.locator('#submit-btn').isEnabled()});
  }
  const additionalLayouts=[];
  for(const width of [320,768,1280]){
    await page.setViewportSize({width,height:900});
    additionalLayouts.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,controlOverflow:[...document.querySelectorAll('.transport')].some(el=>el.scrollWidth>el.clientWidth)})));
  }
  const report={results,errors,reducedMotion,reducedAnimations,contactResults,additionalLayouts,realMessagesSent:0};
  fs.writeFileSync('preview-evidence/checks.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  await browser.close();
  server.close();
})().catch(e=>{console.error(e);process.exit(1)});
