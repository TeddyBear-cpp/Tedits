# Code quality, maintainability and performance review

30 October 2026 · Local changes only · No deployment or CMS edits

## Summary

The site has a reasonably small static runtime. Its main debt is accumulated redesign layers, duplicated content sources, obsolete previews and fragile release/test assumptions. Removing development folders alone would not make the website scroll faster.

The safe performance and release fixes below are implemented. Larger deletions and content migrations are separated into a staged cleanup plan because several apparently unused files still support CMS choices, editable artwork or old public URLs.

### Measured resource changes

| Resource | Before | After | Change |
|---|---:|---:|---:|
| Three story MP4s combined | 1,394,279 B | 610,402 B | 56.2% smaller |
| Video resolution and frame rate | 1080 × 1080 at 60 fps | 720 × 720 at 60 fps | 55.6% fewer decoded pixels per frame |
| Four project preview images | 1,451,338 B | 320,642 B | 77.9% smaller |
| Legacy JS copied into releases | 33,744 B | 0 B for these five files | Packaging cleanup; these files were not running on the homepage |
| Obsolete demo CSS | 4,107 B, 61 rules | Removed | Smaller active stylesheet |

The videos and images together save **1,914,573 bytes (1.91 MB)** when those assets are requested. This is not an assertion that all of them downloaded on the initial visit. The videos retain their original 4/6/6-second durations and 60 fps; editable 1080p masters remain preserved.

### Review coverage

- Inventory of 927 source, asset, documentation and evidence files before the optimization derivatives were created. Dependencies, Git internals, generated build/output directories and environment files were excluded from content scanning.
- Traced both public homepages, Studio enquiry, the legacy Why redirect, all five project entrypoints, Little Joy's multipage demo, shared navigation/theme/contact/player code, the three build stages, renderers, CMS schemas/seeds and motion source.
- Inspected package declarations and imports in the CMS, Remotion and legacy hero tool projects. Vendored third-party internals were not audited line by line.
- Static reference and duplicate-asset analysis; hashes establish exact duplicates. Reference scans do **not** establish that a file is safe to delete when CMS data or generated URLs can select it.
- Local release: 189 packaged files, approximately 103.3 MB, including the six existing video-portfolio works. That is artifact size, not initial page transfer.

## Findings and cleanup decisions

### 01 · High · Release manifest disagreed with the new homepage — FIXED

**Evidence:** [build-studio.cjs](</C:/Tedits portfolio/build-studio.cjs:7>) still selected `studio-story.js`; the homepage selected `studio-story-stack.js` and its CSS. Asset collection excluded MP4s.

**Why unnecessary/problematic:** The manifest retained the replaced implementation while omitting files the current page needs. Deployment would fail validation or, with validation bypassed, ship broken cards.

**Impact:** Restores a complete, reproducible release. The new MP4s and stack files now package correctly.

**Deletion risk:** Old JS still has historical inspection value; deleting source files is not needed to fix the release.

**Plan/status:** Corrected the manifest and MP4 extension list. Removed obsolete scripts from the release, preserved their sources. Verified the full build with published CMS content.

### 02 · High · Videos substantially exceed their displayed card size — FIXED

**Evidence:** [video-optimization.json](</C:/Tedits portfolio/audits/2026-10-30/video-optimization.json>) records the original and optimized files. Cards are capped around 580 CSS pixels on desktop and smaller on phones.

**Why unnecessary:** Every playing card decoded 1080-square frames even when the visible card was much smaller.

**Impact:** 783,877 fewer encoded bytes and 55.6% fewer pixels per decoded frame. This is a workload reduction, not a measured 55.6% FPS improvement.

**Deletion risk:** Reducing resolution can soften fine detail on high-density displays; reducing frame rate would affect the approved motion.

**Plan/status:** Exported 720-square H.264 copies at the same 60 fps, with fast-start metadata and no audio. Preserved all masters. Added [export-web.mjs](</C:/Tedits portfolio/motion-samples/answers-without-waiting/export-web.mjs>) so a future render can reproduce these copies without overwriting masters. All three files decode successfully at their original durations and frame counts; mobile and desktop previews were inspected.

