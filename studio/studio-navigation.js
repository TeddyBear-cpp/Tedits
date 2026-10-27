/* Keep the button row visible. The corner brand clears away as you scroll. */
(() => {
  'use strict';
  const header = document.querySelector('.buttons-nav .site-header');
  if (!header) return;
  const brand = document.querySelector('.buttons-nav .corner-brand');
  const theme = document.querySelector('.buttons-nav .corner-theme');
  const scene = document.getElementById('cloud-scene');
  function sync() {
    const inHero = scene && scene.getBoundingClientRect().bottom > 0;
    const atTop = window.scrollY < 16;
    header.dataset.surface = inHero ? 'hero' : 'page';
    if (brand) brand.dataset.surface = atTop ? 'hero' : 'page';
    if (theme) theme.dataset.surface = inHero ? 'hero' : 'page';
  }
  sync();
  addEventListener('scroll', sync, {passive:true});
  if (scene && 'IntersectionObserver' in window) new IntersectionObserver(sync, {threshold:0}).observe(scene);
  addEventListener('resize', sync, {passive:true});
  addEventListener('pageshow', sync);
})();
