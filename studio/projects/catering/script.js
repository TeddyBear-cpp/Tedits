const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches&&'IntersectionObserver' in window){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.1});document.querySelectorAll('.reveal').forEach(element=>observer.observe(element))}
const navToggle=document.querySelector('.nav-toggle');document.querySelectorAll('[data-photo-stack]').forEach(stack=>{  const button=stack.querySelector('.photo-stack-button');  const images=Array.from(stack.querySelectorAll('.photo-stack-image'));  const status=document.createElement('span');  let current=images.findIndex(image=>image.classList.contains('is-current'));  let advancing=false;  let queued=0;  button.setAttribute('aria-label',`Show the ${images[(current+1)%images.length].dataset.day} meal photo`);  status.className='photo-stack-status';  status.setAttribute('aria-live','polite');  button.append(status);  button.addEventListener('click',()=>{    if(images.length<2)return;    if(advancing){queued=Math.min(queued+1,4);return}    advancing=true;    const next=(current+1)%images.length;    const outgoing=images[current],incoming=images[next];    incoming.classList.add('is-next');    stack.classList.add('is-advancing');    button.setAttribute('aria-label',`Showing photo ${next+1} of ${images.length}. Show another ${stack.dataset.photoLabel} photo`);    status.textContent=`Photo ${next+1} of ${images.length}`;    window.setTimeout(()=>{      outgoing.classList.remove('is-current');      incoming.classList.remove('is-next');      incoming.classList.add('is-current');      stack.classList.remove('is-advancing');      current=next;      const dayBadge=stack.querySelector('[data-weekday]');      if(dayBadge)dayBadge.textContent=incoming.dataset.day;      advancing=false;      button.setAttribute('aria-label',`Show the ${images[(current+1)%images.length].dataset.day} meal photo`);      if(queued){queued--;button.click()}    },reducedMotion.matches?0:560);  });});
navToggle.addEventListener('click',()=>{const open=navToggle.getAttribute('aria-expanded')!=='true';navToggle.setAttribute('aria-expanded',String(open));navToggle.querySelector('span').textContent=open?'−':'+';document.getElementById('main-nav').classList.toggle('nav-open',open)});
document.querySelectorAll('#main-nav a').forEach(link=>link.addEventListener('click',()=>{navToggle.setAttribute('aria-expanded','false');navToggle.querySelector('span').textContent='+';document.getElementById('main-nav').classList.remove('nav-open')}));
const menus={  feast:{id:'feast',eyebrow:'GATHER ROUND. PASS IT ALONG.',title:'A feast worth',accent:'sharing.',image:'assets/menu-feast.jpg',alt:'A buffet spread of fresh salads, vegetables, and garnishes',occasion:'Weddings & celebrations',dishes:[['Fresh garden salads','A generous selection of greens and seasonal vegetables.'],['Colourful vegetable sides','Bright, fresh accompaniments arranged for sharing.'],['Herbs, citrus & dressings','Finishing touches to bring each bowl together.'],['A relaxed buffet table','Choose a little of everything and pass it along.']]},  brunch:{id:'brunch',eyebrow:'MAKE A MORNING OF IT.',title:'A slower start.',accent:'A lovely spread.',image:'assets/menu-brunch.jpg',alt:'Pancakes with fresh berries and a sparkling rose drink',occasion:'Breakfast & brunch',dishes:[['Golden breakfast pancakes','Soft pancakes served with a light dusting of sugar.'],['Blueberries & raspberries','Fresh berries with a bright citrus sauce.'],['A little butter on the side','A simple finishing touch for a warm stack.'],['A sparkling rose drink','A celebratory sip alongside brunch.']]},  week:{id:'week',eyebrow:'A LITTLE CARE FOR THE WEEK AHEAD.',title:'Good meals.',accent:'Less effort.',image:'assets/menu-everyday.jpg',alt:'Prepared portions of pasta, rice, potatoes, vegetables, and salad',occasion:'Weekly meal prep',dishes:[['Pasta with herbs','A ready-to-heat portion of pasta with a light herb dressing.'],['Rice & roasted potatoes','Comforting staples portioned for the week.'],['Fresh vegetable sticks & salad','Crunchy vegetables with a creamy side dip.'],['A little of everything','Balanced portions packed for easy weekday meals.']]}};const tabs=Array.from(document.querySelectorAll('[data-menu]'));const menuItems=Object.values(menus);const menuCopy=document.querySelector('.menu-copy');const menuPhoto=document.getElementById('menu-photo');const menuPhotoButton=document.getElementById('menu-photo-button');let activeMenu='feast';let menuBusy=false;let queuedMenu=null;menuItems.forEach(menu=>{const preload=new Image();preload.src=menu.image});function renderMenu(menu){  activeMenu=menu.id;  const tab=tabs.find(item=>item.dataset.menu===menu.id);  tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1});  document.getElementById('menu-panel').setAttribute('aria-labelledby',tab.id);  document.getElementById('menu-eyebrow').textContent=menu.eyebrow;  const title=document.getElementById('menu-title');  title.replaceChildren(document.createTextNode(menu.title));  if(menu.accent){title.append(document.createElement('br'));const accent=document.createElement('em');accent.textContent=menu.accent;title.append(accent)}  const image=document.getElementById('menu-image');  image.src=menu.image;  image.alt=menu.alt;  document.getElementById('menu-dishes').replaceChildren(...menu.dishes.map(([name,description])=>{const item=document.createElement('li'),heading=document.createElement('b'),body=document.createElement('span');heading.textContent=name;body.textContent=description;item.append(heading,body);return item}));  document.getElementById('menu-enquiry').dataset.enquiry=menu.occasion;  const next=menuItems[(menuItems.findIndex(item=>item.id===menu.id)+1)%menuItems.length];  menuPhotoButton.setAttribute('aria-label',`Show the ${next.id==='week'?'everyday meals':next.id} menu photo`);}function transitionMenu(target){  const menu=typeof target==='string'?menus[target]:target;  if(!menu||menu.id===activeMenu&&!menuBusy)return;  if(menuBusy){queuedMenu=menu.id;return}  menuBusy=true;  const animatedItems=()=>[...menuCopy.querySelectorAll('.eyebrow,h3,li,.service-action')];  animatedItems().forEach((item,index)=>item.style.setProperty('--copy-delay',`${index*45}ms`));  menuCopy.classList.add('is-leaving');  menuPhoto.classList.add('is-changing');  window.setTimeout(()=>{    renderMenu(menu);    animatedItems().forEach((item,index)=>item.style.setProperty('--copy-delay',`${index*45}ms`));    menuCopy.classList.remove('is-leaving');    menuCopy.classList.add('is-entering');    window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>menuCopy.classList.remove('is-entering')));    menuPhoto.classList.remove('is-changing');    window.setTimeout(()=>{      menuBusy=false;      if(queuedMenu){const next=queuedMenu;queuedMenu=null;transitionMenu(next)}    },reducedMotion.matches?0:520);  },reducedMotion.matches?0:560);}tabs.forEach((tab,index)=>{  tab.addEventListener('click',()=>transitionMenu(tab.dataset.menu));  tab.addEventListener('keydown',event=>{    let next;    if(event.key==='ArrowRight')next=(index+1)%tabs.length;    else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;    else if(event.key==='Home')next=0;    else if(event.key==='End')next=tabs.length-1;    else return;    event.preventDefault();    transitionMenu(tabs[next].dataset.menu);    tabs[next].focus();  });});menuPhotoButton.addEventListener('click',()=>{  const base=queuedMenu?menuItems.findIndex(item=>item.id===queuedMenu):menuItems.findIndex(item=>item.id===activeMenu);  transitionMenu(menuItems[(base+1)%menuItems.length]);});
const enquiryDialog=document.getElementById('enquiry-dialog'),enquiryForm=document.getElementById('enquiry-form'),result=document.getElementById('enquiry-result'),occasion=document.getElementById('occasion'),serving=document.getElementById('serving-style');
function updateOccasion(){const mealPrep=occasion.value==='Weekly meal prep';document.getElementById('guests-label').textContent=mealPrep?'How many people are you planning for?':'How many guests?';if(mealPrep)serving.value='Individual portions'}
occasion.addEventListener('change',updateOccasion);
document.querySelectorAll('[data-enquiry]').forEach(button=>button.addEventListener('click',()=>{occasion.value=button.dataset.enquiry;updateOccasion();enquiryForm.hidden=false;result.hidden=true;enquiryDialog.showModal()}));
enquiryForm.addEventListener('submit',event=>{event.preventDefault();const count=Number(document.getElementById('guests').value);const preferences=Array.from(enquiryForm.querySelectorAll('input[name="preferences"]:checked')).map(input=>input.value.toLowerCase());document.getElementById('plan-summary').textContent=`${occasion.value} for ${count} ${count===1?'person':'people'}, served as ${serving.value.toLowerCase()}${preferences.length?', with '+preferences.join(' and '):''}.`;const details=document.getElementById('enquiry-details').value.trim();const detailsPreview=document.getElementById('plan-details');detailsPreview.textContent=details;detailsPreview.hidden=!details;enquiryForm.hidden=true;result.hidden=false;document.getElementById('edit-plan').focus()});
document.getElementById('edit-plan').addEventListener('click',()=>{result.hidden=true;enquiryForm.hidden=false;occasion.focus()});
document.getElementById('credits-button').addEventListener('click',()=>document.getElementById('credits-dialog').showModal());
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}});new MutationObserver(()=>{document.body.classList.toggle('dialog-open',Array.from(document.querySelectorAll('dialog')).some(item=>item.open))}).observe(dialog,{attributes:true,attributeFilter:['open']})});