### 03 · High · Normal reading layout could play multiple cards — FIXED

**Evidence:** [studio-story-stack.js](</C:/Tedits portfolio/studio/studio-story-stack.js>) previously played every video in an intersection set. `isIntersecting` alone did not enforce the intended 12% visibility threshold.

**Why unnecessary:** Two partially visible cards could consume decoder/compositor work simultaneously, including a card with only a sliver showing.

**Impact:** At most one of these videos now plays in either layout. Up to one extra decoder is avoided when cards overlap the viewport.

**Deletion risk:** Playing none or choosing the wrong card would make the section appear frozen; pause state and reduced-motion behavior must remain independent of visibility.

**Plan/status:** Track intersection ratios, require at least 12%, and select the greatest visible ratio in the normal layout. Retained active-chapter selection in the pinned layout, the single external button, hidden-tab suspension and reduced-motion opt-in.

### 04 · Medium · Scroll code repeated unchanged DOM writes — FIXED

**Evidence:** The story `paint()` function rewrote all card transforms, opacity, visibility, chapter classes and accessibility state on every scheduled scroll frame, even in settled phases.

**Why unnecessary:** Most of those values remain identical between chapter transitions. Unchanged writes add work and mutation noise.

**Impact:** Card styles are now cached; chapter and control attributes update only when their values differ. This reduces mutation work without changing timing or choreography. No standalone FPS number is claimed.

**Deletion risk:** A cache can become stale when the page switches from pinned to normal layout.

**Plan/status:** Clear the style cache when resetting the layout. Verified desktop-to-short-mobile transitions, chapter buttons and pause/resume.

### 05 · Medium · Compositing hints persisted offscreen — FIXED

**Evidence:** Cloud planes and pinned cards used unconditional `will-change: transform` in [studio-rounded.css](</C:/Tedits portfolio/studio/studio-rounded.css>) and [studio-story-stack.css](</C:/Tedits portfolio/studio/studio-story-stack.css>).

**Why unnecessary:** Permanent promotion hints can retain large compositing surfaces after the user has left a scene.

**Impact:** Hints now apply near the cloud scene or while the card scene intersects. Cloud easing also cancels when the document is hidden. Actual GPU memory savings depend on the browser and were not measured.

**Deletion risk:** Promoting too late could create a first-scroll hitch; removing cloud layers would alter the approved design.

**Plan/status:** Used an intersection margin for cloud preparation and retained all layers, depth 0.5 and the existing easing. DOM inspection confirmed offscreen cloud hints return to `auto`.

### 06 · Medium · Heavy lossless preview images — FIXED

**Evidence:** [image-optimization.json](</C:/Tedits portfolio/audits/2026-10-30/image-optimization.json>) covers Olive & Ember, Rivet & Beam, AFTERHOURS and Little Joy previews.

**Why unnecessary:** PNG is expensive for these photographic website captures. The first below-fold project image also lacked lazy loading in the checked-in homepage.

**Impact:** 1,130,696 fewer bytes across the four requested images. All project previews now load lazily on the homepage.

**Deletion risk:** Blindly removing PNGs breaks older local previews; the CMS renderer can also restore old image paths on deployment.

**Plan/status:** Added same-dimension WebP derivatives at quality 90, updated public HTML and CMS defaults, and excluded the original preview PNGs from packaging. Originals remain for design work. Verified the CMS-built page loads the new previews.

### 07 · Medium · Replaced runtime scripts and unused enquiry enhancement — RELEASE CLEANED

**Evidence:** `studio/studio.js` (6,752 B), `studio-hero.js` (8,734 B), `studio-waves.js` (9,435 B), `studio-story.js` (7,287 B), and `studio-services.js` (1,536 B) total 33,744 B in the initial inventory.

**Why unnecessary:** The public homepage no longer uses the palette gallery/WebGL hero/old story implementation. Waves have no current script reference. The enquiry page loaded the services rotation script but has no `business-rotation` target, so it immediately returned.

**Impact:** Five fewer files in release artifacts; one fewer script request on enquiry. Excluding scripts that were already unreferenced does not itself improve homepage FPS.

