/* Native scrolling stays in charge. Only the scene visuals follow with a short,
   frame-rate-independent settle. There are no wheel/touch interception or loops
   at rest. Reduced motion and no JavaScript show a complete linear gallery. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = value => value * value * (3 - 2 * value);
  let stop = () => {};

  function start() {
    stop();
    if (reduce.matches) {
      root.classList.remove('motion-ready');
      document.querySelectorAll('.envelope-scene').forEach(el => {
        el.classList.remove('is-live');
        el.classList.add('is-rest');
      });
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.remove('reveal-ready'));
      return;
    }
    root.classList.add('motion-ready');
    const controller = new AbortController();
    const {signal} = controller;
    const scene = document.querySelector('.envelope-scene');
    const stage = scene?.querySelector('.scene-stage');
    scene?.classList.remove('is-rest');
    scene?.classList.add('is-live');
    const map = document.querySelector('.journey-map');
    const route = document.querySelector('.journey-route');
    const path = document.querySelector('#planning-path');
    const progressPath = document.querySelector('.journey-progress');
    const traveller = document.querySelector('.bouquet-traveller');
    const photos = [...document.querySelectorAll('.invitation-photo')];
    const flap = document.querySelector('.envelope-flap');
    const seal = document.querySelector('.envelope-seal');
    const folds = [...document.querySelectorAll('.envelope-back, .envelope-lining, .envelope-pocket')];
    const stops = [...document.querySelectorAll('.journey-stop')];
    const parallax = [...document.querySelectorAll('.journey-photo')];
    const envelopeAmbient = document.querySelector('.ambient-photo-envelope');
    const enquiry = document.querySelector('.enquiry-section');
    const enquiryAmbient = document.querySelector('.ambient-photo-enquiry');
    const envelopePetals = [...document.querySelectorAll('.envelope-scene .petal')];
    const enquiryPetals = [...document.querySelectorAll('.petal-field-close .petal')];
    let geometry = null;
    let frame = 0;
    let lastTime = 0;
    let active = true;
    let currentScene = 0;
    let currentJourney = 0;
    let currentEnquiry = 0;
    let dirty = true;
    let scrollY = window.scrollY;
    let points = [];
    let pathLength = 0;

    function measure() {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const sceneRect = scene?.getBoundingClientRect();
      const mapRect = map?.getBoundingClientRect();
      const routeRect = route?.getBoundingClientRect();
      const enquiryRect = enquiry?.getBoundingClientRect();
      geometry = {
        vh,
        sceneTop: sceneRect ? sceneRect.top + y : 0,
        sceneLength: sceneRect ? Math.max(1, sceneRect.height - vh) : 1,
        mapTop: mapRect ? mapRect.top + y : 0,
        mapHeight: mapRect?.height || 1,
        enquiryTop: enquiryRect ? enquiryRect.top + y : 0,
        enquiryHeight: enquiryRect?.height || 1,
      };
      scene?.style.setProperty('--hold', (geometry.sceneLength / vh).toFixed(3));
      if (path && route && mapRect && routeRect) {
        pathLength = path.getTotalLength();
        const viewBox = route.viewBox.baseVal;
        const sx = routeRect.width / viewBox.width;
        const sy = routeRect.height / viewBox.height;
        points = Array.from({length: 301}, (_, i) => {
          const point = path.getPointAtLength(pathLength * i / 300);
          return {x: (point.x - viewBox.x) * sx + routeRect.left - mapRect.left,
            y: (point.y - viewBox.y) * sy + routeRect.top - mapRect.top};
        });
        if (progressPath) progressPath.style.strokeDasharray = `${pathLength}`;
      }
      scrollY = y;
      dirty = false;
    }

    function paintEnvelope(t) {
      if (!scene) return;
      scene.style.setProperty('--p', t.toFixed(4));
      // Match the last part of the pinned scene to the natural upward travel
      // that follows it, revealing the next chapter's paper background.
      const exit = clamp((t - .83) / .17);
      const exitDistance = (window.innerWidth <= 760 ? .34 : .44) * (geometry?.vh || window.innerHeight);
      stage?.style.setProperty('--exit-y', `${(-exit * exitDistance).toFixed(2)}px`);
      scene.dataset.beat = String(Math.min(4, Math.floor(t * 5)));
      const open = smooth(clamp(t / .27));
      if (flap) {
        flap.style.transform = `translate3d(0, ${t * 45}px, 0) rotateX(${-175 * open}deg)`;
        flap.style.zIndex = open > .55 ? '2' : '12';
      }
      if (seal) seal.style.opacity = String(1 - clamp(t / .16));
      const retreat = smooth(clamp((t - .78) / .18));
      folds.forEach(el => {
        el.style.transform = `translate3d(0, ${retreat * 60}px, 0) scale(${1 - retreat * .06})`;
        el.style.opacity = String(1 - retreat * .38);
      });
      photos.forEach((photo, i) => {
        const local = clamp((t - .24 - i * .16) / .19);
        const rise = smooth(clamp(local / .65));
        const settle = smooth(clamp((local - .65) / .35));
        const finalY = i * 4 - 6;
        // The closed-state photo fits wholly inside the pocket. Only after its
        // extraction starts does it become visible through the open mouth.
        const y = mix(38, -10, rise) + settle * (finalY + 10);
        const rotation = mix([-3, 2, -1][i], [-5, 3.5, -1.5][i], smooth(local));
        const x = mix(0, [-3, 2, 0][i], smooth(local));
        const scale = mix(.68, 1, rise) - settle * .015;
        photo.style.opacity = String(smooth(clamp(local / .08)));
        photo.style.transform = `translate3d(${x}%, ${y}%, 0) scale(${scale}) rotate(${rotation}deg)`;
        photo.style.zIndex = local > .40 ? String(15 + i) : String(4 - i);
      });
      envelopeAmbient?.style.setProperty('--ambient-y', `${((t - .5) * 92).toFixed(2)}px`);
      envelopePetals.forEach((petal, i) => {
        const drift = (t - .5) * [95, -74, 118, -88, 64, -112][i];
        const sway = Math.sin(t * Math.PI * 1.4 + i * 1.7) * 13;
        petal.style.transform = `translate3d(${sway.toFixed(2)}px, ${drift.toFixed(2)}px, 0) rotate(${(22 + i * 37 + t * 28).toFixed(2)}deg)`;
      });
    }

    function paintEnquiry(t) {
      enquiryAmbient?.style.setProperty('--ambient-y', `${((t - .5) * -76).toFixed(2)}px`);
      enquiryPetals.forEach((petal, i) => {
        const drift = (t - .5) * [72, -64, 91, -76][i];
        const sway = Math.sin(t * Math.PI + i * 1.5) * 10;
        petal.style.transform = `translate3d(${sway.toFixed(2)}px, ${drift.toFixed(2)}px, 0) rotate(${(35 + i * 42 + t * 22).toFixed(2)}deg)`;
      });
    }

    function paintJourney(t) {
      if (!map || !points.length) return;
      const index = clamp(t) * 300;
      const low = Math.min(299, Math.floor(index));
      const a = points[low];
      const b = points[low + 1];
      const fraction = index - low;
      const x = mix(a.x, b.x, fraction);
      const y = mix(a.y, b.y, fraction);
      const turn = clamp((Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI - 90) * .16, -14, 14);
      if (traveller) traveller.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${turn}deg)`;
      if (progressPath) progressPath.style.strokeDashoffset = String(pathLength * (1 - clamp(t + .055)));
      stops.forEach((el, i) => {
        const position = [.13, .38, .64, .88][i] ?? i / Math.max(1, stops.length - 1);
        el.classList.toggle('is-current', Math.abs(t - position) < .16);
        // All copy stays fully readable; prominence is a colour change, not hiding stages.
      });
      parallax.forEach((el, i) => {
        const distance = (t - .5) * [56, -44, 68][i % 3];
        el.style.setProperty('--parallax-y', `${distance.toFixed(2)}px`);
      });
    }

    function tick(time) {
      frame = 0;
      if (!active || document.hidden) return;
      if (dirty || !geometry) measure();
      const targetScene = clamp((scrollY - geometry.sceneTop) / geometry.sceneLength);
      const targetJourney = clamp((scrollY - geometry.mapTop + geometry.vh * .58) /
        Math.max(1, geometry.mapHeight - geometry.vh * .14));
      const targetEnquiry = clamp((scrollY - geometry.enquiryTop + geometry.vh) /
        Math.max(1, geometry.enquiryHeight + geometry.vh));
      const delta = Math.min(40, lastTime ? time - lastTime : 16.67);
      const blend = 1 - Math.exp(-delta / 120);
      const sceneBlend = 1 - Math.exp(-delta / 80);
      currentScene = mix(currentScene, targetScene, sceneBlend);
      currentJourney = mix(currentJourney, targetJourney, blend);
      currentEnquiry = mix(currentEnquiry, targetEnquiry, blend);
      const moving = Math.abs(currentScene - targetScene) > .00006 || Math.abs(currentJourney - targetJourney) > .00006 || Math.abs(currentEnquiry - targetEnquiry) > .00006;
      if (!moving) { currentScene = targetScene; currentJourney = targetJourney; currentEnquiry = targetEnquiry; }
      const sceneOnscreen = scrollY + geometry.vh > geometry.sceneTop && scrollY < geometry.sceneTop + geometry.sceneLength + geometry.vh;
      scene?.classList.toggle('is-moving', moving && sceneOnscreen);
      paintEnvelope(currentScene);
      paintJourney(currentJourney);
      paintEnquiry(currentEnquiry);
      lastTime = time;
      if (moving) requestTick();
    }

    function requestTick() {
      if (!frame && active && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function onScroll() { scrollY = window.scrollY; requestTick(); }
    function refresh() { dirty = true; requestTick(); }
    window.addEventListener('scroll', onScroll, {passive: true, signal});
    window.addEventListener('resize', refresh, {passive: true, signal});
    window.addEventListener('load', refresh, {once: true, signal});
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else { lastTime = 0; refresh(); }
    }, {signal});
    const resizeObserver = new ResizeObserver(refresh);
    if (scene) resizeObserver.observe(scene);
    if (map) resizeObserver.observe(map);
    document.fonts?.ready.then(() => { if (active) refresh(); });
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(({target, isIntersecting}) => {
          if (isIntersecting) { target.classList.add('is-visible'); observer.unobserve(target); }
        });
      }, {threshold: .08, rootMargin: '0px 0px -16px 0px'});
      document.querySelectorAll('[data-reveal]').forEach((el, i) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-visible');
        } else {
          el.classList.add('reveal-ready');
          el.style.setProperty('--reveal-delay', `${i % 3 * 65}ms`);
          observer.observe(el);
        }
      });
    }
    // Start at the actual restored scroll position, never replay a scene from zero.
    measure();
    currentScene = clamp((scrollY - geometry.sceneTop) / geometry.sceneLength);
    currentJourney = clamp((scrollY - geometry.mapTop + geometry.vh * .58) / Math.max(1, geometry.mapHeight - geometry.vh * .14));
    currentEnquiry = clamp((scrollY - geometry.enquiryTop + geometry.vh) / Math.max(1, geometry.enquiryHeight + geometry.vh));
    paintEnvelope(currentScene);
    paintJourney(currentJourney);
    paintEnquiry(currentEnquiry);
    stop = () => {
      active = false;
      controller.abort();
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer?.disconnect();
      scene?.classList.remove('is-moving');
      scene?.classList.remove('is-live');
      scene?.style.removeProperty('--hold');
      scene?.style.removeProperty('--p');
      stage?.style.removeProperty('--exit-y');
      if (scene) delete scene.dataset.beat;
      photos.forEach(el => { el.style.removeProperty('transform'); el.style.removeProperty('z-index'); el.style.removeProperty('opacity'); });
      folds.forEach(el => { el.style.removeProperty('transform'); el.style.removeProperty('opacity'); });
      if (flap) { flap.style.removeProperty('transform'); flap.style.removeProperty('z-index'); }
      seal?.style.removeProperty('opacity');
      traveller?.style.removeProperty('transform');
      parallax.forEach(el => el.style.removeProperty('--parallax-y'));
      envelopeAmbient?.style.removeProperty('--ambient-y');
      enquiryAmbient?.style.removeProperty('--ambient-y');
      [...envelopePetals, ...enquiryPetals].forEach(el => el.style.removeProperty('transform'));
      stops.forEach(el => el.classList.remove('is-current'));
      progressPath?.style.removeProperty('stroke-dasharray');
      progressPath?.style.removeProperty('stroke-dashoffset');
    };
  }
  start();
  reduce.addEventListener('change', start);
  // Keep the scene's height while cached so back/forward preserves scroll position.
  window.addEventListener('pagehide', () => { stop(); });
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
})();
