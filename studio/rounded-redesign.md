# Rounded Studio redesign — 27 October 2026

## Direction

A quieter gallery with rounded image frames, varied project sizes, fewer decorative labels, and more readable body copy. Syne, DM Sans, the supplied wordmark, and the established Ink wash theme roles remain in use.

Brand palette: charcoal `#4A4A4A`, gray `#CBCBCB`, ivory `#FFFFE3`, slate `#6D8196`. The existing dark-theme derivatives are retained. Project screenshots continue to show each concept's own identity.

## Pages

- `index.html`: “Design that connects.”, the approved hands artwork, scroll-only clouds at depth 1.2, five project concepts, the palette gallery, services, about and contact.
- `why-teditstudio.html`: original three WebGL forms transferred from the homepage; rotating opportunity copy retained; rounded content, process and pricing surfaces.
- `enquire.html`: matching layout, form controls and shared contact chooser. Original form endpoint and required fields preserved.
- `portfolio-preview.html`: synchronized with the current homepage to avoid a stale preview.

## Motion and performance

The hands have no scroll transform. Four background planes use the approved depth factors. Cloud geometry is cached on resize, and requestAnimationFrame runs only while a scroll change settles. Motion off removes the extra scroll distance and parks the current composition; re-enabling restores that position. Reduced motion starts with a compact static hero. There is no idle drift or sunlight animation. Existing Why-page forms pause when hidden or outside the viewport.

The three artwork files are WebP conversions of approved local assets; no new visual direction or generation was introduced.

## Verification

Packaged build: 132 files, all local HTML/CSS references resolve. CMS fixtures verify the five project cards, current and legacy-default homepage headings, custom CMS copy, rotating examples, Why copy, and enquiry copy. Seed generation supports the new hero structure. Published legacy default copy is migrated during build; no remote CMS data was changed.

Browser checks: desktop and narrow mobile layouts, light/dark theme, cloud scroll transforms with static hands, compact motion off, Why WebGL rendering and pause control, rotating examples, project details, palette button/keyboard navigation, contact chooser, and form checkbox/required-field state. No form was submitted. Evidence lives in `../preview-evidence/rounded-*`.

## Design review

The taste direction used was “Photographs at uneven sizes”, seed 2037326708, adapted to existing project previews. Browser review replaced the external Playwright inspector because this session requires browser interaction through CUA.

The static style scan reports intentional or nonvisual matches: cloud alpha masks and the neutral readability scrim use gradient syntax; the user explicitly requested the existing gradient forms; `.eyebrow` selectors mostly remove existing labels; `backdrop-filter:none` removes blur; small outlined motion controls communicate state. These are documented exceptions, not an assertion that the automated scan passed.

Visual review fixes: mobile hero reduced to two title lines, motion control kept on one line, enquiry headline and dialog title reduced at narrow sizes. Approved art remains the dominant hero visual. All three pages fit 320px without horizontal overflow.

## Recovery

Imported-source reconciliation manifest: `../backups/site-reconcile-20261027/manifest.json`.
Pre-redesign pages: `../backups/rounded-redesign-20261027/before/`.
The cloud prototype remains in `../hero-parallax/`. No deployment, push or commit was performed.