**Deletion risk:** `studio.js` remains referenced by local preview HTML. Historical visual studies may still be valuable.

**Plan/status:** Removed all five from packaging and the inert enquiry script tag. Recommend moving replaced sources and their matching previews together into a documented archive before any permanent deletion.

### 08 · Medium · Old card demo UI remained in the active CSS — FIXED

**Evidence:** `.story-browser*` and `.demo-*` rules styled the replaced Olive & Ember mock browser. Current card markup uses `.story-video-card`; the old selectors were absent from current public HTML.

**Why unnecessary:** The demo no longer exists in the page, and responsive variants continued to add obsolete overrides.

**Impact:** Removed 61 rules, 4,107 bytes. Less CSS to parse and maintain; no dramatic FPS benefit is implied.

**Deletion risk:** A legacy visual fixture could depend on those rules.

**Plan/status:** Removed these specific selector families only; kept shared story typography, layout, controls and reduced-motion rules. Preserved the pre-edit stylesheet locally in the audit backup.

### 09 · Medium · Stylesheets accumulate competing redesign layers — RECOMMENDED

**Evidence:** [studio/index.html](</C:/Tedits portfolio/studio/index.html:10>) loads base, motion, old hero, theme, contact, rounded, story, stack and UI styles. For example, old story rules hide chapters while newer stack rules restore their visibility; the rounded gallery is overridden again by the story layout.

**Why unnecessary:** Some historical rules cannot affect the current page; others still provide shared styles. The cascade makes a small change hard to reason about.

**Impact:** Medium maintainability gain and modest request/parse savings. Exact removable bytes require selector coverage across all shared pages and states.

**Deletion risk:** `studio-hero.css` also contains shared contact styles; `studio-services.css` still supplies enquiry styles. Deleting by filename would break legitimate UI.

**Plan:** Build a page-to-style ownership map. Extract current shared tokens/type/nav/contact, then consolidate homepage layout into one owned sheet and enquiry styles into another. Compare light/dark, open menus/details, reduced motion and responsive layouts before deleting each legacy layer. Do not purge dynamic classes solely from static scans.

### 10 · Medium · Small-screen grid overflow — FIXED

**Evidence:** `.more-work-links a` used an implicit minimum-width `1fr` text column alongside fixed image/arrow columns. Earlier 320px checks showed approximately 5px overflow.

**Why unnecessary:** The grid text's intrinsic minimum forced the card wider than its available space.

**Impact:** Eliminates sideways overflow in the verified 320px layout.

**Deletion risk:** Hiding global overflow would conceal content and mask the cause.

**Plan/status:** Changed only the text track to `minmax(0,1fr)` and allowed long text to wrap. Verified zero document overflow at 320, 390 and 1440 CSS pixels.

### 11 · Medium · Legacy CMS fields are presented as live page controls — RECOMMENDED

**Evidence:** [servicePages.ts](</C:/Tedits portfolio/studio-teditstudio/schemaTypes/servicePages.ts:23>) exposes Why-page hero, problems, outcomes, reasons, steps and SEO fields. Production [applyServicePages()](</C:/Tedits portfolio/service-page-renderer.cjs:109>) uses that document for offer facts and business examples, not those old page sections. [applyWhyPage()](</C:/Tedits portfolio/service-page-renderer.cjs:67>) is only retained/exported for older fixtures and tests.

**Why unnecessary:** Editors can change fields that no longer affect the public page. The `featured` project flag also only controls the legacy full-gallery label, while the current curated homepage uses independent-concept labels.

**Impact:** High clarity gain for CMS editing; smaller schema and build logic. Runtime performance impact is negligible because CMS rendering happens at build time.

**Deletion risk:** Removing the whole `whyPage` document loses live pricing, revisions, timeline and rotating business examples. Deleting fields can discard editorial content.

**Plan:** Export current documents first. Relabel the live subset as offer/business settings, hide or mark retired fields, migrate useful content once, then retire `applyWhyPage` and its legacy fixtures. Keep the public Why redirect.

### 12 · Medium · Broken homepage seed generation command — RECOMMENDED

