const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'}),errors=[],results=[];
 const base='https://teddybear-cpp.github.io/Tedits/';
 page.on('pageerror',e=>errors.push(e.message));
 for(const [route,hash,selector]of [['index.html','#contact','#contact-form'],['studio/index.html','#approach','.palette-study'],['studio/projects/catering/index.html','#menus','.menu-photo'],['studio/projects/rivet-beam/index.html','#quote','.enquiry-panel'],['studio/projects/afterhours/index.html','#beats','.tracks']]){
  await page.goto(base+route,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('script[src$="section-navigation.js"]').count(),1);
  const link=page.locator(`a[href="${hash}"]`).first();
  if(!(await link.isVisible())&&await page.locator('.nav-toggle').count())await page.locator('.nav-toggle').click();
  await link.click();await page.waitForTimeout(200);
  const position=await page.locator(selector).first().evaluate(el=>{const r=el.getBoundingClientRect();return {center:r.top+r.height/2,height:r.height,top:r.top,screen:innerHeight};});
  if(position.height<=position.screen-64)assert.ok(Math.abs(position.center-position.screen/2)<4,JSON.stringify({route,position}));else assert.ok(position.top>=0&&position.top<=40);
  if(route==='studio/index.html'){
   assert.equal(await page.locator('.design-principles p').first().innerText(),'a palette\nwith a purpose\nbeyond visuals.');
   assert.equal(await page.locator('.case-study h4').filter({hasText:'The idea'}).count(),3);
   assert.ok((await page.locator('.case-study').first().textContent()).includes('Good food can make a big celebration'));
  }
  results.push({route,...position});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync('preview-evidence/live-navigation-check.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
