/* Three stages; the ordinary HTML form is the no-script fallback. */
(() => {
  'use strict';
  const form=document.getElementById('quote-form'); if(!form)return;
  const card=form.closest('.enquiry-form-wrap'), steps=[...form.querySelectorAll('[data-enquiry-step]')], progress=[...form.querySelectorAll('.enquiry-progress li')];
  const field=id=>document.getElementById(id), count=field('quote-progress-text'), next=field('quote-next'), back=field('quote-back'), submit=field('quote-submit'), status=field('quote-status'), success=field('quote-success');
  const website=field('quote-website'), websiteField=field('existing-site-field'), needs=[...form.querySelectorAll('[name=needs]')], reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const titles=['Your project','Project details','Contact details'];
  let current=0, sending=false, sent=false, transition=null;
  const selectedNeed=()=>needs.find(input=>input.checked)?.value||'';
  function error(inputs,id,invalid){
    field(id).hidden=!invalid;
    for(const input of [].concat(inputs)) invalid?input.setAttribute('aria-invalid','true'):input.removeAttribute('aria-invalid');
    return !invalid;
  }
  function validate(index,focus=true){
    let valid=true;
    if(index===0)valid=error(needs,'needs-error',!selectedNeed());
    if(index===1)valid=error(field('quote-details'),'details-error',!field('quote-details').value.trim());
    if(index===2){const nameOK=error(field('quote-name'),'name-error',!field('quote-name').value.trim());const emailOK=error(field('quote-email'),'email-error',!field('quote-email').validity.valid);valid=nameOK&&emailOK;}
    if(!valid&&focus)steps[index].querySelector('[aria-invalid=true]')?.focus();
    return valid;
  }
  function syncWebsite(){const refresh=selectedNeed()==='Website refresh';websiteField.hidden=!refresh;website.disabled=!refresh;}
  function review(){
    const business=field('quote-business').value.trim();field('review-project').textContent=selectedNeed()+(business?` for ${business}`:'');
    const text=[field('quote-details').value.trim()];
    if(!website.disabled&&website.value.trim())text.push(`Current website: ${website.value.trim()}`);
    text.push(`Timing: ${field('quote-timeline').value||'Flexible / not sure'}`);field('review-details').textContent=text.join('\n\n');
  }
  function locate(){
    const bounds=card.getBoundingClientRect();
    const clearance=innerWidth<=760?76:84;
    if(bounds.top<clearance||bounds.top>innerHeight*.3){const top=bounds.top+scrollY-clearance;if(window.TeditsScroll)window.TeditsScroll.scrollTo(top,{immediate:true});else window.scrollTo({top,behavior:'instant'});}
  }
  function show(index,{focus=true,animate=true,historyMode='push'}={}){
    if(sending||sent)return;
    index=Math.max(0,Math.min(2,index));const previous=current;current=index;transition?.cancel();
    steps.forEach((step,i)=>{step.hidden=i!==index;});
    progress.forEach((item,i)=>{if(i===index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');item.dataset.complete=String(i<index);});
    count.hidden=false;count.textContent=`Step ${index+1} of 3`;steps[index].querySelector('h2').setAttribute('aria-describedby',count.id);
    next.hidden=index===2;back.hidden=index===0;submit.hidden=index!==2;field('quote-review').hidden=index!==2;
    document.title=`Step ${index+1} of 3: ${titles[index]} — Tedits Studio`;
    syncWebsite();if(index===2)review();
    if(historyMode!=='none'){const state={...history.state,teditsEnquiryStep:index};if(historyMode==='replace')history.replaceState(state,'');else history.pushState(state,'',`#enquiry-${index+1}`);}
    if(focus){locate();steps[index].querySelector('h2').focus({preventScroll:true});}
    if(animate&&!reduced.matches&&steps[index].animate)transition=steps[index].animate([{opacity:0,transform:`translateX(${index>=previous?14:-10}px)`},{opacity:1,transform:'translateX(0)'}],{duration:240,easing:'cubic-bezier(.22,1,.36,1)'});
    window.TeditsScroll?.instance?.resize();
  }
  function navigate(index,event){
    if(index>current){for(let i=0;i<index;i++){if(!validate(i,false)){if(i!==current)show(i,{animate:false});validate(i);return;}}}
    show(index,{animate:event?.detail!==0});
  }
  next.addEventListener('click',event=>navigate(current+1,event));back.addEventListener('click',event=>navigate(current-1,event));
  form.querySelectorAll('[data-edit-step]').forEach(button=>button.addEventListener('click',event=>navigate(Number(button.dataset.editStep),event)));
  needs.forEach(input=>input.addEventListener('change',()=>{error(needs,'needs-error',false);syncWebsite();}));
  for(const id of ['quote-details','quote-name','quote-email'])field(id).addEventListener('input',()=>{if(field(id).hasAttribute('aria-invalid'))validate(id==='quote-details'?1:2,false);});
  addEventListener('popstate',event=>{
    if(sending||sent||!Number.isInteger(event.state?.teditsEnquiryStep))return;
    let destination=Math.max(0,Math.min(2,event.state.teditsEnquiryStep));
    for(let i=0;i<destination;i++)if(!validate(i,false)){destination=i;break;}
    show(destination,{animate:false,historyMode:'none'});
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)transition?.cancel();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(sending||sent)return;
    if(current<2){navigate(current+1,{detail:0});return;}
    for(let i=0;i<3;i++)if(!validate(i,false)){show(i,{animate:false});validate(i);return;}
    syncWebsite();sending=true;form.setAttribute('aria-busy','true');field('quote-steps').inert=true;
    for(const button of form.querySelectorAll('button'))button.disabled=true;
    status.dataset.state='sending';status.textContent='Sending your enquiry…';
    try{
      const data=new FormData(form);
      for(const name of ['name','email','business','message','existing_website','whatsapp'])if(data.has(name))data.set(name,String(data.get(name)).trim());
      const response=await fetch(form.action,{method:'POST',body:data,headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('Submission failed');
      sent=true;form.reset();syncWebsite();field('quote-steps').hidden=true;field('quote-controls').hidden=true;field('quote-privacy').hidden=true;
      form.querySelector('.enquiry-progress').hidden=true;count.hidden=true;success.hidden=false;status.dataset.state='success';status.textContent='Your enquiry has been sent.';
      document.title='Enquiry sent — Tedits Studio';locate();field('quote-success-title').focus({preventScroll:true});
    }catch(_){
      status.dataset.state='error';status.textContent='Your enquiry could not be sent. Your answers are still here. Please try again, or use WhatsApp or email.';
      status.setAttribute('tabindex','-1');status.focus({preventScroll:true});status.scrollIntoView({block:'nearest',behavior:'instant'});
    }finally{sending=false;form.removeAttribute('aria-busy');field('quote-steps').inert=false;for(const button of form.querySelectorAll('button'))button.disabled=false;}
  });
  field('quote-restart').addEventListener('click',()=>{
    sent=false;success.hidden=true;field('quote-steps').hidden=false;field('quote-controls').hidden=false;field('quote-privacy').hidden=false;form.querySelector('.enquiry-progress').hidden=false;
    status.textContent='';status.removeAttribute('data-state');show(0,{animate:false,historyMode:'replace'});
  });
  form.noValidate=true;card.classList.add('is-staged');show(0,{focus:false,animate:false,historyMode:'replace'});syncWebsite();
  addEventListener('pageshow',event=>{if(event.persisted&&!sent){syncWebsite();review();}});
})();