**Evidence:** [generate-seed.cjs](</C:/Tedits portfolio/studio-teditstudio/generate-seed.cjs:21>) expects five `<article class="project…">` blocks in a fixed order. Current homepage has three `story-reveal project` articles and two compact links. A read-only match check finds zero matching articles.

**Why unnecessary/problematic:** The advertised command cannot regenerate seeds from the current layout. Changing only the class regex would still omit the two compact projects and much of their original content.

**Impact:** Prevents future setup/maintenance failures. No visitor-side speed gain.

**Deletion risk:** `seed.ndjson` itself remains active input to build migrations. Removing it breaks the build; running a guessed generator could overwrite curated defaults.

**Plan:** Choose structured source data as the seed authority. Generate both full and compact cards from it, or explicitly retire the extraction command and document the preserved seed. Do not regenerate/import production data during cleanup. The command was inspected, not run.

### 13 · Medium · Build contains permanent content migrations and two layouts — RECOMMENDED

**Evidence:** [build-sanity.cjs](</C:/Tedits portfolio/build-sanity.cjs:54>) contains `migrateProject()`, legacy hero detection, story-description substitutions and old-gallery rendering. [service-page-renderer.cjs](</C:/Tedits portfolio/service-page-renderer.cjs:67>) retains the old Why renderer.

**Why unnecessary:** Every deployment continues to interpret old copy and layout history rather than rendering one explicit current model.

**Impact:** Fewer branches and less risk of silently replacing intentional CMS edits. Build-time performance gains would be small.

**Deletion risk:** Published documents still contain historical defaults; removing migrations first could restore outdated text. Existing tests exercise these compatibility paths.

**Plan:** Export and compare the live documents, apply a reviewed one-time content migration, record a schema/content version, then remove only superseded branches and replace compatibility assertions with current-contract tests. No CMS mutation was performed here.

### 14 · Medium · Duplicate asset bytes and font identities — RECOMMENDED

**Evidence:** SHA-256 groups in [inventory.json](</C:/Tedits portfolio/audits/2026-10-30/inventory.json>) identify **979,632 redundant bytes** across exact font copies. DM Sans regular and semibold each appear under six different paths; Syne is duplicated between root and Studio; catering/Tedeats share an identical display font.

**Why unnecessary:** Different URLs prevent the browser from reusing one cached resource when visitors move between these pages.

**Impact:** Up to approximately 0.98 MB of public font-file duplication can be consolidated; actual transferred savings depend on which pages and weights are visited.

**Deletion risk:** Concept folders currently work as independent exports. Repointing them all to a shared parent breaks that portability. Similar font filenames are not sufficient evidence; only the hashed matches qualify.

**Plan:** Share fonts between the two portfolio shells first; retain their OFL notices. Decide whether concepts must remain self-contained before consolidating their copies. Update HTML preloads, every CSS URL and packaging together. No fonts were deleted in this pass.

### 15 · Medium · Asset collection is broader than the active site — PARTLY CLEANED

**Evidence:** [collectAssets()](</C:/Tedits portfolio/build-studio.cjs:30>) copies every matching asset extension in selected folders. Tedeats contains older `envelope-paper.jpg`, `envelope-wax-seal-small.png`, `reception-stock.jpg` and four generated WebPs with no static current-page reference. The first inventory found 17 media candidates without static references, totaling 10.32 MB.

**Why unnecessary:** This mixes source alternatives and delivery assets in the public artifact.

**Impact:** Removing verified alternatives reduces artifact size and review noise. Unrequested assets do not slow scrolling merely by existing on the server.

**Deletion risk:** The 10.32 MB is **not a safe deletion total**: it includes dynamic catalogue images and a Windows filename-case false negative for the 20-minute video. [catalogue-renderer.cjs](</C:/Tedits portfolio/catalogue-renderer.cjs:5>) and client choice data refer to assets that static HTML cannot expose.

**Plan/status:** Excluded the five proven design-only preview PNGs from releases. Next, combine HTML/CSS/JS references with CMS fallback allowlists and published data; archive confirmed alternatives, then generate an explicit asset manifest. Keep licences and source notices with masters.

### 16 · Medium · Stale/nonportable browser checks — PARTLY FIXED

