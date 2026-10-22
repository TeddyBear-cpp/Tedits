'use strict';

// Native links, details and full images remain useful without JavaScript.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('#navigation');
const menuToggle = document.querySelector('.menu-toggle');
function closeMenu() {
  menu.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}
menuToggle.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); menuToggle.focus(); }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);


// Preserve bookmarked destinations from the original single-page concept.
if (document.body.dataset.page === 'home') {
  const legacy = { '#packages': 'packages.html', '#gallery': 'gallery.html', '#faqs': 'faqs.html', '#booking': 'booking.html' };
  if (legacy[location.hash]) location.replace(new URL(legacy[location.hash], location.href));
}

function initBooking() {
  const form = document.querySelector('#enquiry-form');
  if (!form) return;
const packages = {
  'Little Explorer': { price: 180, space: '3 × 3 m', age: '0–3' },
  'Happy Hopper': { price: 260, space: '4 × 4 m', age: '0–4' },
  'Ultimate Play Day': { price: 350, space: '5 × 5 m', age: '0–5' }
};
const packageInput = document.querySelector('#package');
function updateSelection() {
  const choice = packages[packageInput.value];
  document.querySelector('#selection-summary').textContent = choice ? packageInput.value : 'A little undecided? That’s okay.';
  document.querySelector('#selection-price').textContent = choice
    ? `£${choice.price} demo price · Ages ${choice.age} · ${choice.space} minimum`
    : 'Choose a package, or let us help.';
  hideOldPreview();
}
document.querySelectorAll('[data-package]').forEach(link => {
  link.addEventListener('click', () => { packageInput.value = link.dataset.package; updateSelection(); });
});
packageInput.addEventListener('change', updateSelection);


// Validate locally; no request, personal-data storage, or booking backend.

const dateInput = document.querySelector('#date');
function localToday() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}
dateInput.min = localToday();
const validationMessages = {
  name: 'Please enter your name.',
  email: 'Please enter a valid email address.',
  date: 'Please choose today or a future event date.',
  location: 'Please enter a town, postcode or venue.'
};
function checkField(input) {
  const value = input.value.trim();
  let invalid = !value || !input.validity.valid;
  if (input.name === 'date') invalid = invalid || value < localToday();
  const error = document.querySelector(`#${input.id}-error`);
  error.textContent = invalid ? validationMessages[input.name] : '';
  input.setAttribute('aria-invalid', String(invalid));
  input.setAttribute('aria-describedby', error.id);
  return !invalid;
}
function hideOldPreview() { document.querySelector('#form-success').hidden = true; }
form.addEventListener('input', event => {
  hideOldPreview();
  if (event.target.getAttribute('aria-invalid') === 'true') checkField(event.target);
});
form.addEventListener('change', hideOldPreview);
form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('[required]')];
  const results = fields.map(checkField);
  const invalidIndex = results.indexOf(false);
  if (invalidIndex !== -1) {
    document.querySelector('#form-errors').textContent = 'A few details need a little attention. Please check the fields above.';
    fields[invalidIndex].focus();
    return;
  }
  document.querySelector('#form-errors').textContent = '';
  const data = new FormData(form);
  const selected = packages[data.get('package')];
  const date = new Date(`${data.get('date')}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  document.querySelector('#enquiry-summary').textContent = `${data.get('name').trim()}, your plan is ${data.get('package') || 'a package to be decided'}${selected ? ` (£${selected.price}, illustrative price)` : ''} on ${date} at ${data.get('location').trim()}. Your email: ${data.get('email').trim()}.`;
  const success = document.querySelector('#form-success');
  success.hidden = false;
  success.focus({ preventScroll: true });
  success.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'nearest' });
});
document.querySelector('#edit-enquiry').addEventListener('click', () => { hideOldPreview(); document.querySelector('#name').focus(); });


  const packageNames = {
    'little-explorer': 'Little Explorer',
    'happy-hopper': 'Happy Hopper',
    'ultimate-play-day': 'Ultimate Play Day'
  };
  const requested = new URLSearchParams(location.search).get('package');
  if (Object.hasOwn(packageNames, requested)) packageInput.value = packageNames[requested];
  updateSelection();
}
initBooking();

function initGallery() {
  if (!document.querySelector('#lightbox')) return;
const galleryItems = [...document.querySelectorAll('.gallery-item')];
let visibleImages = [...galleryItems];
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(filter => {
      filter.classList.toggle('active', filter === button);
      filter.setAttribute('aria-pressed', String(filter === button));
    });
    galleryItems.forEach(item => {
      item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter;
      if (!item.hidden) item.classList.add('is-visible');
    });
    visibleImages = galleryItems.filter(item => !item.hidden);
    document.querySelector('#gallery-status').textContent = `${visibleImages.length} photographs shown.`;
  });
});
const lightbox = document.querySelector('#lightbox');
let currentImage = 0;
let imageTrigger;
let savedBodyOverflow = '';
function displayImage(index) {
  currentImage = (index + visibleImages.length) % visibleImages.length;
  const source = visibleImages[currentImage];
  const image = document.querySelector('#lightbox-image');
  image.src = source.href;
  image.alt = source.querySelector('img').alt;
  document.querySelector('#lightbox-caption').textContent = source.dataset.caption;
  document.querySelector('#lightbox-count').textContent = `${currentImage + 1} of ${visibleImages.length}`;
}
galleryItems.forEach(item => item.addEventListener('click', event => {
  if (typeof lightbox.showModal !== 'function') return;
  event.preventDefault();
  imageTrigger = item;
  displayImage(visibleImages.indexOf(item));
  savedBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  lightbox.showModal();
  document.querySelector('#close-lightbox').focus();
}));
document.querySelector('#close-lightbox').addEventListener('click', () => lightbox.close());
document.querySelector('#previous-image').addEventListener('click', () => displayImage(currentImage - 1));
document.querySelector('#next-image').addEventListener('click', () => displayImage(currentImage + 1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); displayImage(currentImage + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); displayImage(currentImage - 1); }
});
lightbox.addEventListener('click', event => {
  if (event.target !== lightbox) return;
  const bounds = lightbox.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) lightbox.close();
});
lightbox.addEventListener('close', () => {
  document.body.style.overflow = savedBodyOverflow;
  imageTrigger?.focus({ preventScroll: true });
});


}
initGallery();

// Reveals progressively enhance visible content, without hiding the no-script page.
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('[data-reveal]').forEach((element, index) => {
    if (element.getBoundingClientRect().top < innerHeight) return;
    element.classList.add('reveal-ready');
    if (element.matches('figure, .gallery-item')) element.classList.add('image-reveal');
    element.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`);
    observer.observe(element);
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) { observer.disconnect(); document.querySelectorAll('.reveal-ready').forEach(element => element.classList.add('is-visible')); }
  });
}
