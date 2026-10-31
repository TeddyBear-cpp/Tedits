const {chromium} = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:8084/_site-video/';
(async () => {
  const browser = await chromium.launch({headless:true, channel:'msedge'});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => {if(r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);});
    const layouts = [];
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto(base + 'index.html', {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
      await page.waitForFunction(() => [...document.querySelectorAll('video')].every(v => v.readyState >= 2));
      const state = await page.evaluate(() => ({
        overflow:document.documentElement.scrollWidth > innerWidth,
        images:[...document.images].every(i => i.complete && i.naturalWidth),
        anchors:[...document.querySelectorAll('a[href^="#"]')].every(a => document.querySelector(a.getAttribute('href'))),
        videos:document.querySelectorAll('video').length,
        noindex:!!document.querySelector('meta[name="robots"][content="noindex"]'),
        studioLink:document.querySelector('.web-design-note a').getAttribute('href')
      }));
      assert.equal(state.overflow,false); assert.ok(state.images); assert.ok(state.anchors);
      assert.equal(state.videos,5); assert.equal(state.noindex,false);
      assert.equal(state.studioLink,'studio/index.html');
      await page.locator('.transport-play').first().click();
      await page.waitForFunction(() => document.querySelector('video').currentTime > 0.3);
      await page.locator('.transport-play').first().click();
      assert.ok(await page.evaluate(() => document.querySelector('video').paused));
      await page.locator('.timeline-seek').first().focus();
      await page.keyboard.press('End');
      await page.waitForFunction(() => {const v=document.querySelector('video');return v.currentTime>v.duration*.9;});
      await page.locator('.transport-sound').first().click();
      assert.ok(await page.evaluate(() => document.querySelector('video').muted));
      layouts.push({width,...state,playPauseSeekMute:true});
    }
    let submits = 0, status = 200;
    await page.route('https://formspree.io/f/myekdopv', async route => {
      submits++; await route.fulfill({status,contentType:'application/json',body:'{}'});
    });
    await page.locator('#submit-btn').click(); assert.equal(submits,0);
    for (status of [200,500]) {
      await page.locator('#name').fill('Deployment verification');
      await page.locator('#email').fill('test@example.com');
      await page.locator('#details').fill('Intercepted test, never sent.');
      await page.locator('#submit-btn').click();
      await page.waitForFunction(expected => document.querySelector('#form-status').dataset.state===expected,status===200?'success':'error');
    }
    assert.deepEqual(errors,[]);
    const report={base,layouts,errors,mockedFormSuccessAndFailure:true,realMessagesSent:0};
    fs.writeFileSync('preview-evidence/video-deployment-check.json',JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
