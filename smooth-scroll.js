/* Shared progressive enhancement. Native scroll positions still drive all scenes. */
(() => {
  'use strict';
  if (window.TeditsScroll) return;
  const root = document.documentElement;
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let instance = null;
  let lockFrame = 0;

  function pageLocked() {
    // Read the app's locks, not Lenis's own .lenis-stopped overflow rule.
    const bodyOverflow = getComputedStyle(body).overflowY;
    return root.classList.contains('loader-active') ||
      /^(hidden|clip)$/.test(bodyOverflow) ||
      /^(hidden|clip)$/.test(root.style.overflowY || root.style.overflow) ||
      [...document.querySelectorAll('dialog[open]')].some(dialog => dialog.matches(':modal'));
  }

  function syncLock() {
    lockFrame = 0;
    if (!instance) return;
    if (pageLocked()) {
      if (!instance.isStopped) instance.stop();
    } else if (instance.isStopped) {
      instance.start();
      instance.resize();
    }
  }

  function scheduleLock() {
    if (!lockFrame) lockFrame = requestAnimationFrame(syncLock);
  }

  function refresh() {
    if (!instance) return;
    instance.resize();
    // Respect restored positions and external instant scrolls from scene toggles.
    instance.scrollTo(window.scrollY, {immediate: true, force: true});
    syncLock();
  }

  function setup() {
    instance?.destroy();
    instance = null;
    if (reduced.matches || typeof window.Lenis !== 'function') return;
    instance = new window.Lenis({
      autoRaf: true,
      lerp: .13,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
      prevent: node => node.matches?.('dialog, [data-native-scroll]'),
    });
    syncLock();
  }

  function scrollTo(target, options = {}) {
    const immediate = reduced.matches || options.immediate || options.behavior === 'instant';
    if (instance) {
      syncLock();
      instance.scrollTo(target, {...options, immediate});
      return;
    }
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    const top = typeof element === 'number' ? element : window.scrollY + element.getBoundingClientRect().top;
    window.scrollTo({top: top + (options.offset || 0), behavior: immediate ? 'instant' : 'smooth'});
  }

  window.TeditsScroll = {
    get instance() { return instance; },
    scrollTo,
    refresh,
    cancel() { instance?.scrollTo(window.scrollY, {immediate: true, force: true}); },
  };

  // A control can change a scene's height or scroll directly. Finish inertia
  // before its handler runs so the next Lenis frame cannot undo that position.
  document.addEventListener('click', event => {
    if (event.target.closest('a, button, input, select, textarea, summary')) window.TeditsScroll.cancel();
  }, {capture: true});
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey ||
        event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
      window.TeditsScroll.cancel();
    }
  }, {capture: true});

  // Keep a page's existing anchor/focus handler in charge when it has one.
  // Other pages receive smooth same-page links, including filename.html#section.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    if (link.getAttribute('href').startsWith('#') &&
        document.querySelector('script[src*="section-navigation.js"]')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname ||
        url.search !== location.search || !url.hash) return;
    let id;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    const focusTarget = target.querySelector('h1, h2, h3') || target;
    if (!focusTarget.hasAttribute('tabindex')) {
      focusTarget.setAttribute('tabindex', '-1');
      focusTarget.addEventListener('blur', () => focusTarget.removeAttribute('tabindex'), {once: true});
    }
    focusTarget.focus({preventScroll: true});
    requestAnimationFrame(() => {
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) ||
        parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      scrollTo(target, {offset: -margin, immediate: id === 'main'});
    });
  });

  // Watch only lock owners. Observing scene subtrees would run on every animation.
  let rootLocks = [...root.classList].filter(name => !name.startsWith('lenis')).join(' ') + root.style.cssText;
  const locks = new MutationObserver(records => {
    let changed = records.some(record => record.target !== root);
    const next = [...root.classList].filter(name => !name.startsWith('lenis')).join(' ') + root.style.cssText;
    if (next !== rootLocks) { rootLocks = next; changed = true; }
    if (changed) scheduleLock();
  });
  locks.observe(root, {attributes: true, attributeFilter: ['class', 'style']});
  locks.observe(body, {attributes: true, attributeFilter: ['class', 'style']});
  document.querySelectorAll('dialog').forEach(dialog => locks.observe(dialog, {
    attributes: true, attributeFilter: ['open'],
  }));
  reduced.addEventListener('change', setup);
  addEventListener('load', refresh, {once: true});
  addEventListener('pageshow', refresh);
  addEventListener('pagehide', () => window.TeditsScroll.cancel());
  setup();
})();
