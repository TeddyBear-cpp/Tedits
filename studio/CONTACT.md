# Contact chooser and WhatsApp buttons

The three Studio pages load `studio-contact.css` and `studio-contact.js` after their existing styles and scripts. No package or framework is required.

```html
<!-- After the page's other stylesheets -->
<link rel="stylesheet" href="studio-contact.css?v=1">
<!-- Before </body>, after the page's other scripts -->
<script src="studio-contact.js?v=1"></script>
```

## Contact chooser

Use a semantic trigger button:

```html
<button class="nav-contact" type="button" data-contact-open
  aria-haspopup="dialog" aria-controls="contact-dialog" aria-expanded="false">
  Let’s talk
</button>
```

The script adds one native modal dialog with WhatsApp, phone, email and enquiry links. The WhatsApp row states that it opens a new tab. The dialog supports native keyboard focus containment and Escape, a close button, backdrop dismissal, scroll locking and focus restoration. Update the destinations in `studio-contact.js` if the contact details change.

## WhatsApp hover effect

Keep the real navigation on an anchor. Add `wa-interactive` to the existing `hero-whatsapp` or `glass-action` class, then nest its visual surface:

```html
<a class="glass-action wa-interactive" href="https://wa.me/260975996792"
  target="_blank" rel="noopener noreferrer">
  <span class="wa-visual">
    <span class="wa-label">Chat on WhatsApp</span>
    <svg class="wa-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true" focusable="false">
      <path d="M7 17 17 7M7 7h10v10"/>
    </svg>
  </span>
</a>
```

The anchor and its padded hit area stay fixed. A fine pointer moves only the nested surface by up to 16px horizontally and 12px vertically, with smaller label/icon depth. Pointer coordinates update the luminous edge through `--px` and `--py` in animation frames. The glow fades over 200ms; the surface returns with a damped spring. Existing sizing, colours and frosted styling are retained.

Keyboard focus provides a centred glow and visible outline. Touch uses a small pressed-state lean with normal single-tap navigation. Reduced motion keeps the static border and focus outline, with no spatial movement or following glow. No action fires on hover. Pointer listeners and frames are cleaned up on page exit and restored for back/forward navigation.
