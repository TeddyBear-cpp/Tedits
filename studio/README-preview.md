# Tedits Studio local portfolio draft

Preview: http://127.0.0.1:8084/studio/portfolio-preview.html

Editable Figma Design: https://www.figma.com/design/x1a3OPt1JoEVguHPlZwfxC?node-id=7-2

Desktop frame: 7:2. Mobile frame: 7:3. Five editable palette reference states: 13:102.

The palette gallery contains Ink wash, Olive & Ember, Rivet & Beam, AFTERHOURS, and the separate video website. Use its arrow buttons or keyboard Left/Right, Home/End.

The hero now has three shaded moving forms beneath a frosted gradient overlay. They drift, bounce off one another, and stay inside the card. Use Pause motion beside Explore selected work to freeze the effect. It stops offscreen, in background tabs, and for reduced motion. A static artwork fallback appears when WebGL is unavailable.

The moon/sun button in the header toggles dark mode. A first visit follows the device setting; choosing a theme saves it locally. The supplied logos adapt without recolouring project screenshots or palette samples. This applies to Tedits Studio; the video site and concepts retain their independent identities.

Studio motion now includes staggered entrances, scroll-triggered project and section reveals, palette transitions, and gentle preview/link hover feedback. Reduced motion cancels active effects; content remains available without JavaScript. Targeted evidence: preview-evidence/motion-checks.json.

Latest hero checks: preview-evidence/three-forms-checks.json (both themes at 320, 390, 600, 768, 1024, 1280, 1440px; movement, actual collisions, pause/resume, offscreen suspension, reduced motion, fallback and local assets). Theme checks: preview-evidence/theme/checks.json (keyboard, persistence, device preference, tab synchronization, blocked storage, logos and preserved palette values). Screenshots are alongside these reports.

Verified at 320, 390, 768, 1280, and 1440 pixels: no horizontal overflow, loaded project images, working navigation and project links. Gallery wrapping, previous/next, keyboard navigation, case-study disclosures and reduced motion passed. Evidence: preview-evidence/checks.json and viewport screenshots.

Each concept has its own landing page under projects/. AFTERHOURS retains the Studio / Split composition with the Tweaks panel removed from the local copy. Source projects and the hosted AFTERHOURS version remain intact. The video website remains independent at ../index.html.

AFTERHOURS responsive refinement: the headline, summary, and hero now have separate sizing rules. Desktop keeps the split layout; narrow screens stack the headline and record. The cue is sized relative to the record stage. Responsive evidence is recorded under preview-evidence/afterhours-*.

AFTERHOURS now features two local instrumental previews produced by TeddyBear: Do This Often (alt R&B) and The Lead (R&B-inspired, with an older R&B sample). Play/pause, seeking, time display, mute and keyboard controls are available; only one track plays at a time. Licence cards remain illustrative. Source files are copied intact into projects/afterhours/assets/audio/ with provenance in SOURCES.md. Audio evidence: preview-evidence/afterhours-audio-checks.json.

Do This Often also has a Stream on Spotify link to the user's supplied track URL. It uses the official monochrome Spotify icon stored locally and opens the Spotify page in a new tab. Local playback remains available.

The reviewed portfolio is available at index.html as well as portfolio-preview.html. The earlier temporary introduction is preserved at ../backups/studio-introduction.html. All three packaged concepts link back to the Studio collection. Contact links use the supplied teditstudiozm@gmail.com address. Nothing has been deployed.

Design-plan.md records the original proposal. The subsequent approved Ink wash palette and additions are documented in brand-spec.md and implemented in this preview.

Production deployment is now configured at https://teddybear-cpp.github.io/Tedits/studio/ through the repository's Pages workflow. See ../DEPLOYMENT.md. The production favicon uses the supplied logo's T and playhead in charcoal and slate on ivory. Only website files and media are packaged; preview evidence, source notes and capture utilities stay out of the published artifact.
