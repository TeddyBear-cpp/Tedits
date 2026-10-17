const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.argv[2]||'http://127.0.0.1:8084/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage(),errors=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const width of [390,1440])for(const route of ['index.html','studio/index.html','studio/projects/catering/index.html','studio/projects/rivet-beam/index.html','studio/projects/afterhours/index.html']){
   await page.setViewportSize({width,height:900});await page.goto(base+route,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   const links=page.locator('a[href^="#"]'),count=await links.count();
   for(let i=0;i<count;i++){
    const link=links.nth(i),hash=await link.getAttribute('href'),label=(await link.textContent()).trim().slice(0,50);
    if(!(await link.isVisible())&&await page.locator('.nav-toggle').count())await page.locator('.nav-toggle').click();
    if(!(await link.isVisible()))continue; // Responsive navigation may intentionally omit a link.
    if(await link.evaluate(el=>el.classList.contains('skip'))) {await link.focus();await page.keyboard.press('Enter');}
    else await link.click();
    await page.waitForFunction(hash=>{
      if(hash==='#'||hash==='#top')return scrollY<2;
      const r=document.getElementById(hash.slice(1)).getBoundingClientRect();
      return r.bottom>0&&r.top<innerHeight;
    },hash,{timeout:10000});
    await page.waitForTimeout(350);
    let previous=-1,stable=0;
    for(let step=0;step<50&&stable<4;step++){const y=await page.evaluate(()=>scrollY);stable=Math.abs(previous-y)<1?stable+1:0;previous=y;await page.waitForTimeout(35);}
    const result=await page.evaluate(hash=>{
     const id=hash.slice(1),section=id?document.getElementById(id):document.body;
     const r=section.getBoundingClientRect();
     return {hash:location.hash,y:scrollY,sectionVisible:r.bottom>0&&r.top<innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,focus:document.activeElement.id||document.activeElement.tagName};
    },hash);
    assert.ok(result.sectionVisible,`${route} ${width} ${hash} missed section: ${JSON.stringify(result)}`);assert.equal(result.overflow,false);
    if(hash==='#'||hash==='#top')assert.ok(result.y<2,`${route} home not at top`);else assert.equal(result.hash,hash);
    if(await link.getAttribute('data-material'))assert.equal(await page.locator('#sample-material').inputValue(),await link.getAttribute('data-material'));
    checks.push({route,width,hash,label,...result});
   }
   console.log(`Navigation passed: ${route} at ${width}px`);
  }
  // Check the core content, not just the existence of fragment destinations.
  const focalCases=[['index.html','#contact','#contact-form'],['studio/index.html','#approach','.palette-study'],['studio/projects/afterhours/index.html','#beats','.tracks'],['studio/projects/catering/index.html','#menus','.menu-photo'],['studio/projects/rivet-beam/index.html','#quote','.enquiry-panel']];
  const focalResults=[];
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [390,1440])for(const [route,hash,selector]of focalCases){
   await page.setViewportSize({width,height:900});await page.goto(base+route,{waitUntil:'load'});
   const link=page.locator(`a[href="${hash}"]`).first();if(!(await link.isVisible())&&await page.locator('.nav-toggle').count())await page.locator('.nav-toggle').click();await link.click();await page.waitForTimeout(150);
   const r=await page.locator(selector).first().evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,center:r.top+r.height/2,viewport:innerHeight,atEnd:scrollY>=document.documentElement.scrollHeight-innerHeight-2};});
   if(r.height<=r.viewport-64&&!r.atEnd)assert.ok(Math.abs(r.center-r.viewport/2)<4,`${route} ${width} core not centred: ${JSON.stringify(r)}`);
   else if(r.height>r.viewport-64)assert.ok(r.top>=0&&r.top<=40,`${route} long content start out of view`);
   focalResults.push({route,width,...r});
  }
  await page.goto(base+'studio/index.html#approach');await page.waitForTimeout(150);assert.equal(await page.locator('.design-principles p').first().innerText(),'a palette\nwith a purpose\nbeyond visuals.');
  assert.deepEqual(errors,[]);
  const report={base,anchorChecks:checks.length,checks,focalResults,errors};fs.writeFileSync('preview-evidence/navigation-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify({base,anchorChecks:checks.length,focalResults,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
