/* Native sticky stage, scroll-driven transforms, and only visible video playback. */
(() => {
  'use strict';
  const scene=document.querySelector('.scroll-story');
  if(!scene)return;
  const stage=scene.querySelector('.story-stage');
  const chapters=[...scene.querySelectorAll('.story-chapter')];
  const cards=chapters.map(chapter=>chapter.querySelector('.story-video-card'));
  const videos=cards.map(card=>card.querySelector('video'));
  const tabs=[...scene.querySelectorAll('[data-story-step]')];
  const mediaButton=scene.querySelector('.story-media-toggle');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen=matchMedia('(max-height: 579px), (max-width: 900px) and (max-height: 699px)');
  const mobile=matchMedia('(max-width: 900px)');
  const visibleVideos=new Map();
  const cardStyles=cards.map(()=>({}));
  const enteredCards=new WeakSet(),mediaEntrances=new Set();
  const clamp=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{const t=clamp(n);return t*t*(3-2*t);};
  let start=0,distance=1,frame=0,active=-1,pinned=false,inView=false;
  let cardWidth=0,edgeShift=0,userPaused=false,reduceOverride=false;

  chapters.forEach(chapter=>{
    const title=chapter.querySelector('h3'),label=title.textContent.trim();
    title.setAttribute('aria-label',label);
    title.replaceChildren(...label.split(/\s+/).flatMap((word,i)=>{
      const span=document.createElement('span');
      span.className='story-word';span.textContent=word;span.style.setProperty('--word-index',i);
      span.setAttribute('aria-hidden','true');
      return i?[document.createTextNode(' '),span]:[span];
    }));
  });
  function mediaLabel(){
    const playing=videos.some(video=>!video.paused);
    const label=playing?'Pause videos':'Play videos';
    if(mediaButton.dataset.playing===String(playing))return;
    mediaButton.dataset.playing=String(playing);
    mediaButton.setAttribute('aria-label',label);
    mediaButton.querySelector('.story-media-label').textContent=label;
  }
  function syncMedia(){
    // In the normal reading layout two cards can intersect at once. Decode only
    // the one with the greatest visible area, rather than both near an edge.
    let mostVisible=null,largest=0;
    visibleVideos.forEach((ratio,video)=>{if(ratio>largest){largest=ratio;mostVisible=video;}});
    videos.forEach((video,i)=>{
      const visible=pinned?inView&&i===active:video===mostVisible;
      const play=visible&&!userPaused&&!document.hidden&&(!reduced.matches||reduceOverride);
      if(play){if(video.paused)video.play().catch(mediaLabel);}
      else if(!video.paused)video.pause();
    });
    mediaLabel();
  }
  videos.forEach(video=>{
    video.muted=true;
    video.controls=false;
    video.setAttribute('aria-hidden','true');
    video.setAttribute('tabindex','-1');
    video.addEventListener('play',()=>{if(reduced.matches)reduceOverride=true;mediaLabel();});
    video.addEventListener('pause',mediaLabel);
  });
  mediaButton.hidden=false;
  mediaButton.addEventListener('click',()=>{
    userPaused=videos.some(video=>!video.paused);
    reduceOverride=!userPaused;
    syncMedia();
  });
  function prepareMediaEntries(){
    videos.forEach(video=>{
      const slot=video.closest('.story-media-slot');
      if(!mobile.matches||reduced.matches||enteredCards.has(slot)||(pinned&&video!==videos[0])){delete slot.dataset.mediaEntry;return;}
      if(slot.getBoundingClientRect().top>=innerHeight)slot.dataset.mediaEntry='ready';
      else delete slot.dataset.mediaEntry;
    });
  }
  function enterMobileCard(video){
    const slot=video.closest('.story-media-slot');
    if(!mobile.matches||reduced.matches||enteredCards.has(slot))return;
    // Later pinned cards already slide in through the scroll choreography.
    if(pinned&&video!==videos[0])return;
    enteredCards.add(slot);
    const prepared=slot.dataset.mediaEntry==='ready';
    delete slot.dataset.mediaEntry;
    if(!prepared)return;
    const animation=slot.animate([
      {opacity:0,transform:'translate3d(32px,18px,0) rotate(1.5deg)'},
      {opacity:1,transform:'translate3d(0,0,0) rotate(0deg)'}
    ],{duration:620,easing:'cubic-bezier(.22,1,.36,1)'});
    mediaEntrances.add(animation);
    animation.finished.finally(()=>mediaEntrances.delete(animation)).catch(()=>{});
  }
  const videoObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting&&entry.intersectionRatio>=.12){visibleVideos.set(entry.target,entry.intersectionRatio);enterMobileCard(entry.target);}
      else visibleVideos.delete(entry.target);
    });
    syncMedia();
  },{threshold:[0,.12,.25,.5,.75,1]});
  videos.forEach(video=>videoObserver.observe(video));
  new IntersectionObserver(entries=>{
    inView=entries[0].isIntersecting;
    scene.dataset.inView=String(inView);
    if(pinned)paint();
    syncMedia();
  },{rootMargin:'-12% 0px -20% 0px'}).observe(scene);
  const preload=new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting)return;
    if(!reduced.matches)videos.forEach(video=>{
      video.preload='auto';
      if(video.readyState===0&&video.paused)video.load();
    });
    preload.disconnect();
  },{rootMargin:'400px 0px'});
  preload.observe(scene);

  function setCardStyle(index,property,value){
    if(cardStyles[index][property]===value)return;
    cardStyles[index][property]=value;
    cards[index].style[property]=value;
  }
  function paint(){
    frame=0;
    if(!pinned)return;
    const progress=clamp((scrollY-start)/distance),position=progress*2.65;
    const next=Math.min(2,Math.floor(position+.12));
    cards.forEach((card,i)=>{
      const enter=i===0?1:ease((position-i+.65)/.65);
      const leave=i===2?0:ease((position-i-.55)/.45);
      const older=i===0?ease((position-1.55)/.45):0;
      const x=(1-enter)*(cardWidth+edgeShift+48)+leave*(edgeShift+older*18);
      const y=leave*(i===0?-12:16)-older*6;
      const angle=enter*(i===1?-3: i===2?2:0)+leave*(i===0?6:7)-older*3;
      const scale=1-leave*.018-older*.012;
      setCardStyle(i,'transform',`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`);
      // Once a card has arrived it stays opaque underneath the next one.
      setCardStyle(i,'opacity',String(i===0?1:clamp(enter*3)));
      setCardStyle(i,'visibility',enter>0?'visible':'hidden');
      const current=i===next&&inView;
      if(chapters[i].classList.contains('is-current')!==current)chapters[i].classList.toggle('is-current',current);
      const hidden=String(i!==next);
      if(chapters[i].getAttribute('aria-hidden')!==hidden)chapters[i].setAttribute('aria-hidden',hidden);
    });
    if(next!==active){
      active=next;
      tabs.forEach((tab,i)=>i===active?tab.setAttribute('aria-current','step'):tab.removeAttribute('aria-current'));
      syncMedia();
    }
    scene.dataset.progress=progress.toFixed(3);
    scene.dataset.active=String(active);
    if(!inView)syncMedia();
  }
  function schedule(){if(pinned&&inView&&!frame)frame=requestAnimationFrame(paint);}
  function measure(){
    pinned=!reduced.matches&&!shortScreen.matches&&CSS.supports('position','sticky');
    scene.dataset.pinned=String(pinned);
    chapters.forEach((chapter,i)=>{
      cards[i].style.zIndex=String(i+1);
    });
    if(!pinned){
      cancelAnimationFrame(frame);frame=0;active=-1;
      delete scene.dataset.progress;delete scene.dataset.active;
      tabs.forEach(tab=>tab.removeAttribute('aria-current'));
      chapters.forEach((chapter,i)=>{
        chapter.classList.remove('is-current');chapter.removeAttribute('aria-hidden');
        ['transform','opacity','visibility'].forEach(property=>cards[i].style.removeProperty(property));
        cardStyles[i]={};
      });
      prepareMediaEntries();syncMedia();return;
    }
    const top=parseFloat(getComputedStyle(stage).top)||0;
    start=scene.getBoundingClientRect().top+scrollY-top;
    distance=Math.max(1,scene.offsetHeight-stage.offsetHeight);
    const slot=chapters[0].querySelector('.story-media-slot');
    // Layout offsets ignore the temporary mobile entrance transform.
    cardWidth=slot.offsetWidth;
    const slotRight=stage.getBoundingClientRect().left+slot.offsetLeft+cardWidth;
    edgeShift=Math.max(18,innerWidth-slotRight-8);
    paint();prepareMediaEntries();syncMedia();
  }
  tabs.forEach((tab,i)=>tab.addEventListener('click',event=>{
    if(!pinned)return;
    const top=start+distance*(i/2.65);
    const immediate=event.detail===0||reduced.matches;
    if(window.TeditsScroll)window.TeditsScroll.scrollTo(top,{immediate});
    else window.scrollTo({top,behavior:immediate?'instant':'smooth'});
  }));
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure,{passive:true});
  addEventListener('pageshow',measure);
  document.addEventListener('visibilitychange',syncMedia);
  reduced.addEventListener('change',()=>{
    reduceOverride=false;
    if(reduced.matches)mediaEntrances.forEach(animation=>animation.cancel());
    measure();
  });
  shortScreen.addEventListener('change',measure);
  mobile.addEventListener('change',measure);
  document.fonts.ready.then(measure);
  if('ResizeObserver'in window){
    const observer=new ResizeObserver(measure);
    ['.cloud-scene','.story-intro'].forEach(selector=>{const element=document.querySelector(selector);if(element)observer.observe(element);});
  }
  measure();

  // Keep the existing opportunity rotation and its pause control.
  const target=document.getElementById('business-rotation'),pause=document.getElementById('rotation-pause');
  if(target&&pause){
    const examples=target.dataset.examples.split('|'),current=document.createElement('span');
    current.className='business-current';current.textContent=examples[0];
    target.replaceChildren(current,...examples.map(text=>{
      const copy=document.createElement('span');copy.className='business-size';copy.textContent=text;copy.setAttribute('aria-hidden','true');return copy;
    }));
    let rotation=0,swap=0,index=0,visible=false,paused=false;
    function timer(){
      clearInterval(rotation);clearTimeout(swap);target.classList.remove('is-changing');
      if(reduced.matches||paused||!visible||document.hidden)return;
      rotation=setInterval(()=>{
        target.classList.add('is-changing');
        swap=setTimeout(()=>{index=(index+1)%examples.length;current.textContent=examples[index];target.classList.remove('is-changing');},180);
      },3200);
    }
    pause.hidden=reduced.matches;
    pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume rotating text':'Pause rotating text';timer();});
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;timer();}).observe(target);
    document.addEventListener('visibilitychange',timer);
    reduced.addEventListener('change',()=>{pause.hidden=reduced.matches;timer();});
  }
  // Prepare offscreen content before it enters. Starting from visible content in
  // an intersection callback caused a visible -> transparent -> visible flash.
  const animations=new Set();
  function animate(element,keyframes,options){
    const animation=element.animate(keyframes,options);animations.add(animation);
    animation.finished.finally(()=>animations.delete(animation)).catch(()=>{});
  }
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const chapter=entry.target.classList.contains('story-chapter');
    if(chapter&&pinned)return;
    reveal.unobserve(entry.target);
    if(reduced.matches||entry.target.dataset.storyEntry!=='ready')return;
    entry.target.dataset.storyEntry='done';
    if(chapter){
      entry.target.querySelectorAll('.story-word').forEach((word,i)=>animate(word,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:480,delay:i*65,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
    }
  }),{threshold:0,rootMargin:'0px 0px -24px 0px'});
  [...document.querySelectorAll('.story-reveal'),...chapters].forEach(element=>{
    // Deep links/restored positions and initially visible content stay readable.
    if(!reduced.matches&&element.getBoundingClientRect().top>=innerHeight){element.dataset.storyEntry='ready';reveal.observe(element);}
  });
  document.addEventListener('focusin',event=>{
    const pending=event.target.closest('[data-story-entry=ready]');
    if(pending){reveal.unobserve(pending);delete pending.dataset.storyEntry;}
  });
  reduced.addEventListener('change',()=>{
    if(!reduced.matches)return;
    animations.forEach(animation=>animation.cancel());
    document.querySelectorAll('[data-story-entry]').forEach(element=>delete element.dataset.storyEntry);
    reveal.disconnect();
  });
})();
