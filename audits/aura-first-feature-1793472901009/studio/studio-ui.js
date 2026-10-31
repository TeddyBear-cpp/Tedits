/* Native details semantics with short, interruptible disclosure transitions. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.case-study').forEach(details => {
    const summary = details.querySelector('summary');
    const content = details.querySelector(':scope > div');
    if (!summary || !content) return;
    let animation = null, entrance = null, wantOpen = details.open;
    function finish() {
      animation?.cancel(); entrance?.cancel(); animation = entrance = null;
      details.open = wantOpen;
      details.classList.remove('is-transitioning');
      window.TeditsScroll?.instance?.resize();
    }
    summary.addEventListener('click', event => {
      event.preventDefault();
      const from = details.getBoundingClientRect().height;
      animation?.cancel(); entrance?.cancel();
      wantOpen = !wantOpen;
      if (reduced.matches || event.detail === 0 || !details.animate) { finish(); return; }
      // Only this short disclosure reflows; no page-wide height measurements per frame.
      details.open = true;
      const to = wantOpen ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height;
      details.classList.add('is-transitioning');
      animation = details.animate([{height:`${from}px`},{height:`${to}px`}],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'});
      entrance = content.animate(wantOpen ? [{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}] : [{opacity:1},{opacity:0}],{duration:wantOpen ? 220 : 150,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
      animation.onfinish = finish;
    });
    reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
    addEventListener('pagehide', finish);
  });
})();
