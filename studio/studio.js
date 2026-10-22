const studioPalettes = [
  {name:'INK WASH',category:'TEDITS STUDIO / WEB DESIGN',colors:['#4A4A4A','#CBCBCB','#FFFFE3','#6D8196'],caption:'A quiet balance of charcoal, cool gray, soft ivory, and slate blue. Your website’s palette will be chosen for your brand’s own character.'},
  {name:'OLIVE & EMBER',category:'CATERING & EVENTS / CONCEPT',colors:['#233D31','#F7F4EC','#A58E51','#657064'],caption:'Forest green, cream, and muted gold create a warm, editorial setting for food and celebrations.'},
  {name:'RIVET & BEAM',category:'STEEL & FABRICATION / CONCEPT',colors:['#14212A','#F4F1EA','#D49B45','#637078'],caption:'Deep navy and warm amber bring a practical industrial character to the material catalogue and enquiry flow.'},
  {name:'AFTERHOURS',category:'MUSIC STUDIO / CONCEPT',colors:['#191A18','#EAE6DB','#E5A34C','#AAA99F'],caption:'Warm ink, aged ivory, and amber echo a record sleeve and the atmosphere of a late-night listening session.'},
  {name:'LITTLE JOY PLAY CO.',category:'FAMILY CELEBRATIONS / CONCEPT',colors:['#FFF9F0','#40352F','#F8E6A0','#C8D8C0'],caption:'Cream, cocoa, butter and sage make a gentle setting for little celebrations, with clear packages and a thoughtful booking journey.'},
  {name:'TEDITS / VIDEO & MOTION',category:'INDEPENDENT VIDEO-EDITING WEBSITE',colors:['#101210','#191D19','#F3F1E9','#86AD91'],caption:'Charcoal, soft ivory, and muted green give the separate video-editing site a quiet, cinematic feel.'}
];
let palettePosition = 0;
const paletteRegion = document.querySelector('.palette-study');
const paletteSwatches = document.getElementById('palette-swatches');
const paletteAnnouncement = document.getElementById('palette-announcement');
function showPalette(position) {
  palettePosition = (position + studioPalettes.length) % studioPalettes.length;
  const palette = studioPalettes[palettePosition];
  document.getElementById('palette-name').textContent = palette.name;
  document.getElementById('palette-index').textContent = `${String(palettePosition + 1).padStart(2,'0')} / ${String(studioPalettes.length).padStart(2,'0')}`;
  document.getElementById('palette-category').textContent = palette.category;
  document.getElementById('palette-caption').textContent = palette.caption;
  paletteSwatches.setAttribute('aria-label',`${palette.name} colour palette`);
  paletteSwatches.replaceChildren(...palette.colors.map((color,index) => {
    const swatch = document.createElement('div');swatch.className='swatch';swatch.style.backgroundColor=color;
    const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');
    const hex=document.createElement('b');hex.textContent=color;
    swatch.append(number,hex);return swatch;
  }));
  paletteAnnouncement.textContent = `${palette.name}, palette ${palettePosition+1} of ${studioPalettes.length}.`;
  if (!studioMotionPreference.matches) {
    [...paletteSwatches.children].forEach((swatch,index)=>playStudioMotion(swatch,
      [{opacity:.35,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:360,delay:index*45,fill:'backwards'}));
  }
}
document.getElementById('palette-previous').addEventListener('click',()=>showPalette(palettePosition-1));
document.getElementById('palette-next').addEventListener('click',()=>showPalette(palettePosition+1));
paletteRegion.addEventListener('keydown',event=>{
  const actions={ArrowLeft:()=>showPalette(palettePosition-1),ArrowRight:()=>showPalette(palettePosition+1),Home:()=>showPalette(0),End:()=>showPalette(studioPalettes.length-1)};
  if(actions[event.key]){event.preventDefault();actions[event.key]();}
});

// Short, one-time entrances keep the page readable before JavaScript runs.
// Animate only when a section enters view; reduced motion cancels running effects.
const studioMotionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const studioAnimations=new Set();
function playStudioMotion(element,keyframes,options={}) {
  if(studioMotionPreference.matches||!element.animate)return;
  const animation=element.animate(keyframes,{duration:650,easing:'cubic-bezier(.2,.7,.2,1)',...options});
  studioAnimations.add(animation);
  animation.finished.then(()=>studioAnimations.delete(animation),()=>studioAnimations.delete(animation));
  return animation;
}
function entrance(element,delay=0) {
  playStudioMotion(element,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{delay,fill:'backwards'});
}
document.querySelectorAll('.hero-meta,h1,.hero-bottom').forEach((element,index)=>entrance(element,index*100));
playStudioMotion(document.querySelector('.hero-rule'),[{transform:'scaleX(0)',opacity:0},{transform:'scaleX(1)',opacity:1}],{duration:900,delay:200});
let studioEntranceObserver;
if('IntersectionObserver' in window&&!studioMotionPreference.matches) {
  const reveals=new Map();
  const observer=studioEntranceObserver=new IntersectionObserver(entries=>{
    const ready=[];
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      observer.unobserve(entry.target);
      const children=reveals.get(entry.target)||[];
      reveals.delete(entry.target);
      children.forEach(({element,delay})=>{
        // Stacked groups can enter while their lower children are still offscreen.
        if(element!==entry.target&&element.getBoundingClientRect().top>=(entry.rootBounds?.bottom??innerHeight)) {
          reveals.set(element,[{element,delay}]);
          observer.observe(element);
        } else ready.push({element,delay});
      });
    });
    // Finish geometry reads before starting effects. Remove the pending state only
    // after the animation owns opacity, so visible content never flashes back to zero.
    ready.forEach(({element,delay})=>{
      entrance(element,delay);
      element.classList.remove('studio-reveal-pending');
    });
  },{threshold:.12});
  document.querySelectorAll('.section-heading,.project,.approach-grid>div,.service-list article,.about-grid,.contact h2,.contact-bottom').forEach(target=>{
    const children=target.matches('.project,.about-grid,.contact-bottom')?[...target.children]:[target];
    reveals.set(target,children.map((element,index)=>({element,delay:index*90})));
    children.forEach(element=>element.classList.add('studio-reveal-pending'));
    observer.observe(target);
  });
}
studioMotionPreference.addEventListener('change',event=>{
  if(event.matches) {
    studioEntranceObserver?.disconnect();
    document.querySelectorAll('.studio-reveal-pending').forEach(element=>element.classList.remove('studio-reveal-pending'));
    studioAnimations.forEach(animation=>animation.cancel());
  }
});