**Evidence:** [story-check.cjs](</C:/Tedits portfolio/studio/story-check.cjs:20>) expects `.story-browser`; [scroll-performance-check.cjs](</C:/Tedits portfolio/studio/scroll-performance-check.cjs:69>) dereferences removed `.hero-art`. Several checks hardcode a developer-machine Playwright installation and Edge path. `verify-sanity.cjs` still asserted the old script filename.

**Why unnecessary/problematic:** These tests describe an older page and can fail for irrelevant reasons or provide misleading reassurance. The performance probe also performs substantial geometry/style reads itself.

**Impact:** More trustworthy release gates and easier maintenance on another machine. Does not change runtime speed.

**Deletion risk:** Throwing away all older checks can lose real regression coverage for navigation, forms and reduced motion.

**Plan/status:** Updated the current CMS assertions to require the stack CSS/JS and all three videos; added existing CMS/catalogue checks to CI. Recommend one portable browser test setup, current selectors and a small set of representative scenarios. Archive obsolete one-off scripts after their useful assertions have been transferred. Existing old browser runners were not executed.

### 17 · Medium · Validation stopped before CMS output — FIXED

**Evidence:** The original asset check ran inside Studio packaging, before `build-sanity.cjs` rewrote HTML. It also omitted video `poster` references and repeatedly searched an array of filenames.

**Why unnecessary/problematic:** The deployed artifact could differ from the artifact that passed validation. Duplicate validation implementations would drift.

**Impact:** Missing local files, filename-case errors and missing posters are now checked on final CMS-rendered HTML/CSS. Set-based lookups simplify validation; this is build reliability, not visitor-side optimization.

**Deletion risk:** Remote media URLs must remain legal, and a validation change must not rewrite content.

**Plan/status:** Extracted [validate-output.cjs](</C:/Tedits portfolio/validate-output.cjs>), called it from both stages and exposed a standalone command. Full online CMS build and independent final validation pass. JS-generated asset references still need explicit coverage; this checker is not a complete JavaScript dependency parser.

### 18 · Medium · Fixed output directory makes local verification awkward — FIXED

**Evidence:** All three build stages independently embedded `_site-video`, and the first correctly refused nonempty output.

**Why unnecessary:** Verification otherwise requires moving/deleting an existing build or making another source checkout.

**Impact:** Repeatable release checks without disturbing an earlier output directory.

**Deletion risk:** An arbitrary output path could overwrite source files or write outside the workspace.

**Plan/status:** Added [build-paths.cjs](</C:/Tedits portfolio/build-paths.cjs>) and optional `TEDITS_BUILD_DIR`. The default is unchanged; output must be a child of this workspace, and the first build still refuses nonempty output. Audit builds and rollback copies are ignored by Git.

### 19 · Low · Repeated helper and interaction logic — RECOMMENDED

**Evidence:** HTML escaping appears in all three renderers, with a meaningful difference in null handling. Business-text rotation exists in multiple old Studio scripts. Form submission/status logic appears in the two live forms; anchor handling exists in shared code and the standalone concepts.

**Why unnecessary:** Unowned duplicate implementations can diverge. However, the two forms and several concept interactions have distinct workflows; superficial similarity is not enough to merge them.

**Impact:** Modest reduction in code and easier policy changes; little direct speed gain.

**Deletion risk:** Merging escaping without preserving null semantics or removing validation creates security/correctness regressions. A universal form or animation framework would add complexity.

**Plan:** Consolidate exact renderer escaping/validation primitives when touching those modules next, retaining malicious-input tests. Archive old rotation implementations with their pages. Share only identical contact/network primitives; keep form state machines separate. Preserve focus, history and native fallback behavior in anchor handlers.

### 20 · Low · Disconnected previews, archives and documentation — RECOMMENDED

**Evidence:** `studio/portfolio-preview.html`, `hero-fullbleed-preview.html`, `studio/afterhours-source/`, `hero-animation/`, `hero-parallax/`, `garden-gpt-image-2/`, `output/` and many evidence scripts are outside the release. Initial inventory: backups 112.36 MB; root preview evidence 5.35 MB. [brand-spec.md](</C:/Tedits portfolio/studio/brand-spec.md>) still describes palette UI, old hero forms and older layout specifications. The motion README still described the samples as unintegrated; that part has been corrected.

