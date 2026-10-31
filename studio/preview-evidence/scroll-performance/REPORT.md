# Tedits Studio entrance-animation investigation

Scope: main portfolio only, local source at `/studio/index.html`. No subproject animation files changed. The production fix is confined to `studio.js` and `studio-motion.css`.

## Cause and repair

The original IntersectionObserver waits for 12% of a target to intersect before starting a Web Animations API entrance. Until then the content is fully visible. Starting the animation changes opacity from 1 to 0 and translates it down 20px, creating a visible disappearance/restart at the viewport edge. Instrumentation recorded this on 10 desktop and 12 mobile entrance targets.

Grouped rows also start all children's entrances together. At a slow mobile scroll, the first project description is still below the viewport when its parent triggers; its original entrance finishes before the reader reaches it.

The fix prepares pending elements with opacity 0 when JavaScript registers them, then starts their existing animation before removing that state. Lower group members are observed separately when still below the viewport. Geometry reads are collected before animation writes. The 12% threshold, 20px movement, 650ms duration, cubic-bezier(.2,.7,.2,1) easing and 90ms group stagger are retained. Completed targets are unobserved. Reduced motion reveals all pending content and cancels active motion; pages with JavaScript disabled remain readable.

No React, continuous scroll handler, or smooth-scroll library is present on the main portfolio. Navigation uses native scrolling with explicit anchor destinations. Preview images already reserve space with dimensions and aspect ratios. The hero uses WebGL and an 8px backdrop blur but pauses offscreen. No long main-thread tasks were recorded during these scroll runs; there was no evidence supporting a change to the hero, image loading, or hover animations.

## Measurements

Headless Microsoft Edge on the local Windows machine, no CPU/network throttling. Scripted downward scrolling by 16px per animation frame, with rAF timings, long-task and layout-shift observers. These are browser measurements at desktop/mobile viewport sizes, not physical-device tests. One before/after run per size; timing differences may reflect machine/browser scheduling and do not establish a repeatable FPS gain.

| Measurement | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | ---: | ---: | ---: | ---: |
| Viewport | 1440×900 | 1440×900 | 390×844 | 390×844 |
| Sampled frames | 304 | 304 | 350 | 350 |
| Visible frames before opacity reset: affected targets | 10 | 0 | 12 | 0 |
| 95th-percentile rAF interval (ms) | 33.5 | 17.0 | 33.6 | 16.8 |
| Intervals over 34ms | 1 | 0 | 1 | 0 |
| Scroll-period long tasks | 0 | 0 | 0 | 0 |
| Sum of observed layout-shift scores (load + scroll) | 0.000105 | 0.000048 | 0 | 0 |
| Replayed entrances after scrolling back | 0 | 0 | 0 | 0 |

Layout-shift values above are sums of entries without recent input, not the session-window CLS calculation. The very small desktop shifts occurred during loading. They are not evidence of a scrolling layout fix.

The full-page settled screenshots are pixel-identical before/after at both sizes, with the moving hero area masked in magenta for comparison. The magenta region is a test mask, not a design change. Dark-theme screenshots are additional visual checks, not baseline comparisons.

## Focused regression checks

`scroll-regression-check.cjs` compares the committed pre-fix JS/CSS with the working files at widths 1440 and 390 (height 900):

- Slow-scroll group handling: lower mobile copy waits for its own viewport entry.
- Work, Approach and About anchor destinations; browser Back; hash reload positioning and settled position stability. Reload comparisons allow 2px; click destinations must match exactly.
- Existing project hover lift, palette navigation, and case-study expansion.
- Reduced motion initially and when changed while the page is open; hero reduced-motion state; visible content with JavaScript disabled.
- JavaScript errors and settled screenshots.

Raw measurements: `before.json`, `after.json`. Regression outcomes: `regressions.json`.

## Review

Changes are local and have not been committed or deployed. Review at `http://127.0.0.1:8084/studio/index.html` while the preview server is running. The catering, fabrication, music, and video sites are outside this change.
