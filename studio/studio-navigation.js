/* The corner controls clear one row as the hero exits; returning reverses it. */
(() => {
  'use strict';
  const header = document.querySelector('.buttons-nav .site-header');
  if (!header) return;
  const body = document.body;
  const corners = [...document.querySelectorAll('.corner-brand, .corner-theme')];
  const scene = document.getElementById('cloud-scene');
  const hero = scene || document.querySelector('main .service-hero, main .enquiry-intro, main .case-intro');
  let expanded;
  let frame = 0;

  function sync() {
    frame = 0;
    const bottom = hero ? hero.getBoundingClientRect().bottom : -1;
    // A small dead band prevents repeated transitions at the hero boundary.
    const next = expanded === undefined ? bottom > 84 : bottom > (expanded ? 72 : 96);
    // Switch colour as the photograph clears the compact navigation row.
    const surface = scene && bottom > 72 ? 'hero' : 'page';
    if (header.dataset.surface !== surface) header.dataset.surface = surface;
    corners.forEach(corner => {
      if (corner.dataset.surface !== surface) corner.dataset.surface = surface;
    });
    if (next === expanded) return;
    expanded = next;
    body.dataset.navLayout = expanded ? 'expanded' : 'compact';
    corners.forEach(corner => { corner.inert = !expanded; });
    if (!expanded && corners.some(corner => corner.contains(document.activeElement))) {
      header.querySelector('a').focus({preventScroll:true});
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(sync);
  }
  sync();
  requestAnimationFrame(() => { body.dataset.navReady = 'true'; });
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  addEventListener('pageshow', schedule);
  if (hero && 'ResizeObserver' in window) new ResizeObserver(schedule).observe(hero);
  document.fonts.ready.then(schedule);
})();
