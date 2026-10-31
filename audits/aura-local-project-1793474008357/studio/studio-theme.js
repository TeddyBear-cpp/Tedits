/* Studio uses the approved light palette on every visit. */
(() => {
  const root=document.documentElement;
  root.dataset.theme='light';
  root.style.colorScheme='light';
  try{localStorage.removeItem('tedits-studio-theme');}catch(_){}
})();
