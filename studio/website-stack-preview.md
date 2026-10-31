# Website benefits: local review

Preview: <http://127.0.0.1:8086/studio/index.html#website-story>. Local changes only; no deployment or commit.

## Direction and content

The user's approved composition takes precedence over a new direction draw: left-hand copy, staggered words, and three rounded video cards that move right and remain opaque beneath the next card. Existing brand typography, palette, hero and navigation are retained. The previous taste direction (seed 2037326708) is not redrawn for this section edit.

The sequence is discovery → answers → confidence. The closing copy explains how social media and a website work together. The opportunity rotation remains above the sequence.

Search wording follows [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide): clear service and location content can help search engines understand a business. No particular ranking is promised. The review graphic remains a generic illustration, not a real client testimonial.

## Media and behaviour

- Approved original MP4s and posters are copied into `assets/website-story/`.
- Search: six seconds. Answers: four seconds. Trust: six seconds. All silent, 60fps, with no orbiting ball.
- In the pinned layout only the active video plays. Previously entered cards retain full opacity.
- Reverse scrolling restores earlier cards and copy. Chapter buttons support keyboard activation.
- Pause/resume uses one separate button in both layouts. In the reading layout it stays within reach at the top of the section. The video surfaces have no native controls and do not accept pointer or keyboard input.
- Short displays and reduced-motion preferences use ordinary document flow, with no pinned scroll distance. Reduced-motion video playback requires user action.
- Scroll transforms are updated only while the scene is in view; videos pause offscreen and in hidden tabs.

## Verification

- JavaScript syntax check passed.
- Taste source lint: zero failures; two warnings retained for functional outlined chapter/media buttons matching the existing Studio controls. The stack's separating border and shadow are intentional overlapping-frame treatment.
- Browser checks at CSS viewport sizes 1440×900, 1309×818, 768×1023, 390×845, 320×800 and 320×640.
- Confirmed full opacity of all entered cards, reverse navigation, 65ms word staggering, one playing video in pinned mode, and pause/resume.
- Checked light and dark themes; restored the original light preference and normal browser viewport after testing.
- At 320×800 the wrapped third heading/copy clears the video by about 15px. The compact navigation also clears the scene content.
- No browser console errors observed.
- Reduced-motion conditions and preference-change handling were reviewed in source; OS-level reduced-motion emulation was not available in this browser session.
- Existing narrow-screen overflow of about 5px comes from the later More Work links, outside the changed scene; the scene itself remains within the page width. That unrelated layout is unchanged.

Screenshots are in `preview-evidence/website-stack/`; `preview.png` shows the final stack at the normal browser size. The screenshot review found readable copy and a clear separation between the active card and the retained edges; tablet composition was adjusted to enlarge the video and narrow phones received additional copy clearance.

## Follow-up revisions

- Cloud depth is 0.5. Browser verification at progress 1 returned the expected front-layer transform of -27.54px / -124.8px for the inspected mobile hero.
- Removed native player controls from the markup and all responsive paths. Browser checks confirm `controls === false`, `pointer-events: none`, and no keyboard tab stop on all three videos at 320×640 and 390×845.
- Tapping a playing video leaves it playing; the separate button pauses all videos; tapping a paused video leaves it paused.
- Mobile cards now enter with a 620ms slide and fade. The first pinned card and all reading-layout cards use this entrance once; subsequent pinned cards retain the scroll-driven entrance. Reduced motion skips or cancels the added entrance.
- Observed the mobile entrance in progress: opacity 0.332 and a remaining translation of about 21px / 12px before it settled to the original layout.
- A full optimisation pass is requested after the remaining design work is finished. It has not been started as part of these visual changes.
# Motion follow-up — 30 October 2026

- Cloud depth is now **0.2** (previous audit screenshots/checks used 0.5).
- Entrance issue: the old observer waited for 8% of each block to enter, then
  started a zero-opacity/downward-offset animation on content already visible.
  Tall mobile blocks made that delay more apparent. Content below the viewport
  is now prepared before entry, with a consistent 24px viewport threshold,
  12px travel and compositor-only opacity/transform transitions. Initially visible
  or keyboard-focused content stays readable. Mobile video entrances use the
  same preparation principle; the pinned card choreography is retained.
- A shared hover pill follows the three navigation links using transform/opacity.
  It inherits the current navigation colours, retargets during quick hover changes,
  and updates instantly for keyboard focus/reduced motion. The contact button
  keeps its existing appearance. No continuous animation loop was added.
- Checked desktop 1440×900 and phone 390×845, natural scrolling, link focus,
  hover movement, theme switching, depth data, zero horizontal overflow and
  browser console errors (none observed). CMS/catalogue checks, JS syntax and
  packaged asset validation passed. Physical phone FPS is not established.
- Local preview only; not published.
- Proof: `preview-evidence/website-stack/nav-pill-and-entry.png`.

# Natural hero and anchored copy — 30 October 2026

- The Studio hero is no longer pinned or extended to 265–280 viewport heights.
  It occupies one normal hero height and moves with the first swipe. The existing
  0.2 depth drives small, different translations on sky, cloud layers and hands.
  Offscreen/hidden scenes do no scroll painting; settled values are cached.
- The parallax toggle only changes artwork. It no longer resizes the scene or
  adjusts scroll position. Reduced motion uses the static artwork and normal scroll.
- Studio, enquiry and the Little Joy case study now use a fixed light palette.
  Theme controls and preference listeners were removed; obsolete saved theme
  selection is cleared. The video site and independent concepts retain their palettes.
- The stack shows “Scroll to explore · N of 3 ↓”, then “Keep scrolling to continue”
  for the last chapter. It is hidden in the normal non-stacked reading layout.
- Matching measured title/description slots anchor headings across chapters.
  Titles retain their word stagger; descriptions crossfade through opacity only.
- Verified equal heading and paragraph top coordinates across all three chapters
  at 320, 390 and 1440 CSS pixels. Checked the 320×640 normal-layout fallback,
  cue progression, no horizontal overflow, and removal of the theme control.
- At 390×845 the hero is 845px tall with relative positioning. One scroll moved
  the hero up about 192px while hands and clouds translated at different rates.
- JS syntax and existing CMS/catalogue checks passed. No browser errors observed.
  Local preview only; these follow-up changes are not published.
- Proof: `preview-evidence/website-stack/natural-scroll-stable-copy.png`.

