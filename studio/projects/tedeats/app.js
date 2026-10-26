(() => {
  'use strict';
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
  const choices = {
    celebration:{title:'Just your people.',description:'Birthdays, milestones and just-because evenings. A setting that feels like you, a considered guest experience and a day you can enjoy.',includes:'Planning, styling, supplier coordination and event-day hosting.',image:'dinner-alt-3.jpg',alt:'Friends raising glasses in a toast',caption:'A celebration with your people at its heart.',action:'Plan a celebration'},
    wedding:{title:'A day that feels like you.',description:'From the first arrival to the last dance. Your people, a setting you love and a celebration shaped around the way you want to spend your day.',includes:'Venue coordination, ceremony timing, tables, flowers and reception hosting.',image:'garden-celebration-stock.jpg',alt:'Guests seated for an outdoor garden ceremony',caption:'Every place set. Every person considered.',action:'Plan a wedding'},
    launch:{title:'Make a good entrance.',description:'A new product, a new space or a fresh beginning. We turn your brand story into an occasion people can step into and experience.',includes:'Creative planning, venue styling, guest arrivals and launch-day coordination.',image:'launch-gathering-stock.jpg',alt:'Guests talking beneath warm lights at a reception',caption:'Give a new beginning the room it deserves.',action:'Plan a launch'},
    corporate:{title:'Away from the everyday.',description:'Team dinners, company milestones and gatherings with a purpose. The right balance of a clear agenda, good hosting and time to connect.',includes:'Guest logistics, supplier management, room planning and on-site hosting.',image:'reception-stock.jpg',alt:'Guests meeting at a bright indoor event',caption:'A chance to connect beyond the everyday.',action:'Plan a company event'}
  };
  const menu=document.querySelector('.menu-toggle');
  const navigation=document.querySelector('#navigation');
  const closeMenu=()=>{menu.setAttribute('aria-expanded','false');menu.textContent='Menu';navigation.classList.remove('is-open');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu';navigation.classList.toggle('is-open',open);});
  navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  const image=document.querySelector('#occasion-image');
  const select=document.querySelector('#brief-occasion');
  document.querySelectorAll('[name="occasion-preview"]').forEach(input=>input.addEventListener('change',()=>{
    const choice=choices[input.value];
    if(!choice)return;
    image.src=`assets/${choice.image}`;image.alt=choice.alt;
    document.querySelector('#occasion-caption').textContent=choice.caption;
    document.querySelector('#occasion-name').textContent=choice.title;
    document.querySelector('#occasion-description').textContent=choice.description;
    document.querySelector('#occasion-includes').textContent=choice.includes;
    const cta=document.querySelector('#occasion-cta');
    cta.textContent=choice.action;cta.insertAdjacentHTML('beforeend',arrow);
    select.value=input.value;
  }));
  const form=document.querySelector('#event-form');
  const date=form.elements.date;
  const today=new Date();
  date.min=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const dialog=document.querySelector('#brief-dialog');
  const details=document.querySelector('#brief-details');
  let brief='';let opener;
  const close=()=>dialog.close();
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const fields=new FormData(form);
    const dateValue=fields.get('date');
    const readableDate=dateValue?new Date(`${dateValue}T12:00:00`).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'}):'A date to decide';
    const rows=[['Name',fields.get('name').trim()],['Email',fields.get('email').trim()],['Occasion',select.selectedOptions[0].textContent],['When',readableDate],['Guests',fields.get('guests')||'To be decided'],['Where',fields.get('location').trim()||'A setting to find'],['Budget',fields.get('budget')]];
    details.replaceChildren();
    for(const [label,value] of rows){const div=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;div.append(dt,dd);details.append(div);}
    const idea=fields.get('idea').trim();
    document.querySelector('#brief-idea').textContent=idea?`Your idea\n${idea}`:'';
    brief=`TEDEATS EVENTS — DRAFT EVENT BRIEF\n\n${rows.map(([label,value])=>`${label}: ${value}`).join('\n')}\n\n${idea?`Your idea:\n${idea}\n\n`:''}Fictional portfolio concept by Tedits Studio. Nothing has been sent or booked.`;
    opener=document.activeElement;
    dialog.showModal();
  });
  dialog.querySelector('.dialog-close').addEventListener('click',close);
  document.querySelector('#edit-brief').addEventListener('click',close);
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();});
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  document.querySelector('#download-brief').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([brief],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='tedeats-event-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  // Without JavaScript the form stays disabled instead of submitting a native GET.
  document.querySelector('#event-fields').disabled=false;
})();
