(() => {
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  if(preference.matches||!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    observer.unobserve(entry.target);
    entry.target.classList.add('case-visible');
  }),{threshold:.08});
  document.querySelectorAll('[data-case-reveal]').forEach(element=>{element.classList.add('case-ready');observer.observe(element);});
  preference.addEventListener('change',()=>{if(preference.matches){observer.disconnect();document.querySelectorAll('.case-ready').forEach(element=>element.classList.add('case-visible'));}});
})();