**Why unnecessary:** Without a clear archive boundary, a maintainer can edit an obsolete copy and mistake it for production. `studio.js` can also fail in old previews missing its palette controls.

**Impact:** High navigation/maintenance clarity; potentially substantial workspace disk savings, **zero direct visitor FPS benefit** from deleting unshipped evidence.

**Deletion risk:** Masters, attribution, editable design sources and rollback snapshots are valuable user work. Untracked does not mean disposable.

**Plan:** Add an archive index labeling current entrypoints, historical studies, evidence retention and rebuild instructions. Keep one current preview route. Move matched obsolete HTML/CSS/JS sets together. Retain source/licence material; delete only reproducible caches with a known regeneration command. Do not bulk-delete backups or artwork.

### 21 · Medium · Continuous scroll engine clock merits profiling — INVESTIGATE, RETAINED

**Evidence:** [smooth-scroll.js](</C:/Tedits portfolio/smooth-scroll.js:48>) enables Lenis `autoRaf`. Cloud and story handlers also schedule their own work. Current cloud easing already sleeps when settled, and story painting is restricted to its intersecting scene.

**Why potentially unnecessary:** A persistent animation clock may be unnecessary at rest, but its existence alone does not establish a bottleneck.

**Impact:** Unknown until foreground/device profiling. Suspending hidden-tab clocks or coordinating render ticks may reduce work; a native-only scroll mode may be lighter.

**Deletion risk:** Removing Lenis changes the approved scrolling feel, anchor behavior, lock coordination and scene controls. It is actively loaded and is **not an unused dependency**.

**Plan:** Profile real phone scrolling and idle CPU, compare the same scene with native scrolling, then alter the scheduler only if there is evidence. Keep scroll restoration, modal locks, keyboard cancellation and reduced-motion behavior covered. No speculative global scroll-engine rewrite was made.

### 22 · Low/Medium · Large video portfolio files are delivery candidates, not dead content — RECOMMENDED

**Evidence:** Six root portfolio MP4s total 81.67 MB, around 79% of the local release artifact. Each is referenced by the approved video homepage. [video-preview.js](</C:/Tedits portfolio/video-preview.js>) already uses one playback clock, mutual exclusion and a small 96px-wide backdrop canvas with video-frame callbacks.

**Why review this:** These are the largest delivery assets. The existing 96px backdrop is already a deliberate optimization; replacing it wholesale would be unjustified.

**Impact:** Separate web-delivery encodes could substantially reduce video transfer, but no size/quality target has been measured for these authored works.

**Deletion risk:** These are portfolio content and contain intentional image/audio quality. Removing them would remove value; automatic recompression could damage the work.

**Plan:** Preserve masters, compare smaller delivery encodes visually and aurally, keep playback on demand and test seeking. Do not treat artifact size as eager download size or call these files abandoned.

## Categories with no confirmed removal candidate

- **Database queries / APIs:** This is a static site, not a database-backed application server. No SQL/ORM layer or unused application API routes were found. Sanity makes one batched build-time request; browsers do not query Sanity on each visit. The two live form POSTs are user-triggered, with duplicate-submission guards. No redundant polling was found. Narrowing old CMS field projection would reduce a small build payload, not fix browser lag.
- **Unused dependencies/imports:** No confirmed unused declared dependency in the active CMS or Remotion source. React/Sanity/styled-components support the editor; Remotion/bundler/renderer/fonts support asset creation. They do not ship as the Studio homepage runtime. The Windows FFmpeg installer belongs to the historical hero tool; archive that tool with its dependency rather than delete a package independently. No broad dependency update or install was performed.
- **Unused functions/variables:** Replaced whole implementations are identified above. No additional high-confidence live function/import/variable was deleted on name-count evidence alone. HTML handlers, dynamic CMS content and separate script scopes make naive searches unreliable.
- **Unused routes/components:** The Why URL is a deliberate compatibility redirect; the five concepts and Little Joy demo pages remain linked. Their navigation, form demos, media controls, credits and licences provide current value. Figma scripts are editor function bodies, not broken Node applications.

