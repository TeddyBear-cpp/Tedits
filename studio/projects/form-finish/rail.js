// Infinite native rails share axis handling, focus behaviour and reduced-motion support.
export function mountRail(rail,{reduce,controls=[],allScreens=false,speed=.018,pauseButton=null}={}){
 if(!rail)return;
 const originals=[...rail.children],copy=el=>{const c=el.cloneNode(true);c.setAttribute('aria-hidden','true');c.setAttribute('inert','');c.tabIndex=-1;return c;};
 const leading=originals.map(copy),trailing=originals.map(copy);rail.prepend(...leading);rail.append(...trailing);
 const desktop=matchMedia('(hover: hover) and (pointer: fine) and (min-width:701px)');
 let loop=0,visible=false,focus=false,dragging=false,stopped=false,interactionUntil=0,last=0,position=0,raf=0;
 const measure=()=>{const old=loop;loop=originals[0].offsetLeft-leading[0].offsetLeft;if(loop>0){position=old?loop+((rail.scrollLeft-old)%old+old)%old:loop;rail.scrollLeft=position;}};
 const normalise=()=>{if(!loop)return;let x=rail.scrollLeft;if(x<loop*.5)x+=loop;else if(x>=loop*1.5)x-=loop;if(x!==rail.scrollLeft)rail.scrollLeft=x;position=x;};
 const moving=()=>loop>0&&visible&&(allScreens||desktop.matches)&&!reduce.matches&&!focus&&!dragging&&!stopped&&!document.hidden&&performance.now()>interactionUntil;
 const frame=t=>{const dt=Math.min(t-last,40);last=t;if(moving()){position+=dt*speed;if(position>=loop*1.5)position-=loop;rail.scrollLeft=position;}raf=requestAnimationFrame(frame);};
 const manual=()=>interactionUntil=performance.now()+650;
 const toggle=()=>{stopped=!stopped;rail.dataset.stopped=String(stopped);if(pauseButton){pauseButton.setAttribute('aria-pressed',String(stopped));pauseButton.textContent=stopped?'Resume reviews':'Pause reviews';}};
 pauseButton?.addEventListener('click',toggle);
 rail.addEventListener('scroll',normalise,{passive:true});
 rail.addEventListener('focusin',e=>focus=e.target.matches(':focus-visible'));
 rail.addEventListener('focusout',()=>queueMicrotask(()=>focus=rail.contains(document.activeElement)&&document.activeElement.matches(':focus-visible')));
 rail.addEventListener('wheel',e=>{if(e.ctrlKey)return;const horizontal=e.shiftKey&&Math.abs(e.deltaY)>.5||Math.abs(e.deltaX)>.5&&Math.abs(e.deltaX)>Math.abs(e.deltaY);if(!horizontal)return;e.preventDefault();e.stopPropagation();manual();const delta=e.shiftKey&&Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX;rail.scrollLeft+=delta*(e.deltaMode===1?16:e.deltaMode===2?rail.clientWidth:1);},{passive:false});
 let touchX=0,touchY=0,touchHorizontal=false;
 rail.addEventListener('touchstart',e=>{const t=e.touches[0];if(t){touchX=t.clientX;touchY=t.clientY;touchHorizontal=false;}},{passive:true});
 rail.addEventListener('touchmove',e=>{const t=e.touches[0];if(t&&Math.abs(t.clientX-touchX)>6&&Math.abs(t.clientX-touchX)>Math.abs(t.clientY-touchY)){touchHorizontal=true;manual();}},{passive:true});
 rail.addEventListener('touchend',()=>{if(touchHorizontal)manual();touchHorizontal=false;},{passive:true});
 rail.addEventListener('keydown',e=>{if(e.key===' '&&e.target===rail){e.preventDefault();toggle();}else if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();manual();rail.scrollBy({left:(e.key==='ArrowRight'?1:-1)*rail.clientWidth*.6,behavior:'instant'});}});
 let downX=0,downY=0,downScroll=0,pointerDown=false,moved=false;
 rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;downX=e.clientX;downY=e.clientY;downScroll=rail.scrollLeft;pointerDown=true;dragging=false;moved=false;focus=false;});
 window.addEventListener('pointermove',e=>{if(!pointerDown)return;const dx=e.clientX-downX,dy=e.clientY-downY;if(dragging||Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)){dragging=true;moved=true;manual();rail.scrollLeft=downScroll-dx;}});
 const release=()=>{pointerDown=false;if(dragging){dragging=false;manual();}};
 window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
 rail.addEventListener('click',e=>{if(moved){e.preventDefault();moved=false;}},true);rail.addEventListener('dragstart',e=>e.preventDefault());
 controls.forEach(control=>control.addEventListener('click',()=>{manual();rail.scrollBy({left:(control.dataset.gallery==='next'?1:-1)*rail.clientWidth*.65,behavior:reduce.matches?'instant':'smooth'});}));
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;}).observe(rail);
 new ResizeObserver(measure).observe(rail);measure();requestAnimationFrame(frame);
 window.addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});
 window.addEventListener('pageshow',e=>{if(e.persisted){last=0;raf=requestAnimationFrame(frame);}});
}
