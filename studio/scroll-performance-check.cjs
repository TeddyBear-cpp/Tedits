const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const path=require('node:path');
const phase=process.argv[2]||'before';
const output=path.join(__dirname,'preview-evidence','scroll-performance');
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const server=require('../preview-server.cjs').createPreviewServer();
 await new Promise(resolve=>server.listen(8093,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,channel:'msedge'});
  const results=[];
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    window.motionProbe={entrances:[],longTasks:[],shifts:[],frames:[],seen:new WeakMap(),started:new WeakSet(),recording:false};
    const p=window.motionProbe;
    new PerformanceObserver(list=>list.getEntries().forEach(e=>p.longTasks.push({start:e.startTime,duration:e.duration}))).observe({type:'longtask',buffered:true});
    new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)p.shifts.push({start:e.startTime,value:e.value});})).observe({type:'layout-shift',buffered:true});
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(frames,options){
     const entrance=Array.isArray(frames)&&frames[0]?.transform==='translateY(20px)';
     let record;
     if(entrance){
      const rect=this.getBoundingClientRect();
      record={element:this.className||this.tagName,start:performance.now(),top:rect.top,height:rect.height,opacityBefore:getComputedStyle(this).opacity,visibleFramesBefore:p.seen.get(this)||0};
      p.started.add(this);p.entrances.push(record);
     }
     const animation=animate.call(this,frames,options);
     if(record)animation.finished.then(()=>{record.finishedBelowViewport=this.getBoundingClientRect().top>=innerHeight;},()=>{record.cancelled=true;});
     return animation;
    };
    document.addEventListener('DOMContentLoaded',()=>{
     const targets=[...document.querySelectorAll('.section-heading,.project>*,.approach-grid>div,.service-list article,.about-grid>*,.contact h2,.contact-bottom>*')];
     let last=0;
     function frame(now){
      if(p.recording&&last)p.frames.push(now-last);
      last=now;
      for(const el of targets){
       if(p.started.has(el))continue;
       const rect=el.getBoundingClientRect();
       if(rect.top<innerHeight&&rect.bottom>0&&Number(getComputedStyle(el).opacity)>.99)p.seen.set(el,(p.seen.get(el)||0)+1);
      }
      requestAnimationFrame(frame);
     }
     requestAnimationFrame(frame);
    });
   });
   await page.goto('http://127.0.0.1:8093/studio/index.html',{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForTimeout(1100);
   await page.evaluate(async()=>{
    const p=window.motionProbe;p.recording=true;p.scrollStart=performance.now();
    await new Promise(resolve=>{
     function advance(){
      window.scrollBy({top:16,behavior:'instant'});
      if(scrollY+innerHeight>=document.documentElement.scrollHeight-1){resolve();return;}
      requestAnimationFrame(advance);
     }
     requestAnimationFrame(advance);
    });
    p.recording=false;p.scrollEnd=performance.now();
   });
   await page.waitForTimeout(1000);
   const report=await page.evaluate(()=>{
    const p=window.motionProbe,frames=[...p.frames].sort((a,b)=>a-b),tasks=p.longTasks.filter(e=>e.start>=p.scrollStart&&e.start<=p.scrollEnd);
    return {frames:frames.length,p95FrameMs:frames[Math.floor(frames.length*.95)],maxFrameMs:Math.max(...frames),framesOver34ms:frames.filter(x=>x>34).length,longTasksDuringScroll:tasks,layoutShiftSum:p.shifts.reduce((sum,e)=>sum+e.value,0),entrances:p.entrances,heroState:document.querySelector('.hero-art').dataset.motion,overflow:document.documentElement.scrollWidth>innerWidth};
   });
   const count=report.entrances.length;
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);
   await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await page.waitForTimeout(800);
   report.replayedEntrances=await page.evaluate(count=>window.motionProbe.entrances.length-count,count);
   await page.screenshot({path:path.join(output,`${phase}-${viewport.width}.png`),fullPage:true,mask:[page.locator('.hero-art')]});
   results.push({viewport,errors,...report});await page.close();
  }
  fs.writeFileSync(path.join(output,`${phase}.json`),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results.map(r=>({viewport:r.viewport,frames:r.frames,p95FrameMs:r.p95FrameMs,framesOver34ms:r.framesOver34ms,longTasksDuringScroll:r.longTasksDuringScroll.length,layoutShiftSum:r.layoutShiftSum,visibleBeforeReveal:r.entrances.filter(e=>e.visibleFramesBefore>0),finishedBelowViewport:r.entrances.filter(e=>e.finishedBelowViewport),replayedEntrances:r.replayedEntrances,errors:r.errors})),null,2));
 }finally{await browser?.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
