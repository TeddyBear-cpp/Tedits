const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

(async () => {
  const server = require('../preview-server.cjs').createPreviewServer();
  await new Promise(resolve => server.listen(8091, '127.0.0.1', resolve));
  let browser;
  const errors = [];
  const evidence = path.join(__dirname, 'preview-evidence', 'theme');
  fs.mkdirSync(evidence, { recursive: true });
  const address = 'http://127.0.0.1:8091/studio/index.html';
  const report = { views: [], preferences: {}, errors };
  try {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
    const context = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(address, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.evaluate(async () => {
      document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
      await document.fonts.ready;
    });
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth));
    report.preferences.initialSystemDark = true;
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator('#theme-toggle').focus();
      const state = await page.evaluate(() => {
        const button = document.querySelector('#theme-toggle');
        const box = button.getBoundingClientRect();
        const header = document.querySelector('.site-header').getBoundingClientRect();
        const nav = document.querySelector('.site-header nav').getBoundingClientRect();
        return {
          width: innerWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
          theme: document.documentElement.dataset.theme,
          background: getComputedStyle(document.body).backgroundColor,
          button: { width: box.width, height: box.height, withinHeader: box.right <= header.right + .5, pressed: button.getAttribute('aria-pressed'), focused: document.activeElement === button, outline: getComputedStyle(button).outlineWidth },
          navFits: nav.right <= innerWidth && nav.left >= 0,
          logos: [...document.querySelectorAll('.studio-logo img')].map(i => i.getAttribute('src')),
          paletteValues: [...document.querySelectorAll('.swatch b')].map(t => t.textContent)
        };
      });
      assert.equal(state.overflow, false, `Horizontal overflow at ${width}`);
      assert.equal(state.button.width, 44);
      assert.equal(state.button.height, 44);
      assert.equal(state.button.withinHeader, true);
      assert.equal(state.button.focused, true);
      assert.notEqual(state.button.outline, '0px');
      assert.equal(state.navFits, true);
      assert.ok(state.logos.every(source => source.endsWith('on-slate.svg')));
      report.views.push(state);
      await page.screenshot({ path: path.join(evidence, `dark-${width}.png`), fullPage: width === 1440 });
    }
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    report.preferences.keyboardAndPersistedLight = true;
    await page.emulateMedia({ colorScheme: 'light' });
    await page.emulateMedia({ colorScheme: 'dark' });
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    report.preferences.explicitChoiceOverridesSystem = true;
    const second = await context.newPage();
    await second.goto(address, { waitUntil: 'domcontentloaded' });
    assert.equal(await second.locator('html').getAttribute('data-theme'), 'light');
    await page.locator('#theme-toggle').focus();
    await page.keyboard.press('Space');
    await second.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    report.preferences.crossTabSync = true;
    await page.evaluate(() => localStorage.removeItem('tedits-studio-theme'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    report.preferences.followsSystemUntilExplicitChoice = true;
    await page.goto(address.replace('index.html', 'portfolio-preview.html'), { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#theme-toggle').count(), 1);
    report.preferences.previewHasSameControl = true;
    const blocked = await browser.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked for test', 'SecurityError'); } }));
    const blockedPage = await blocked.newPage();
    blockedPage.on('pageerror', e => errors.push(e.message));
    await blockedPage.goto(address, { waitUntil: 'domcontentloaded' });
    assert.equal(await blockedPage.locator('html').getAttribute('data-theme'), 'light');
    await blockedPage.locator('#theme-toggle').click();
    assert.equal(await blockedPage.locator('html').getAttribute('data-theme'), 'dark');
    report.preferences.blockedStorageStillToggles = true;
    assert.equal(errors.length, 0);
    fs.writeFileSync(path.join(evidence, 'checks.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
