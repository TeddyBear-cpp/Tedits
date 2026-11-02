export function initEnquiry(form,{services,reduce,adapter}){
 if(!form)return;
 const $=s=>form.querySelector(s),steps=[...form.querySelectorAll('[data-step]')],next=$('.form-next'),back=$('.form-back'),submit=$('.form-submit'),status=$('#form-status');
 let step=0,busy=false;
 const service=new URLSearchParams(location.search).get('service');
 if(services.some(s=>s.id===service)){form.querySelectorAll('[name=service]').forEach(radio=>radio.checked=radio.value===service);}
 function validate(field){
  const error=$('#'+field.name+'-error');if(!error)return true;
  let message='';const value=field.type==='radio'?form.elements.service.value:field.value.trim();
  if(!value)message=field.name==='service'?'Choose a service, or select Help me decide.':'Please complete this field.';
  else if(field.type==='email'&&!field.validity.valid)message='Enter a valid email address.';
  else if(field.name==='description'&&value.length<10)message='Add a little more detail (at least 10 characters).';
  error.textContent=message;
  if(field.type==='radio')form.querySelectorAll('[name=service]').forEach(r=>r.setAttribute('aria-invalid',String(!!message)));else field.setAttribute('aria-invalid',String(!!message));
  return !message;
 }
 function invalidFields(index){return [...steps[index].querySelectorAll('[required]')].filter(field=>!validate(field));}
 function showStep(index,focus=true){
  step=index;steps.forEach((el,i)=>el.hidden=i!==index);back.hidden=index===0;next.hidden=index===2;submit.hidden=index!==2;
  $('#step-progress').textContent='Step '+(index+1)+' of 3 · '+['Your space','The details','About you'][index];
  form.querySelectorAll('.form-progress li').forEach((el,i)=>{if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');el.dataset.complete=String(i<index);});
  const chosen=services.find(s=>s.id===form.elements.service.value)?.title||'Finding the right finish';
  $('#enquiry-summary').textContent=chosen+' · '+form.elements.suburb.value+(form.elements.scope.value?' · '+form.elements.scope.value:'');
  if(focus){const legend=steps[index].querySelector('legend');legend.focus({preventScroll:true});const top=form.getBoundingClientRect().top;if(top<12||top>innerHeight*.3)window.TeditsScroll?.scrollTo(form,{offset:-24,immediate:true});if(!reduce.matches)steps[index].animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});}
 }
 function advance(){const invalid=invalidFields(step);if(invalid.length){invalid[0].focus();return;}showStep(step+1);}
 next.addEventListener('click',advance);back.addEventListener('click',()=>showStep(step-1));
 form.addEventListener('input',e=>{if(e.target.getAttribute('aria-invalid')==='true')validate(e.target);});
 form.addEventListener('change',e=>{if(e.target.name==='service')validate(e.target);});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;if(step<2){advance();return;}
  for(let i=0;i<steps.length;i++){const invalid=invalidFields(i);if(invalid.length){showStep(i);invalid[0].focus();return;}}
  busy=true;submit.disabled=true;submit.textContent='Preparing preview…';form.setAttribute('aria-busy','true');
  try{await adapter.submit(new FormData(form));form.reset();steps.forEach(el=>el.hidden=true);$('.form-actions').hidden=true;$('.form-progress').hidden=true;$('.form-disclosure').hidden=true;status.innerHTML='<div class="success-mark" aria-hidden="true">✓</div><h2>Your next chapter<br>starts here.</h2><p>Your demo enquiry is complete. Nothing was sent or stored.</p><button class="button" type="button" id="enquiry-restart">Explore another project ↗</button>';status.focus();$('#enquiry-restart').addEventListener('click',()=>{status.replaceChildren();$('.form-actions').hidden=false;$('.form-progress').hidden=false;$('.form-disclosure').hidden=false;form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));showStep(0);});}
  catch{status.textContent='We couldn’t prepare the preview. Your answers are still here. Please try again.';status.focus();}
  finally{busy=false;submit.disabled=false;submit.textContent='Preview enquiry ↗';form.removeAttribute('aria-busy');}
 });
 showStep(0,false);
}
