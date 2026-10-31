(() => {
  'use strict';
  const scene = document.getElementById('scene');
  const hero = document.getElementById('hero');
  const layers = Object.fromEntries([...document.querySelectorAll('[data-layer]')].map(node => [node.dataset.layer, node]));
  const progressFill = document.getElementById('progress-fill');
  const progressNumber = document.getElementById('progress-number');
  const motionToggle = document.getElementById('motion-toggle');
  const motionLabel = document.getElementById('motion-label');
  const scrollLabel = document.getElementById('scroll-label');
  const settingsTrigger = document.getElementById('settings-trigger');
  const settingsPanel = document.getElementById('settings-panel');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !reduced.matches;
  let depth = Number(document.getElementById('depth').value);
  let target = 0;
  let current = 0;
  let parkedProgress = 0;
  let frame = 0;
  let previousTime = 0;
  let start = 0;
  let distance = 1;

  const clamp = value => Math.max(0, Math.min(1, value));
  function paint(progress) {
    const h = hero.clientHeight;
    const w = hero.clientWidth;
    const p = progress * depth;
    // The hands have no scroll transform. Depth comes from the sky and three cloud planes.
    layers.sky.style.transform = `translate3d(${p * w * .014}px,${-p * h * .045}px,0)`;
    layers.far.style.transform = `translate3d(${-p * w * .05}px,${-p * h * .09}px,0)`;
    layers.middle.style.transform = `translate3d(${p * w * .10}px,${-p * h * .23}px,0)`;
    layers.front.style.transform = `translate3d(${-p * w * .18}px,${-p * h * .39}px,0)`;
    progressFill.style.transform = `scaleX(${progress})`;
    progressNumber.textContent = `${String(Math.round(progress * 100)).padStart(2, '0')} / 100`;
    scene.dataset.progress = progress.toFixed(4);
  }
  function tick(time) {
    const dt = previousTime ? Math.min(time - previousTime, 50) : 16.67;
    previousTime = time;
    const alpha = 1 - Math.exp(-dt / 85);
    current += (target - current) * alpha;
    if (Math.abs(target - current) < .00015) current = target;
    paint(current);
    if (current !== target) frame = requestAnimationFrame(tick);
    else { frame = 0; previousTime = 0; }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(tick);
  }
  function onScroll() {
    if (!enabled) return;
    target = clamp((window.scrollY - start) / distance);
    if (reduced.matches) {
      current = target;
      paint(current);
    } else schedule();
  }
  function measure(updateScroll = true) {
    const pin = scene.querySelector('.pin');
    const top = parseFloat(getComputedStyle(scene).getPropertyValue('--pin-top')) || 0;
    start = scene.offsetTop - top;
    distance = Math.max(1, scene.offsetHeight - pin.offsetHeight);
    if (updateScroll && enabled) onScroll();
    else paint(enabled ? current : parkedProgress);
  }
  function syncMotion() {
    motionToggle.setAttribute('aria-pressed', String(enabled));
    motionLabel.textContent = enabled ? 'Motion on' : 'Motion off';
    hero.dataset.motion = enabled ? 'on' : 'off';
    scene.dataset.motion = enabled ? 'on' : 'off';
    scrollLabel.textContent = enabled ? 'Scroll to feel the depth' : 'Continue below';
  }
  function setMotion(next) {
    if (next === enabled) return;
    const oldScroll = window.scrollY;
    const oldSceneBottom = scene.offsetTop + scene.offsetHeight;
    const bounds = hero.getBoundingClientRect();
    const heroVisible = bounds.bottom > 0 && bounds.top < innerHeight;
    const resumeAt = enabled ? current : parkedProgress;
    enabled = next;
    parkedProgress = resumeAt;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    syncMotion();
    measure(false);
    if (heroVisible) {
      // Match the pinned view before removing or restoring its scroll runway.
      // The frozen cloud composition and hand position do not jump at the toggle.
      window.scrollTo({ top: enabled ? start + resumeAt * distance : start, behavior: 'auto' });
      current = target = resumeAt;
    } else if (oldScroll >= oldSceneBottom) {
      window.scrollTo({ top: scene.offsetTop + scene.offsetHeight + oldScroll - oldSceneBottom, behavior: 'auto' });
      current = target = enabled ? clamp((window.scrollY - start) / distance) : resumeAt;
    }
    paint(enabled ? current : parkedProgress);
  }
  motionToggle.addEventListener('click', () => setMotion(!enabled));
  reduced.addEventListener('change', event => setMotion(!event.matches));
  function closeSettings(returnFocus = false) {
    settingsPanel.hidden = true;
    settingsTrigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) settingsTrigger.focus();
  }
  settingsTrigger.addEventListener('click', () => {
    const open = settingsPanel.hidden;
    settingsPanel.hidden = !open;
    settingsTrigger.setAttribute('aria-expanded', String(open));
  });
  document.getElementById('settings-close').addEventListener('click', () => closeSettings(true));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSettings(true); });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.settings')) closeSettings(); });
  document.getElementById('depth').addEventListener('input', event => {
    depth = Number(event.target.value);
    document.getElementById('depth-value').value = `${depth.toFixed(1)}×`;
    if (enabled) paint(current);
  });
  document.getElementById('copy-toggle').addEventListener('change', event => {
    document.getElementById('hero-copy').hidden = !event.target.checked;
  });
  function goTop(event) {
    if (event) event.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced.matches || !enabled ? 'auto' : 'smooth' });
  }
  ['replay', 'back-top', 'brand-home'].forEach(id => document.getElementById(id).addEventListener('click', goTop));
  document.getElementById('scroll-cue').addEventListener('click', () => {
    if (!enabled) {
      window.scrollTo({ top: scene.offsetTop + scene.offsetHeight, behavior: 'auto' });
      return;
    }
    const next = target > .85 ? 0 : start + distance * Math.min(1, target + .32);
    window.scrollTo({ top: next, behavior: reduced.matches ? 'auto' : 'smooth' });
  });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('load', measure, { once: true });
  document.fonts.ready.then(measure);
  syncMotion();
  measure();
})();
