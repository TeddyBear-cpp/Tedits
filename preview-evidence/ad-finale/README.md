# Ad finale — featured video update

## Content and delivery

- Selected `Teditstudio-ad-finale.mp4` from the user's Videos/Edits folder.
- Source: 30,244,080 bytes, 1080×1920, 30 fps, H.264 with AAC stereo audio,
  approximately 41 seconds. The source file was not changed.
- Web copy: `videos/teditstudio-ad-finale.mp4`, 7,463,905 bytes (75.3% smaller).
  Encoded with libx264, CRF 19, slow preset; audio copied without re-encoding.
  MP4 fast-start metadata supports playback without downloading the whole file.
- Poster: frame at 20 seconds, exported at 720×1280 as WebP, 42,386 bytes.
- The ad now occupies the featured hero. The previous TeditStudio Launch video
  is preserved as the first item in Selected Work. Seven videos in total.
- `index.html` and its compatibility preview remain identical. Both new media
  files are included by the release builder. Nothing was published.

## Layout and motion

- The featured frame follows the picture's 9:16 ratio. Custom controls get their
  own 94px space rather than reducing the portrait picture inside a landscape box.
- Existing fullscreen containment is retained; the portrait sizing override only
  applies outside fullscreen. Colour palette and other project videos are retained.
- Fixed the video-page entrance pattern: the old observer waited for 12% of a
  block to be visible, then reset it to opacity zero. Offscreen blocks are now
  prepared before entry and transition after a consistent 24px viewport threshold.
  Initially visible/focused content remains readable; reduced motion bypasses it.

## Verification

- Browser: 1440×900, 390×845 and 320×640 CSS pixels, zero horizontal overflow.
- Desktop featured picture measured approximately 266.8×474.3px: 9:16, uncropped.
- Phone card fits its 845px viewport when scrolled into view; controls remain usable.
- Featured playback, pause, mute/unmute and seek to end/start verified through UI.
- Browser decoded 1080×1920 video; duration approximately 41.24 seconds.
- Natural scrolling verified visible work cards reach full opacity; focused cards
  can be reached immediately. Original launch remains in the work grid.
- JS syntax checks passed. Fresh video-site build produced 39 files; all packaged
  local HTML/CSS/poster references passed validation. No form submissions were made.
- Updated the existing deployment runner's featured/count expectations and removed
  its stale requirement that every `preload="none"` video load before playback.
  That legacy browser runner was not executed; browser checks used the active preview.
- This verifies behavior and layout, not physical-phone FPS.

Evidence: `desktop.png`, `mobile.png`, and source-frame inspection images.