## Recommended cleanup order

1. **Release safety and resource work — completed locally:** corrected packaging; optimized delivery assets; one visible video; cached DOM updates; scene-scoped compositing hints; obsolete card CSS removal; overflow fix; final-output validation; current CMS checks in CI; reproducible web-video export.
2. **Archive boundary:** document entrypoints, label old previews and pair their source files. Preserve originals and attribution. Review individual deletion candidates against the asset graph and CMS allowlists.
3. **CMS cleanup:** export documents, separate live offer settings from retired Why fields, repair/retire the seed extractor, and perform one reviewed content migration. Then remove legacy render branches and dead fixtures.
4. **Styles and shared assets:** consolidate the current CSS cascade page by page; deduplicate identical portfolio-shell fonts; decide concept portability before sharing their assets.
5. **Portable quality gates and device profiling:** replace stale browser runners, retain meaningful form/navigation checks, and measure actual phone frame timing before altering Lenis or reducing visual fidelity further.

## Verification and limits

- `node verify-sanity.cjs` passed: current projects, compact extras, escaping, visibility, offers, legacy redirect and enquiry contracts; now also preserves stack assets/videos.
- `node verify-catalogues.cjs` passed: catalogue rendering, reorder, escaping and validation.
- A fresh isolated video + Studio + **online published Sanity** build passed, followed by `node validate-output.cjs`: 189 files, all checked local HTML/CSS/poster references resolve. Existing `_site-video` was preserved.
- 66 ordinary JS/CJS/MJS files passed syntax inspection at scan time. Two Figma snippets additionally parse as async function bodies, their intended context. The new video export script passed syntax checking and was successfully run against all three masters.
- FFmpeg decoded all optimized videos without errors: 360/240/360 frames, 6/4/6 seconds, 720 × 720, 60 fps, no audio.
- Browser checks on the CMS-built release at 1440 × 900, 390 × 845 and 320 × 640: current chapter selection, one playing video, separate pause/resume button, native controls disabled, normal mobile layout, no horizontal overflow, loaded WebP previews, compact nav placement and cloud depth 0.5. Motion-off hero shrank from 2239px to 845px at the checked phone size. Theme switching worked and was restored to light. No browser console errors were observed in the inspected release page.
- A local frame-sampling probe produced approximately one-second scheduling gaps without corresponding long tasks in the embedded test browser. This is **not a reliable physical-device benchmark**. No before/after FPS, Lighthouse score, Core Web Vitals pass or guarantee of zero lag is claimed. The verified gains are asset sizes, decoded pixel workload and runtime behavior. Real-device profiling remains the gate for more invasive motion changes.
- No real enquiries were submitted; no CMS documents, deployed website, Git history, backups or artwork masters were deleted or published.

### Evidence

- [Inventory and exact duplicate groups](</C:/Tedits portfolio/audits/2026-10-30/inventory.json>)
- [Video sizes](</C:/Tedits portfolio/audits/2026-10-30/video-optimization.json>) · [Image sizes](</C:/Tedits portfolio/audits/2026-10-30/image-optimization.json>)
- [Release verification and packaged file manifest](</C:/Tedits portfolio/audits/2026-10-30/release-verification.json>)
- [Desktop screenshot](</C:/Tedits portfolio/audits/2026-10-30/optimized-desktop.png>) · [Mobile screenshot](</C:/Tedits portfolio/audits/2026-10-30/optimized-mobile.png>)

Pre-optimization copies of edited motion assets/styles are retained under the ignored local `audits/2026-10-30/before/` folder. Larger source originals remain in their existing design and motion folders. Applied changes can therefore be reviewed independently from the recommended later deletions.

**Local cleanup limitation:** Automatic approval review rejected removal of the two generated audit directories, `audits/2026-10-30/build/` and `audits/2026-10-30/build-final/`, reporting only “blocked by policy.” Their resolved workspace paths and generated homepage files were checked before the attempted removal. Both directories therefore remain local and ignored by Git (about 207 MB combined); they are reproducible verification output, not additional source. The original `_site-video` was not targeted. The temporary instrumentation server was stopped and its source files removed.
