import EmblaCarousel from './vendor/embla/embla-carousel.esm.js';
import Autoplay from './vendor/embla/embla-carousel-autoplay.esm.js';

export function mountProjectCarousel(viewport, reducedMotion) {
  const section = viewport.closest('.work-section');
  const controls = section.querySelector('[data-carousel-controls]');
  const play = controls.querySelector('[data-carousel-play]');
  const previous = controls.querySelector('[data-carousel-prev]');
  const next = controls.querySelector('[data-carousel-next]');
  const status = section.querySelector('[data-carousel-status]');
  const autoplay = Autoplay({delay: 5000, playOnInit: false});
  let wantsAutoplay = !reducedMotion.matches;
  let inView = false;
  let hovering = viewport.matches(':hover');

  viewport.classList.add('is-enhanced');
  const carousel = EmblaCarousel(viewport, {loop: true, align: 'start'}, [autoplay]);

  function update() {
    play.textContent = wantsAutoplay ? 'Pause' : 'Play';
    play.setAttribute('aria-label', wantsAutoplay ? 'Pause project autoplay' : 'Play project autoplay');
    previous.disabled = !carousel.canScrollPrev();
    next.disabled = !carousel.canScrollNext();
    play.disabled = carousel.scrollSnapList().length < 2;
    if (wantsAutoplay && inView && !hovering && !play.disabled) {
      if (!autoplay.isPlaying()) autoplay.play();
    } else if (autoplay.isPlaying()) {
      autoplay.stop();
    }
  }

  function navigate(direction) {
    wantsAutoplay = false;
    update();
    if (direction === 'previous') carousel.scrollPrev(reducedMotion.matches);
    else carousel.scrollNext(reducedMotion.matches);
  }

  play.addEventListener('click', () => {
    wantsAutoplay = !wantsAutoplay;
    update();
  });
  previous.addEventListener('click', () => navigate('previous'));
  next.addEventListener('click', () => navigate('next'));
  section.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!viewport.contains(event.target) && !controls.contains(event.target)) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    navigate(event.key === 'ArrowLeft' ? 'previous' : 'next');
  });
  section.addEventListener('focusin', event => {
    if (event.target === play) return;
    wantsAutoplay = false;
    update();
  });
  viewport.addEventListener('mouseenter', () => {
    hovering = true;
    update();
  });
  viewport.addEventListener('mouseleave', () => {
    hovering = false;
    update();
  });
  carousel.on('pointerDown', () => {
    wantsAutoplay = false;
    update();
  });
  carousel.on('reInit', update);
  carousel.on('select', () => {
    update();
    if (!wantsAutoplay) {
      status.textContent = `Project ${carousel.selectedScrollSnap() + 1} of ${carousel.scrollSnapList().length}`;
    }
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) wantsAutoplay = false;
    update();
  });

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    update();
  });
  observer.observe(viewport);
  controls.hidden = false;
  update();
}
