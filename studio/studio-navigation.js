/* Keep the button row visible. Its surface appears only after the hero exits. */
(() => {
  'use strict';
  const header = document.querySelector('.buttons-nav .site-header');
  if (!header) return;
  const scene = document.getElementById('cloud-scene');
  if (!scene) { header.dataset.surface = 'page'; return; }
  function sync() {
    header.dataset.surface = scene.getBoundingClientRect().bottom > 0 ? 'hero' : 'page';
  }
  sync();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(sync, {threshold:0}).observe(scene);
  } else {
    addEventListener('scroll', sync, {passive:true});
  }
  addEventListener('pageshow', sync);
})();
