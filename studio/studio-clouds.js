/* Scroll-only depth. The hands stay still and the animation sleeps at rest. */
(() => {
  'use strict';
  const scene = document.getElementById('cloud-scene');
  if (!scene) return;
  const hero = document.getElementById('cloud-hero');
  const toggle = document.getElementById('cloud-motion-toggle');
  const layers = Object.fromEntries([...scene.querySelectorAll('[data-cloud-layer]')].map(el => [el.dataset.cloudLayer, el]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const depth = .2;
  scene.dataset.depth = String(depth);
  let enabled = !reduced.matches;
  let target = 0, current = 0, parked = 0, frame = 0, previous = 0;
  let start = 0, distance = 1, width = 1, height = 1;
  const clamp = n => Math.max(0, Math.min(1, n));
  function paint(progress) {
    const p = progress * depth;
    layers.sky.style.transform = `translate3d(${p * width * .014}px,${-p * height * .045}px,0)`;
    layers.far.style.transform = `translate3d(${-p * width * .05}px,${-p * height * .09}px,0)`;
    layers.middle.style.transform = `translate3d(${p * width * .10}px,${-p * height * .23}px,0)`;
    layers.front.style.transform = `translate3d(${-p * width * .18}px,${-p * height * .39}px,0)`;
    scene.dataset.progress = progress.toFixed(4);
  }
  function tick(time) {
    const dt = previous ? Math.min(time - previous, 50) : 16.67;
    previous = time;
    current += (target - current) * (1 - Math.exp(-dt / 85));
    if (Math.abs(target - current) < .00015) current = target;
    paint(current);
    if (current !== target) frame = requestAnimationFrame(tick);
    else { frame = 0; previous = 0; }
  }
  function scroll() {
    if (!enabled || document.hidden) return;
    target = clamp((window.scrollY - start) / distance);
    if (!frame && current !== target) frame = requestAnimationFrame(tick);
  }
  function measure(update = true) {
    const pin = scene.querySelector('.cloud-pin');
    const top = parseFloat(getComputedStyle(scene).getPropertyValue('--cloud-pin-top')) || 0;
    start = scene.offsetTop - top;
    distance = Math.max(1, scene.offsetHeight - pin.offsetHeight);
    width = hero.clientWidth;
    height = hero.clientHeight;
    paint(enabled ? current : parked);
    if (update && enabled) scroll();
  }
  function sync() {
    scene.dataset.motion = enabled ? 'on' : 'off';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.textContent = enabled ? 'Scroll motion on' : 'Scroll motion off';
  }
  function setMotion(next) {
    if (next === enabled) return;
    const oldScroll = window.scrollY;
    const oldBottom = scene.offsetTop + scene.offsetHeight;
    const bounds = hero.getBoundingClientRect();
    const visible = bounds.bottom > 0 && bounds.top < innerHeight;
    const progress = enabled ? current : parked;
    parked = progress;
    enabled = next;
    cancelAnimationFrame(frame);
    frame = previous = 0;
    sync();
    measure(false);
    if (visible) {
      window.scrollTo({top: enabled ? start + progress * distance : start, behavior:'instant'});
      current = target = progress;
    } else if (oldScroll >= oldBottom) {
      window.scrollTo({top: scene.offsetTop + scene.offsetHeight + oldScroll - oldBottom, behavior:'instant'});
      current = target = enabled ? clamp((window.scrollY - start) / distance) : progress;
    }
    paint(enabled ? current : parked);
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => setMotion(!enabled));
  reduced.addEventListener('change', e => setMotion(!e.matches));
  document.addEventListener('visibilitychange', () => {
    if(document.hidden){cancelAnimationFrame(frame);frame=previous=0;}
    else scroll();
  });
  new IntersectionObserver(entries => {
    scene.dataset.inView=String(entries[0].isIntersecting);
  }, {rootMargin:'200px 0px'}).observe(scene);
  addEventListener('scroll', scroll, {passive:true});
  addEventListener('resize', () => measure(), {passive:true});
  addEventListener('load', () => measure(), {once:true});
  document.fonts.ready.then(() => measure());
  sync();
  measure();
})();