// Replace these empty strings with the business's real links when adapting the concept.
const socialLinks = { instagram: '', whatsapp: '' };
const contactToggle = document.getElementById('contact-toggle');
const contactPanel = document.getElementById('contact-panel');
const contactWidget = document.getElementById('contact-widget');
function setContactOpen(open, restoreFocus = false) {
  contactToggle.setAttribute('aria-expanded', String(open));
  contactToggle.setAttribute('aria-label', open ? 'Close contact options' : 'Open contact options');
  contactPanel.hidden = !open;
  if (restoreFocus) contactToggle.focus();
}
contactToggle.addEventListener('click', () => setContactOpen(contactPanel.hidden));
contactWidget.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !contactPanel.hidden) { event.preventDefault(); setContactOpen(false, true); }
});
document.addEventListener('click', event => {
  if (!contactWidget.contains(event.target)) setContactOpen(false);
});
contactPanel.querySelector('[data-enquiry]').addEventListener('click', () => setContactOpen(false));
const socialDialog = document.getElementById('social-dialog');
document.querySelectorAll('[data-social]').forEach(button => button.addEventListener('click', () => {
  setContactOpen(false);
  const platform = button.dataset.social;
  if (socialLinks[platform]) { window.open(socialLinks[platform], '_blank', 'noopener,noreferrer'); return; }
  document.getElementById('social-title').textContent = platform === 'instagram' ? 'A little inspiration.' : 'A conversation starts here.';
  document.getElementById('social-description').textContent = platform === 'instagram'
    ? 'This Instagram button is part of the fictional website preview. A live version would open the catering business’s Instagram profile.'
    : 'This WhatsApp button is part of the fictional website preview. A live version would open a chat with the catering team. You can try the enquiry form here instead.';
  socialDialog.showModal();
}));
document.getElementById('social-enquiry').addEventListener('click', () => {
  socialDialog.close();
  enquiryForm.hidden = false;
  result.hidden = true;
  enquiryDialog.showModal();
});

