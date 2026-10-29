/* A single native scroll journey: no wheel interception or perpetual animation loop. */
(() => {
  'use strict';
  const scene = document.querySelector('.scroll-story');
  if (!scene) return;
  const stage = scene.querySelector('.story-stage');
  const chapters = [...scene.querySelectorAll('.story-chapter')];
  const tabs = [...scene.querySelectorAll('[data-story-step]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 579px)');
  const mobile = matchMedia('(max-width: 760px)');
  let start = 0, distance = 1, frame = 0, active = -1, pinned = false;
  const clamp = n => Math.max(0, Math.min(1, n));
  function paint() {
    frame = 0;
    if (!pinned) return;
    const progress = clamp((scrollY - start) / distance);
    const position = progress * 2.5;
    const next = Math.min(2, Math.floor(position + .2));
    chapters.forEach((chapter, index) => {
      const enter = index === 0 ? 1 : clamp((position - index + .4) / .4);
      const exit = index === 2 ? 0 : clamp((position - index - .6) / .4);
      const opacity = enter - exit;
      chapter.style.opacity = String(opacity);
      chapter.style.visibility = opacity > .001 ? 'visible' : 'hidden';
      chapter.style.transform = `translate3d(0,${(1 - opacity) * 12}px,0)`;
      chapter.style.pointerEvents = index === next ? 'auto' : 'none';
      // Browser contents dissolve together; text leaves before the next copy enters.
      const copy = chapter.querySelector('.story-copy');
      copy.style.visibility = opacity > .5 ? 'visible' : 'hidden';
      copy.style.opacity = String(opacity > .5 ? (opacity - .5) * 2 / opacity : 0);
    });
    // Only the current chapter is exposed to assistive technology in pinned mode.
    if (next !== active) {
      active = next;
      chapters.forEach((chapter, index) => chapter.setAttribute('aria-hidden', String(index !== active)));
      tabs.forEach((tab, index) => index === active ? tab.setAttribute('aria-current', 'step') : tab.removeAttribute('aria-current'));
    }
    scene.dataset.progress = progress.toFixed(3);
  }
  function schedule() { if (pinned && !frame) frame = requestAnimationFrame(paint); }
  function measure() {
    const enable = !mobile.matches && !reduced.matches && !shortScreen.matches && CSS.supports('position', 'sticky');
    pinned = enable;
    scene.dataset.pinned = String(enable);
    scene.classList.toggle('is-live', enable);
    scene.classList.toggle('is-rest', !enable);
    if (!enable) {
      cancelAnimationFrame(frame); frame = 0; active = -1;
      delete scene.dataset.progress;
      tabs.forEach(tab => tab.removeAttribute('aria-current'));
      chapters.forEach(chapter => {
        chapter.style.removeProperty('opacity'); chapter.style.removeProperty('visibility'); chapter.style.removeProperty('transform'); chapter.style.removeProperty('pointer-events'); chapter.removeAttribute('aria-hidden');
        const copy = chapter.querySelector('.story-copy'); copy.style.removeProperty('visibility'); copy.style.removeProperty('opacity');
      });
      return;
    }
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    start = scene.getBoundingClientRect().top + scrollY - top;
    distance = Math.max(1, scene.offsetHeight - stage.offsetHeight);
    paint();
  }
  tabs.forEach((tab, index) => tab.addEventListener('click', event => {
    if (!pinned) return;
    const top = start + distance * (index / 2.5);
    const immediate = event.detail === 0 || reduced.matches;
    if (window.TeditsScroll) window.TeditsScroll.scrollTo(top, {immediate});
    else window.scrollTo({top, behavior: immediate ? 'instant' : 'smooth'});
  }));
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', measure, {passive:true});
  addEventListener('pageshow', measure);
  reduced.addEventListener('change', measure);
  shortScreen.addEventListener('change', measure);
  mobile.addEventListener('change', measure);
  document.fonts.ready.then(measure);
  // Content above can resize when the hero motion control or loader changes state.
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    observer.observe(document.querySelector('.cloud-scene'));
    observer.observe(document.querySelector('.story-intro'));
  }
  measure();

  // Hidden upcoming chapters must have their photographs ready before the reveal.
  const preload = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    scene.querySelectorAll('img').forEach(img => { img.loading = 'eager'; img.decode().catch(() => {}); });
    preload.disconnect();
  }, {rootMargin:'200% 0px'});
  preload.observe(scene);

  const target = document.getElementById('business-rotation');
  const pause = document.getElementById('rotation-pause');
  const examples = target.dataset.examples.split('|');
  const current = document.createElement('span');
  current.className = 'business-current'; current.textContent = examples[0];
  target.replaceChildren(current, ...examples.map(text => {
    const copy = document.createElement('span'); copy.className = 'business-size';
    copy.textContent = text; copy.setAttribute('aria-hidden', 'true'); return copy;
  }));
  let rotation = 0, swap = 0, index = 0, visible = false, paused = false;
  function timer() {
    clearInterval(rotation); clearTimeout(swap); target.classList.remove('is-changing');
    if (reduced.matches || paused || !visible || document.hidden) return;
    rotation = setInterval(() => {
      target.classList.add('is-changing');
      swap = setTimeout(() => { index = (index + 1) % examples.length; current.textContent = examples[index]; target.classList.remove('is-changing'); }, 180);
    }, 3200);
  }
  pause.hidden = false;
  pause.addEventListener('click', () => {
    paused = !paused; pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Resume rotating text' : 'Pause rotating text'; timer();
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; timer(); }).observe(target);
  document.addEventListener('visibilitychange', timer);
  reduced.addEventListener('change', () => { pause.hidden = reduced.matches; timer(); });
  pause.hidden = reduced.matches;

  // WAAPI entrances start from a fully readable page and can be cancelled live.
  const animations = new Set();
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const chapter = entry.target.classList.contains('story-chapter');
    if (chapter && pinned) return;
    reveal.unobserve(entry.target);
    if (reduced.matches) return;
    const animation = entry.target.animate([{opacity:0,transform:`translateY(${chapter ? 8 : 20}px)`},{opacity:1,transform:'translateY(0)'}], {duration:chapter ? 360 : 540,easing:'cubic-bezier(.22,1,.36,1)'});
    animations.add(animation); animation.finished.finally(() => animations.delete(animation)).catch(() => {});
  }), {threshold:.08});
  document.querySelectorAll('.story-reveal').forEach(el => reveal.observe(el));
  chapters.forEach(el => reveal.observe(el));
  reduced.addEventListener('change', () => { if (reduced.matches) animations.forEach(animation => animation.cancel()); });
})();
