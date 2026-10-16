// The original video supplies the sharp image and blurred fill: one playback clock.
const videos = [...document.querySelectorAll('.video-shell video')];
const playerIcons = {
  play: '<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M9 5v14M16 5v14" stroke-width="3"/>',
  sound: '<path d="M11 5 6 9H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
  muted: '<path d="M11 5 6 9H3v6h3l5 4ZM16 9l6 6m0-6-6 6"/>',
  expand: '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
  collapse: '<path d="M3 9h6V3m6 0v6h6M9 21v-6H3m12 6v-6h6"/>'
};
const playerIcon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${playerIcons[name]}</svg>`;
const playerTime = seconds => {
  if (!Number.isFinite(seconds)) return '00:00';
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

videos.forEach((video, index) => {
  const shell = video.closest('.video-shell');
  const controls = document.createElement('div');
  controls.className = 'timeline-controls';
  controls.innerHTML = `
    <div class="transport"><button class="transport-play" type="button" aria-label="Play video">${playerIcon('play')}</button>
      <span class="timecode"><span class="current-time">00:00</span><span class="time-divider"> / </span><span class="total-time">00:00</span></span>
      <span class="transport-spacer"></span>
      <button class="transport-sound" type="button" aria-label="Mute video" aria-pressed="false">${playerIcon('sound')}</button>
      <button class="transport-fullscreen" type="button" aria-label="Enter fullscreen">${playerIcon('expand')}</button>
    </div>
    <div class="timeline-ruler" aria-hidden="true"><span>00:00</span><span class="mid-time">00:00</span><span class="end-time">00:00</span></div>
    <div class="timeline-track"><div class="timeline-clip" aria-hidden="true"><span>V${index + 1}</span></div><div class="timeline-playhead" aria-hidden="true"></div>
      <input class="timeline-seek" type="range" min="0" max="100" step="0.05" value="0" aria-label="Seek ${video.getAttribute('aria-label').replace(/^Play /, '')}" aria-valuetext="00:00" disabled>
    </div><p class="player-status" role="status"></p>`;
  shell.append(controls);
  shell.classList.add('custom-player');
  video.controls = false; // Native controls remain available if this script fails to load.
  const play = controls.querySelector('.transport-play');
  const sound = controls.querySelector('.transport-sound');
  const fullscreen = controls.querySelector('.transport-fullscreen');
  const seek = controls.querySelector('.timeline-seek');
  const status = controls.querySelector('.player-status');

  function updateTime() {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const progress = duration ? video.currentTime / duration * 100 : 0;
    seek.disabled = duration <= 0;
    seek.value = progress;
    seek.setAttribute('aria-valuetext', `${playerTime(video.currentTime)} of ${playerTime(duration)}`);
    controls.style.setProperty('--progress', `${Math.min(100, Math.max(0, progress))}%`);
    controls.querySelector('.current-time').textContent = playerTime(video.currentTime);
    controls.querySelector('.total-time').textContent = playerTime(duration);
    controls.querySelector('.mid-time').textContent = playerTime(duration / 2);
    controls.querySelector('.end-time').textContent = playerTime(duration);
  }
  function updatePlayback() {
    const playing = !video.paused && !video.ended;
    play.innerHTML = playerIcon(playing ? 'pause' : 'play');
    play.setAttribute('aria-label', playing ? 'Pause video' : video.ended ? 'Replay video' : 'Play video');
  }
  async function togglePlayback() {
    if (!video.paused) { video.pause(); return; }
    status.textContent = '';
    try { await video.play(); } catch { status.textContent = 'Unable to play. Please try again.'; }
  }
  play.addEventListener('click', togglePlayback);
  video.addEventListener('click', togglePlayback);
  seek.addEventListener('input', () => {
    if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value) / 100 * video.duration;
    updateTime();
  });
  sound.addEventListener('click', () => { video.muted = !video.muted; });
  video.addEventListener('volumechange', () => {
    const muted = video.muted || video.volume === 0;
    sound.innerHTML = playerIcon(muted ? 'muted' : 'sound');
    sound.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
    sound.setAttribute('aria-pressed', String(muted));
  });
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (shell.requestFullscreen) await shell.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      else status.textContent = 'Fullscreen is unavailable in this browser.';
    } catch { status.textContent = 'Fullscreen is unavailable in this view.'; }
  });
  document.addEventListener('fullscreenchange', () => {
    const expanded = document.fullscreenElement === shell;
    fullscreen.innerHTML = playerIcon(expanded ? 'collapse' : 'expand');
    fullscreen.setAttribute('aria-label', expanded ? 'Exit fullscreen' : 'Enter fullscreen');
  });
  ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked', 'ended'].forEach(event => video.addEventListener(event, updateTime));
  ['play', 'pause', 'ended'].forEach(event => video.addEventListener(event, updatePlayback));
  video.addEventListener('waiting', () => { status.textContent = 'Buffering…'; });
  video.addEventListener('playing', () => { status.textContent = ''; });
  video.addEventListener('seeked', () => { status.textContent = ''; });
  video.addEventListener('error', () => { status.textContent = 'Video unavailable. Please reload to try again.'; });
  updateTime();
  updatePlayback();
});
videos.forEach(video => {
  const shell = video.closest('.video-shell');
  const canvas = document.createElement('canvas');
  canvas.className = 'video-backdrop';
  canvas.setAttribute('aria-hidden', 'true');
  shell.prepend(canvas);
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return;
  let frameId = null;
  const videoFrames = typeof video.requestVideoFrameCallback === 'function';

  function paint() {
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
    const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
    const cropWidth = canvas.width / scale;
    const cropHeight = canvas.height / scale;
    context.drawImage(video,
      (video.videoWidth - cropWidth) / 2, (video.videoHeight - cropHeight) / 2,
      cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
  }

  function stop() {
    if (frameId === null) return;
    if (videoFrames) video.cancelVideoFrameCallback(frameId);
    else cancelAnimationFrame(frameId);
    frameId = null;
  }

  function schedule() {
    if (frameId !== null || video.paused || video.ended || document.hidden) return;
    frameId = videoFrames ? video.requestVideoFrameCallback(step) : requestAnimationFrame(step);
  }

  function step() {
    frameId = null;
    paint();
    schedule();
  }

  // Small canvas, enlarged and blurred by CSS, avoids full-resolution copies.
  const resize = new ResizeObserver(() => {
    canvas.width = 96;
    canvas.height = Math.max(1, Math.round(96 * shell.clientHeight / Math.max(1, shell.clientWidth)));
    paint();
  });
  resize.observe(shell);
  video.addEventListener('loadeddata', paint);
  video.addEventListener('seeked', paint);
  video.addEventListener('play', () => {
    videos.forEach(other => { if (other !== video) other.pause(); });
    schedule();
  });
  video.addEventListener('pause', () => { stop(); paint(); });
  video.addEventListener('ended', () => { stop(); paint(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { paint(); schedule(); }
  });
  paint();
});

// Small, one-time entrances. Content stays visible if JS or observers fail.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window && Element.prototype.animate) {
  const entranceAnimations = new Set();
  function enter(element, delay = 0) {
    if (motionPreference.matches) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(14px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 640, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    entranceAnimations.add(animation);
    animation.finished.then(() => entranceAnimations.delete(animation)).catch(() => {});
  }
  document.querySelectorAll('.hero-copy > *').forEach((element, index) => enter(element, index * 65));
  enter(document.querySelector('.hero-film'), 160);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      enter(entry.target, Number(entry.target.dataset.entranceDelay) || 0);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-heading,.work-card,.services-grid > div,.contact > *, .web-design-note').forEach(element => observer.observe(element));
  document.querySelectorAll('.work-card').forEach((element, index) => { element.dataset.entranceDelay = (index % 2) * 70; });
  motionPreference.addEventListener('change', event => {
    if (!event.matches) return;
    entranceAnimations.forEach(animation => animation.cancel());
    entranceAnimations.clear();
    observer.disconnect();
  });
}
