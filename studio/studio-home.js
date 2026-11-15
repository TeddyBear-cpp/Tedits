(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 761px)');
  const preview = document.querySelector('.cloud-preview img');
  const layers = [...document.querySelectorAll('.cloud-detail [data-src]')];

  // Let the small composition paint before requesting the full-resolution layers.
  preview.decode().catch(() => {}).then(() => {
    requestAnimationFrame(() => requestAnimationFrame(async () => {
      try {
        await Promise.all(layers.map(image => {
          image.src = image.dataset.src;
          return image.decode();
        }));
        preview.closest('.cloud-art').classList.add('has-detail');
      } catch {
        // Keep the complete preview when any full-resolution layer is unavailable.
      }
    }));
  });

  const title = document.getElementById('business-rotation');
  const pause = document.getElementById('rotation-pause');
  const fallback = title.textContent.trim();
  const examples = title.dataset.examples.split('|');
  const frames = Array.from({length:2}, () => {
    const frame = document.createElement('span');
    frame.className = 'business-current';
    return frame;
  });
  const spacers = [...examples,fallback].map(text => {
    const spacer = document.createElement('span');
    spacer.className = 'business-size';
    spacer.textContent = text;
    spacer.setAttribute('aria-hidden','true');
    return spacer;
  });
  title.replaceChildren(...frames,...spacers);

  let index = 0;
  let active = 0;
  let timer;
  let visible = false;
  let paused = false;
  function showPhrase(text) {
    const previous = frames[active];
    active = 1 - active;
    const next = frames[active];
    next.textContent = text;
    next.removeAttribute('aria-hidden');
    next.classList.add('is-active');
    previous.setAttribute('aria-hidden','true');
    previous.classList.remove('is-active');
  }
  function syncTimer() {
    clearInterval(timer);
    if (paused || !visible || document.hidden || reduced.matches) return;
    timer = setInterval(() => {
      index = (index + 1) % examples.length;
      showPhrase(examples[index]);
    }, 3200);
  }
  function syncPreference() {
    pause.hidden = reduced.matches;
    showPhrase(reduced.matches ? fallback : examples[index]);
    syncTimer();
  }
  pause.addEventListener('click', () => {
    paused = !paused;
    pause.setAttribute('aria-pressed',String(paused));
    pause.textContent = paused ? 'Resume rotating text' : 'Pause rotating text';
    syncTimer();
  });
  document.addEventListener('visibilitychange', syncTimer);
  reduced.addEventListener('change', syncPreference);
  syncPreference();
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncTimer();
  }).observe(title);

  const visuals = [...document.querySelectorAll('.benefit-visual')];
  const playback = document.querySelector('.benefit-playback');
  const visibleVideos = new Set();
  let videoOverride;
  function syncVideos() {
    const playing = videoOverride ?? !reduced.matches;
    playback.textContent = playing ? 'Pause videos' : 'Play videos';
    visuals.forEach(video => {
      if (playing && !document.hidden && visibleVideos.has(video)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }
  playback.hidden = false;
  playback.addEventListener('click', () => {
    videoOverride = !(videoOverride ?? !reduced.matches);
    syncVideos();
  });
  const videoObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleVideos.add(entry.target);
      else visibleVideos.delete(entry.target);
    }
    syncVideos();
  });
  visuals.forEach(video => videoObserver.observe(video));
  document.addEventListener('visibilitychange', syncVideos);
  reduced.addEventListener('change', () => {
    videoOverride = undefined;
    syncVideos();
  });
  syncVideos();

  const animations = new Set();
  function reveal(image, delay) {
    if (reduced.matches) return;
    const animation = image.animate(
      [{opacity:.72,transform:'translateY(8px)'},{opacity:1,transform:'none'}],
      {duration:240,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}
    );
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (desktop.matches) {
        visuals.forEach((image,i) => reveal(image, i * 50));
        observer.disconnect();
        return;
      }
      reveal(entry.target, 0);
      observer.unobserve(entry.target);
    }
  }, {threshold:.2});
  visuals.forEach(image => observer.observe(image));
  reduced.addEventListener('change', () => {
    if (reduced.matches) animations.forEach(animation => animation.cancel());
  });
})();
