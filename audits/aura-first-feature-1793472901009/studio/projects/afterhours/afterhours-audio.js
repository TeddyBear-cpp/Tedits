(() => {
  'use strict';
  const tracks=[...document.querySelectorAll('[data-audio-track]')];
  const audios=tracks.map(track=>track.querySelector('audio'));
  const status=document.getElementById('audio-status');
  const format=seconds=>{const value=Number.isFinite(seconds)?Math.max(0,Math.floor(seconds)):0;return Math.floor(value/60)+':'+String(value%60).padStart(2,'0');};
  tracks.forEach(track=>{
    const audio=track.querySelector('audio'),play=track.querySelector('[data-play]'),seek=track.querySelector('[data-seek]'),mute=track.querySelector('[data-mute]'),error=track.querySelector('.track-error');
    const title=track.querySelector('.track-title').textContent;
    const artist=track.dataset.artist || 'TeddyBear';
    const duration=()=>Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:0;
    function updateTime(){
      const total=duration(),current=audio.currentTime||0;
      track.querySelector('[data-duration]').textContent=total?format(total):'—:—';
      track.querySelector('[data-time]').textContent=format(current)+' / '+(total?format(total):'—:—');
      seek.disabled=!total||!!audio.error;
      seek.value=total?Math.round(current/total*1000):0;
      seek.style.setProperty('--progress',(total?current/total*100:0)+'%');
      seek.setAttribute('aria-valuetext',format(current)+(total?' of '+format(total):''));
    }
    function updatePlay(){
      const active=!audio.paused&&!audio.ended;
      play.setAttribute('aria-pressed',String(active));play.setAttribute('aria-label',(active?'Pause ':'Play ')+title+' by '+artist);
      play.firstElementChild.textContent=active?'Ⅱ':'▶';track.classList.toggle('is-playing',active);
    }
    function showError(message){error.hidden=false;error.textContent=message;}
    play.addEventListener('click',async()=>{
      error.hidden=true;
      if(!audio.paused){audio.pause();return;}
      if(audio.ended)audio.currentTime=0;
      play.setAttribute('aria-busy','true');
      try{await audio.play();}
      catch(exception){if(exception.name!=='AbortError')showError('This track could not play. Please try again.');}
      finally{play.removeAttribute('aria-busy');updatePlay();}
    });
    audio.addEventListener('play',()=>{audios.forEach(other=>{if(other!==audio)other.pause();});updatePlay();status.textContent=title+' by '+artist+' is playing.';});
    audio.addEventListener('pause',updatePlay);
    audio.addEventListener('ended',()=>{updatePlay();updateTime();status.textContent=title+' has finished.';});
    ['loadedmetadata','durationchange','timeupdate','seeked'].forEach(event=>audio.addEventListener(event,updateTime));
    function loadFailed(){updateTime();updatePlay();seek.disabled=true;showError('This audio file could not load. Refresh the page to try again.');}
    audio.addEventListener('error',loadFailed);
    audio.querySelector('source').addEventListener('error',loadFailed);
    seek.addEventListener('input',()=>{const total=duration();if(total){audio.currentTime=Number(seek.value)/1000*total;updateTime();}});
    seek.addEventListener('keydown',event=>{
      const total=duration();if(!total)return;
      let next;
      if(event.key==='ArrowRight'||event.key==='ArrowUp')next=audio.currentTime+(event.shiftKey?10:5);
      else if(event.key==='ArrowLeft'||event.key==='ArrowDown')next=audio.currentTime-(event.shiftKey?10:5);
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=total;
      else return;
      event.preventDefault();audio.currentTime=Math.max(0,Math.min(total,next));updateTime();
    });
    mute.addEventListener('click',()=>{audio.muted=!audio.muted;});
    audio.addEventListener('volumechange',()=>{mute.setAttribute('aria-pressed',String(audio.muted));mute.setAttribute('aria-label',(audio.muted?'Unmute ':'Mute ')+title);mute.textContent=audio.muted?'Unmute':'Mute';});
    track.classList.add('audio-enhanced');play.hidden=false;track.querySelector('.track-controls').hidden=false;updateTime();updatePlay();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')audios.forEach(audio=>audio.pause());});
})();
