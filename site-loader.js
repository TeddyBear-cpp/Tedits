(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.classList.contains('loader-active')) return;
  const key = document.body.dataset.loaderKey;
  const critical = [...document.querySelectorAll('[data-loader-critical]')];
  const images = critical.map(element => {
    const source = element.poster || element.currentSrc || element.src;
    if (!source) return Promise.resolve();
    if (element.tagName === 'IMG') return element.decode().catch(() => {});
    const image = new Image();
    image.src = source;
    return image.decode().catch(() => {});
  });
  const fonts = document.fonts ? Promise.all([
    document.fonts.load('500 24px Syne'),
    document.fonts.load('400 16px "DM Sans"')
  ]).catch(() => {}) : Promise.resolve();
  Promise.race([
    Promise.all([...images, fonts]),
    new Promise(resolve => setTimeout(resolve, 1800))
  ]).then(() => {
    root.classList.add('loader-finishing');
    setTimeout(() => {
      root.classList.remove('loader-active', 'loader-finishing');
      try { sessionStorage.setItem(key, '1'); } catch (_) {}
    }, 160);
  });
})();
