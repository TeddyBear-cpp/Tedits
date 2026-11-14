// Native CSS/WAAPI motion. Scroll reads are batched before visual writes.
export function initMotion({reduce,assets}){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 let frame=0;
 document.body.classList.add('motion-ready');
 const headings=$$('[data-words]');
 headings.forEach(heading=>{
  if(reduce.matches)return;
  const texts=[];const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);while(walker.nextNode())texts.push(walker.currentNode);
  let i=0;texts.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word.trim()){fragment.append(document.createTextNode(word));return;}const outer=document.createElement('span'),inner=document.createElement('span');outer.className='word-clip';inner.className='word';inner.textContent=word;inner.style.animationDelay=Math.min(i++*70,420)+'ms';outer.append(inner);fragment.append(outer);});node.replaceWith(fragment);});
  heading.classList.add('words-pending');
 });
 const entrances=$$('.page-heading,.service-explorer,.finish-explorer,.process li,.enquiry-cta>div');
 if(!reduce.matches){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  headings.forEach(el=>observer.observe(el));entrances.forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--reveal-delay',(i%3)*65+'ms');observer.observe(el);});
 }
 $$('.comparison').forEach(comparison => {
  const input = comparison.querySelector('input');
  const handle = comparison.querySelector('.compare-handle');
  let drag;
  function renderValue() {
   comparison.style.setProperty('--split', input.value + '%');
   input.setAttribute('aria-valuetext', input.value + '% after');
  }
  input.addEventListener('input', renderValue);
  handle.addEventListener('pointerdown', event => {
   if (!event.isPrimary || event.button !== 0) return;
   event.preventDefault();
   input.focus({preventScroll: true});
   handle.setPointerCapture(event.pointerId);
   drag = {id: event.pointerId, x: event.clientX, value: input.valueAsNumber};
  });
  handle.addEventListener('pointermove', event => {
   if (drag?.id !== event.pointerId) return;
   const width = comparison.getBoundingClientRect().width;
   input.valueAsNumber = drag.value + (event.clientX - drag.x) * 100 / width;
   renderValue();
  });
  handle.addEventListener('lostpointercapture', event => {
   if (drag?.id === event.pointerId) drag = undefined;
  });
 });
 const layers=$$('[data-parallax]'),hero=$('.hero'),heroImage=$('.hero-image');
 function update(){
  frame=0;if(reduce.matches)return;
  const layerReads=layers.map(el=>({el,box:el.parentElement.getBoundingClientRect(),speed:Number(el.dataset.parallax)}));
  const heroBox=hero?.getBoundingClientRect();
  layerReads.forEach(({el,box,speed})=>{if(box.bottom>0&&box.top<innerHeight){const offset=Math.max(-28,Math.min(28,(innerHeight*.5-box.top-box.height*.5)*speed));el.style.transform='translate3d(0,'+offset+'px,0)';}});
  if(heroImage&&heroBox.bottom>0){heroImage.style.transform='translate3d(0,'+Math.min(55,Math.max(0,-heroBox.top*.12))+'px,0) scale(1.08)';}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});schedule();
 reduce.addEventListener('change',()=>{if(reduce.matches){layers.forEach(el=>el.style.removeProperty('transform'));heroImage?.style.removeProperty('transform');headings.forEach(el=>el.classList.add('in-view'));entrances.forEach(el=>el.classList.add('in-view'));}else schedule();});
 // Paint is an edge treatment, not a loading screen: navigation needs only one short sweep.
 const transition=document.createElement('div');transition.className='paint-transition';transition.setAttribute('aria-hidden','true');transition.style.setProperty('--transition-edge','url("'+assets.paintMask.transitionSrc+'")');document.body.append(transition);
 let pending=false;
 try{const destination=sessionStorage.getItem('ff-paint-navigation');sessionStorage.removeItem('ff-paint-navigation');if(destination===location.pathname&&!reduce.matches){transition.classList.add('arrived');transition.animate([{transform:'translateY(0)'},{transform:'translateY(-115%)'}],{duration:650,easing:'cubic-bezier(.77,0,.175,1)',fill:'forwards'}).finished.then(()=>transition.classList.remove('arrived'));}}catch{}
 document.addEventListener('click',async event=>{
  const link=event.target.closest('a[href]');if(!link||event.defaultPrevented||event.button!==0||event.detail===0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||link.target&&link.target!=='_self'||reduce.matches)return;
  const url=new URL(link.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname||!url.pathname.startsWith(new URL('./',import.meta.url).pathname))return;
  event.preventDefault();if(pending)return;pending=true;
  document.querySelector('dialog[open]')?.close();
  try{sessionStorage.setItem('ff-paint-navigation',url.pathname);}catch{}
  try{await transition.animate([{transform:'translateY(115%)'},{transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.77,0,.175,1)',fill:'forwards'}).finished;}catch{}
  location.assign(url.href);
 });
 addEventListener('pageshow',event=>{if(event.persisted){pending=false;transition.getAnimations().forEach(animation=>animation.cancel());transition.classList.remove('arrived');schedule();}});
}