// Land section links on the content people came to see, rather than its padding.
function sectionScrollTop(section, hash) {
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  if (hash === '#') return 0;
  const focalSelector = {
    '#menus': '.menu-photo',
    '#meal-prep': '.meal-photo'
  }[hash];
  const focal = focalSelector ? section.querySelector(focalSelector) : null;
  if (focal) {
    // Layout offsets ignore the temporary translateY used by scroll reveals.
    let focalTop = 0;
    for (let node = focal; node; node = node.offsetParent) focalTop += node.offsetTop;
    return Math.max(0, Math.min(maxScroll,
      focalTop + focal.offsetHeight / 2 - window.innerHeight / 2));
  }
  // Short sections fit in view; tall sections start at their heading.
  const rect = section.getBoundingClientRect();
  const sectionTop = window.scrollY + rect.top;
  if (rect.height <= window.innerHeight - 64) {
    return Math.max(0, Math.min(maxScroll, sectionTop + rect.height / 2 - window.innerHeight / 2));
  }
  const heading = section.querySelector('.section-heading, h2, h1');
  const top = heading ? window.scrollY + heading.getBoundingClientRect().top : sectionTop;
  return Math.max(0, Math.min(maxScroll, top - 32));
}
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    const section = hash === '#' ? document.body : document.getElementById(hash.slice(1));
    if (!section) return;
    event.preventDefault();
    // Existing mobile-nav handlers close the menu before measuring the target.
    const top = sectionScrollTop(section, hash);
    if (hash !== '#') {
      const target = section.querySelector('h2, h1') || section;
      const hadTabindex = target.hasAttribute('tabindex');
      if (!hadTabindex) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      target.focus({ preventScroll: true });
    }
    // Keep anchor URLs useful without triggering another native anchor jump.
    try { if (window.location.hash !== hash) window.history.pushState(null, '', hash); } catch (_) {}
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
});
