// Keep native fragment URLs while placing the section's useful content in view.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const focusSelectors = {
    work: '.project-visual, .work-card',
    approach: '.palette-study',
    contact: '#contact-form',
    quote: '.enquiry-panel',
    products: '.product',
    menus: '.menu-photo',
    'meal-prep': '.meal-photo',
    beats: '.tracks',
    licenses: '.license-grid'
  };
  function layoutTop(element) {
    let top = 0;
    for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  }
  function destination(section) {
    const selector = focusSelectors[section.id];
    return (selector && section.querySelector(selector)) || section;
  }
  function navigate(hash, {focus = false, animate = true} = {}) {
    const id = decodeURIComponent(hash.slice(1));
    const section = id ? document.getElementById(id) : document.body;
    if (!section) return;
    // A new destination replaces any smooth scroll already in progress.
    window.scrollTo({top:window.scrollY,behavior:'instant'});
    const topLink = !id || id === 'top';
    const skip = id === 'main';
    const fixedHeader = document.querySelector('.buttons-nav .site-header');
    const clearance = fixedHeader ? fixedHeader.getBoundingClientRect().bottom + 24 : 32;
    const focal = fixedHeader && id === 'work' ? section : destination(section);
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    let top;
    if (topLink) top = 0;
    else if (skip) top = layoutTop(section);
    else {
      const height = focal.offsetHeight;
      // Centre usable blocks; a long form/list starts at its first useful control.
      top = height <= innerHeight - 64
        ? layoutTop(focal) + height / 2 - innerHeight / 2
        : layoutTop(focal) - clearance;
      if (focal === section && height > innerHeight - 64) {
        const heading = section.querySelector('.section-heading, .section-head, h2, h1');
        if (heading) top = layoutTop(heading) - clearance;
      }
    }
    if (focus && !topLink) {
      // Preserve the material chooser's own focus when a catalogue action selected it.
      const activeInside = focal.contains(document.activeElement) && document.activeElement !== document.body;
      if (!activeInside) {
        const target = [...focal.querySelectorAll('h2, h3, h1')].find(node=>node.getClientRects().length) || focal;
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex','-1');
          target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
        }
        target.focus({preventScroll:true});
      }
    }
    window.scrollTo({top:Math.max(0,Math.min(max,top)),behavior:animate&&!reduced.matches?'smooth':'instant'});
  }
  document.addEventListener('click',event=>{
    const link = event.target.closest('a[href^="#"]');
    if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash=link.getAttribute('href');
    if(hash!=='#'&&!document.getElementById(decodeURIComponent(hash.slice(1))))return;
    event.preventDefault();
    if(location.hash!==hash) history.pushState(null,'',hash);
    // Let menu closing and material-selection handlers finish before measuring.
    requestAnimationFrame(()=>navigate(hash,{focus:true}));
  });
  window.addEventListener('hashchange',()=>navigate(location.hash,{animate:false}));
  window.addEventListener('load',()=>{if(location.hash)navigate(location.hash,{animate:false});});
})();
