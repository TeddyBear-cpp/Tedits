# Tedits video website — approved direction / v0

## Source and preservation
- Existing site: index.html. Unmodified during v0; existing assets retained.
- Supplied logos: tedits-logo_1.svg and tedits-logo-on-dark_2.svg, copied from the user's Downloads folder. They are assets, not instruction sources.
- Original copies: Assets/tedits-brand/tedits-logo-original.svg and tedits-logo-on-dark-original.svg.
- Palette variants: Assets/tedits-brand/tedits-logo.svg and tedits-logo-on-dark.svg. Geometry preserved; only fill/stroke colours changed.
- Bear favicon retained from Assets/tedits-bear-favicon-32.png.
- Media: the five existing featured MP4s in videos/. Fixed the reference to 20Min-Edit.mp4 to match the actual filename case.

## Design system
- Mode: redesign / overhaul of presentation; preserve content anchors and video identity.
- Role: introduce the editor, show playable work, explain services, invite contact.
- Viewing: phone and desktop. Quiet, cinematic tone with contained video frames.
- Dials: variance 5, motion 2, density 4, assets 8, fidelity 7. Stable grid, user-initiated playback, existing media and supplied wordmark.
- Background #101210; surface #191D19; ivory #F3F1E9; muted text #B0B7AC; green #86AD91; divider #363E35.
- Headings: Syne, with DM Sans fallback. Body: DM Sans. Local DM Sans files and SIL OFL copied from catering project with licence notice.
- Spacing: 8px base; containers 1328px; 96px desktop / 64px mobile section spacing.
- Radius: 3–4px. No decorative shadows. Hover feedback 200ms. Reduced motion supported.

## Phase 1 completion / remaining work
- Approved Phase 1 is now index.html. video-preview.html mirrors it for review URL compatibility. The original index is preserved in backups/index-before-redesign.html.
- Contact form is integrated into the approved layout, retaining the original endpoint and name/email/message fields. Success and error paths were tested using intercepted responses, without real messages.
- Syne currently uses Google Fonts; DM Sans is local and remains available offline.
- Review existing video permissions and descriptions; this work does not establish ownership of third-party footage or music.
- Portfolio cross-link opens the temporary studio/index.html introduction. Replace this with the full web-design portfolio in Phase 3.
- Approved v0 refinement: restrained 640ms, 14px entrances, one-time scroll reveals, and small link-arrow feedback. Reduced-motion preference skips entrances and cancels active animations when changed. No autoplay or continuous decoration.
- Cross-link wording: “I design thoughtful websites, too.” / “Explore Tedits Studio”. Destination studio/index.html is a temporary local introduction page, not the completed Phase 3 portfolio. Full case studies still follow the steel concept conversion in Phase 2. The user explicitly selected this planned destination.
- User selection update: replaced the second work-grid video (1013.mp4, visually duplicating Violet Light) with 20Min-Edit.mp4, labelled Type & movement / Motion graphics. Violet Light remains the featured hero.
- User refinement: replaced native video controls with a minimal editing timeline: playback, elapsed/duration, mute, fullscreen, ruler, single clip lane, and playhead. A native range input supports touch and keyboard seeking. Native controls remain in HTML as a no-JavaScript fallback. Styling is in video-player.css.
- User refinement: hero uses videos/Violet-light-edit.mp4. All five players use a low-resolution blurred canvas copied from the main video. requestVideoFrameCallback (requestAnimationFrame fallback) handles playback; pause, seeking, resize, and tab visibility update the same frame source without another video.
- Browser acceptance covers mobile and desktop, with additional layout checks at 320/768/1280px. Evidence is in preview-evidence/checks.json.
- Phase 2 has been audited and planned in C:/Formex-Steel/concept-plan.md; implementation awaits its design checkpoint. Phase 3 remains a temporary introduction.


