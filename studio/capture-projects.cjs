const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
  const server=require('../preview-server.cjs').createPreviewServer();
  await new Promise(resolve=>server.listen(8088,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  for(const [project,filename] of [['afterhours','afterhours-preview.png']]){
    await page.goto(`http://127.0.0.1:8088/studio/projects/${project}/index.html`,{waitUntil:'networkidle'});
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:`assets/${filename}`});
    console.log(`Captured ${project}`);
  }
  await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
