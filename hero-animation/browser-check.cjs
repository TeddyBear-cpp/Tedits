const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(__dirname, 'preview.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
  const metadata = await page.evaluate(() => {
    const video = document.querySelector('video');
    return { duration: video.duration, width: video.videoWidth, height: video.videoHeight, paused: video.paused };
  });
  await page.evaluate(async () => {
    const video = document.querySelector('video');
    video.currentTime = 4;
    await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
  });
  await page.screenshot({ path: path.join(__dirname, 'output', 'browser-desktop.png') });
  await page.evaluate(async () => {
    const video = document.querySelector('video');
    video.currentTime = 7.92;
    await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
    await video.play();
  });
  await page.waitForTimeout(450);
  const wrappedTime = await page.evaluate(() => document.querySelector('video').currentTime);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(__dirname, 'output', 'browser-mobile.png') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(150);
  const reducedMotionPauses = await page.evaluate(() => document.querySelector('video').paused);
  const report = { metadata, wrappedTime, browserLooped: wrappedTime < 1, reducedMotionPauses, pageErrors: errors };
  fs.writeFileSync(path.join(__dirname, 'output', 'browser-check.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (!report.browserLooped || !reducedMotionPauses || errors.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
