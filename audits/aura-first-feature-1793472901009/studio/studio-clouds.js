/* Normal page scroll with light image parallax; no pinned scroll distance. */
(() => {
  'use strict';
  const scene=document.getElementById('cloud-scene');
  if(!scene)return;
  const hero=document.getElementById('cloud-hero');
  const toggle=document.getElementById('cloud-motion-toggle');
  const layers=Object.fromEntries([...scene.querySelectorAll('[data-cloud-layer]')].map(el=>[el.dataset.cloudLayer,el]));
  const hands=scene.querySelector('.cloud-hands');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const depth=.2;
  let enabled=!reduced.matches,frame=0,start=0,distance=1,width=1,height=1,painted=-1;
  const clamp=n=>Math.max(0,Math.min(1,n));
  scene.dataset.depth=String(depth);
  function paint(){
    frame=0;
    const progress=enabled?clamp((scrollY-start)/distance):0;
    if(progress===painted)return;
    painted=progress;
    const p=progress*depth;
    layers.sky.style.transform=`translate3d(${p*width*.014}px,${p*height*.045}px,0)`;
    layers.far.style.transform=`translate3d(${-p*width*.05}px,${p*height*.09}px,0)`;
    layers.middle.style.transform=`translate3d(${p*width*.10}px,${p*height*.23}px,0)`;
    layers.front.style.transform=`translate3d(${-p*width*.18}px,${-p*height*.39}px,0)`;
    hands.style.transform=`translate3d(0,${p*height*.08}px,0)`;
    scene.dataset.progress=progress.toFixed(4);
  }
  function schedule(){if(!document.hidden&&!frame)frame=requestAnimationFrame(paint);}
  function measure(){
    start=scene.getBoundingClientRect().top+scrollY;
    width=hero.clientWidth;height=hero.clientHeight;distance=Math.max(1,scene.offsetHeight);
    painted=-1;
    schedule();
  }
  function sync(){
    scene.dataset.motion=enabled?'on':'off';
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.textContent=enabled?'Parallax on':'Parallax off';
    // Only artwork changes; this control never resizes or repositions the page.
    schedule();
  }
  toggle.hidden=false;
  toggle.addEventListener('click',()=>{enabled=!enabled;sync();});
  reduced.addEventListener('change',e=>{enabled=!e.matches;sync();});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();
  });
  new IntersectionObserver(entries=>{
    scene.dataset.inView=String(entries[0].isIntersecting);
    if(entries[0].isIntersecting)schedule();
  },{rootMargin:'200px 0px'}).observe(scene);
  addEventListener('scroll',()=>{if(scene.dataset.inView!=='false')schedule();},{passive:true});
  addEventListener('resize',measure,{passive:true});
  addEventListener('pageshow',measure);
  addEventListener('load',measure,{once:true});
  document.fonts.ready.then(measure);
  sync();measure();
})();
