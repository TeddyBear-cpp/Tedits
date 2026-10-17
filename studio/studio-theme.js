/* Runs in the head so the chosen background is applied before the first paint. */
(() => {
  'use strict';
  const root = document.documentElement;
  const storageKey = 'tedits-studio-theme';
  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
  let explicitChoice = readChoice();
  let currentTheme;

  function readChoice() {
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved === 'dark' || saved === 'light' ? saved : null;
    } catch (_) {
      return null;
    }
  }

  function updateControls() {
    const dark = currentTheme === 'dark';
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', 'Dark mode');
      toggle.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    document.querySelectorAll('.studio-logo img').forEach(image => {
      const source = image.getAttribute('src');
      if (source && /tedits-studio-on-(ivory|slate)\.svg$/.test(source)) {
        image.setAttribute('src', source.replace(/tedits-studio-on-(ivory|slate)\.svg$/, dark ? 'tedits-studio-on-slate.svg' : 'tedits-studio-on-ivory.svg'));
      }
    });
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = dark ? '#24282c' : '#FFFFE3';
  }

  function applyTheme(theme) {
    currentTheme = theme;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    updateControls();
  }

  function applyPreference() {
    applyTheme(explicitChoice || (systemPreference.matches ? 'dark' : 'light'));
  }

  function initialiseToggle() {
    updateControls();
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      explicitChoice = currentTheme === 'dark' ? 'light' : 'dark';
      try { window.localStorage.setItem(storageKey, explicitChoice); } catch (_) { /* The current page still honours the choice. */ }
      applyTheme(explicitChoice);
    });
  }

  applyPreference();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseToggle, { once: true });
  else initialiseToggle();

  const systemChanged = () => { if (!explicitChoice) applyPreference(); };
  if (systemPreference.addEventListener) systemPreference.addEventListener('change', systemChanged);
  else systemPreference.addListener(systemChanged);
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    explicitChoice = readChoice();
    applyPreference();
  });
})();
