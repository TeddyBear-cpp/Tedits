const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const out=path.join(__dirname,'preview-evidence','scroll-performance');
const base='http://127.0.0.1:8094/studio/index.html';
(async()=>{
 const server=require('../preview-server.cjs').createPreviewServer();await new Promise(r=>server.listen(8094,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,channel:'msedge'});const results=[];
  for(const variant of ['before','after'])for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900},colorScheme:'light'});
   if(variant==='before')for(const file of ['studio.js','studio-motion.css']){
    const body=execFileSync('git',['show',`HEAD:studio/${file}`],{cwd:path.join(__dirname,'..'),encoding:'utf8'});
    await page.route(`**/${file}`,route=>route.fulfill({body,contentType:file.endsWith('.js')?'application/javascript':'text/css'}));
   }
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1000);
   // Stop just inside the group's trigger, leaving the stacked mobile copy below the fold.
   const grouping=await page.evaluate(()=>{
    const project=document.querySelector('.project');const r=project.getBoundingClientRect();
    window.scrollTo({top:scrollY+r.top-innerHeight+r.height*.13,behavior:'instant'});
    return {height:r.height};
   });
   await page.waitForTimeout(950);
   const copy=await page.locator('.project-copy').first().evaluate(el=>({top:el.getBoundingClientRect().top,opacity:getComputedStyle(el).opacity,pending:el.classList.contains('studio-reveal-pending')}));
   if(width===390){assert.ok(copy.top>=900);assert.equal(copy.pending,variant==='after');}
   await page.locator('.project-copy').first().scrollIntoViewIfNeeded();await page.waitForTimeout(1000);
   assert.equal(await page.locator('.project-copy').first().evaluate(el=>getComputedStyle(el).opacity),'1');
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   const destinations={};
   for(const [name,hash] of [['Work','#work'],['Approach','#approach'],['About me','#about']]){
    await page.getByRole('link',{name,exact:true}).click();await page.waitForTimeout(1500);
    assert.equal(new URL(page.url()).hash,hash);const y=await page.evaluate(()=>scrollY);await page.waitForTimeout(400);
    assert.equal(await page.evaluate(()=>scrollY),y,'Unexpected settled navigation jump');destinations[hash]=y;
   }
   await page.goBack();await page.waitForTimeout(1000);assert.equal(new URL(page.url()).hash,'#approach');
   await page.getByRole('button',{name:'Next colour palette',exact:true}).click();assert.equal(await page.locator('#palette-name').innerText(),'OLIVE & EMBER');
   await page.getByRole('button',{name:'Previous colour palette',exact:true}).click();await page.waitForTimeout(600);
   if(width===1440){
    const visual=page.locator('.project-visual').first();await visual.hover();await page.waitForTimeout(1100);
    const transform=await visual.evaluate(el=>getComputedStyle(el).transform);assert.ok(transform.endsWith(', -5)'),transform);
    await page.mouse.move(0,0);await page.waitForTimeout(500);
   }
   await page.locator('.case-study summary').first().click();await page.waitForTimeout(200);assert.ok(await page.locator('.case-study').first().evaluate(el=>el.open));
   await page.locator('.case-study summary').first().click();
   await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(1000);const reloadY=await page.evaluate(()=>scrollY);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>scrollY),reloadY);
   const nav={variant,width,copyAtGroupTrigger:copy,destinations,reloadY,errors};
   if(variant==='after'){
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
    assert.equal(await page.locator('.studio-reveal-pending').count(),0);
    assert.equal(await page.locator('.hero-art').getAttribute('data-motion'),'reduced');
    assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
    await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('.studio-reveal-pending').count(),0);
    await page.getByRole('button',{name:'Dark mode',exact:true}).click();
    await page.screenshot({path:path.join(out,`after-dark-${width}.png`),fullPage:true});
    nav.reducedMotionAndTheme=true;
   }
   assert.deepEqual(errors,[]);results.push(nav);await page.close();
  }
  for(const width of [1440,390]){
   const before=results.find(r=>r.variant==='before'&&r.width===width),after=results.find(r=>r.variant==='after'&&r.width===width);
   assert.deepEqual(after.destinations,before.destinations,'Navigation destinations changed');
   assert.ok(Math.abs(after.reloadY-before.reloadY)<=2,'Reload scroll position changed by more than 2px');
  }
  const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(base);assert.equal(await nojs.locator('.project-copy').first().evaluate(el=>getComputedStyle(el).opacity),'1');await nojs.close();
  fs.writeFileSync(path.join(out,'regressions.json'),JSON.stringify({results,noJavaScriptContentVisible:true},null,2));console.log(JSON.stringify(results,null,2));
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
