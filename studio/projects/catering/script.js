const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches&&'IntersectionObserver' in window){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.1});document.querySelectorAll('.reveal').forEach(element=>observer.observe(element))}
const navToggle=document.querySelector('.nav-toggle');
navToggle.addEventListener('click',()=>{const open=navToggle.getAttribute('aria-expanded')!=='true';navToggle.setAttribute('aria-expanded',String(open));navToggle.querySelector('span').textContent=open?'−':'+';document.getElementById('main-nav').classList.toggle('nav-open',open)});
document.querySelectorAll('#main-nav a').forEach(link=>link.addEventListener('click',()=>{navToggle.setAttribute('aria-expanded','false');navToggle.querySelector('span').textContent='+';document.getElementById('main-nav').classList.remove('nav-open')}));
const menus={
feast:{eyebrow:'GATHER ROUND. PASS IT ALONG.',title:'A feast worth',accent:'sharing.',image:'assets/seasonal-meals.jpg',alt:'A seasonal salad with fresh vegetables, feta and grains',occasion:'Weddings & celebrations',dishes:[['Citrus & herb roast chicken','Golden, fragrant and made for the centre of the table.'],['Roasted seasonal vegetables','Colourful vegetables, finished with herbs and olive oil.'],['Garden greens & grain salad','A bright, fresh balance to a generous spread.'],['Lemon & berry dessert pots','A little sweetness to end the occasion.']]},
brunch:{eyebrow:'MAKE A MORNING OF IT.',title:'A slower start.',accent:'A lovely spread.',image:'assets/brunch.jpg',alt:'Coffee, eggs, berries, cheese and other breakfast dishes on a wooden table',occasion:'Breakfast & brunch',dishes:[['Butter pastries & morning bakes','A warm welcome to the table.'],['Soft eggs & herb-roasted tomatoes','A savoury favourite for leisurely mornings.'],['Seasonal fruit & yoghurt bowls','Bright fruit, creamy yoghurt and a little crunch.'],['Coffee, tea & citrus juice','Something to sip while the conversation flows.']]},
week:{eyebrow:'A LITTLE CARE FOR THE WEEK AHEAD.',title:'Good meals.',accent:'Less effort.',image:'assets/salad.jpg',alt:'A colourful mixed salad with leafy greens, vegetables and fruit',occasion:'Weekly meal prep',dishes:[['Lemon chicken & herbed grains','A satisfying lunch with roasted vegetables.'],['Roasted vegetable & chickpea bowl','A colourful plant-based option with tahini dressing.'],['Slow-cooked tomato & lentil stew','Comforting, generous and easy to warm through.'],['Seasonal greens & citrus salad','A bright addition to your lunchtime routine.']]}
};
const tabs=Array.from(document.querySelectorAll('[data-menu]'));
function selectMenu(tab){const menu=menus[tab.dataset.menu];tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1});document.getElementById('menu-panel').setAttribute('aria-labelledby',tab.id);document.getElementById('menu-eyebrow').textContent=menu.eyebrow;const title=document.getElementById('menu-title');title.replaceChildren(document.createTextNode(menu.title),document.createElement('br'));const accent=document.createElement('em');accent.textContent=menu.accent;title.append(accent);const image=document.getElementById('menu-image');image.src=menu.image;image.alt=menu.alt;document.getElementById('menu-dishes').replaceChildren(...menu.dishes.map(([name,description])=>{const item=document.createElement('li'),heading=document.createElement('b'),body=document.createElement('span');heading.textContent=name;body.textContent=description;item.append(heading,body);return item}));document.getElementById('menu-enquiry').dataset.enquiry=menu.occasion;if(!reducedMotion.matches&&typeof image.animate==='function')image.animate([{opacity:.4},{opacity:1}],{duration:350,easing:'ease-out'})}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectMenu(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();selectMenu(tabs[next]);tabs[next].focus()})});
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
