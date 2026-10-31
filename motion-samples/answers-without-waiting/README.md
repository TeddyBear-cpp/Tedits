# Answers, all together

An original four-second Remotion study for the Tedits Studio website-benefits cards.

## Review

The rendered video is `out/answers-loop.mp4`; the poster is `out/poster.png`.
Run `npm run preview`, then open <http://127.0.0.1:8091/>. The video loops automatically unless reduced motion is enabled; the player provides pause and scrubbing controls.

## Rebuild

```powershell
npm install
npm run typecheck
npm run render
```

The default renderer uses the installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Set `TEDITS_RENDER_BROWSER` to another compatible Chrome executable if needed.

For inspection frames only, run `node render.mjs --stills`. All motion comes from `src/motion.ts`; the 240-frame cycle is periodic, including the floating labels. Add `--all-frames` to refresh inspection frames alongside a full video render.

## Specification

1080 × 1080, 60fps, 240 frames, H.264 MP4, silent. Palette: #4A4A4A / #FFFFE3 / #CBCBCB / #6D8196. Fonts: the existing Tedits DM Sans and Syne files, with their included OFL notices.

Inspired by the timing and curved movement of the user-supplied Parto Motion reference. All illustration and animation code here is original. No reference footage is included in the rendered video. The orbiting ball and its trail were removed from both films at the user's request.

The three finished loops are integrated into the portfolio's website-benefits cards.
Keep these 1080p masters for editing. Run `npm run export-web` after rendering all
three films to create 720p website copies at the original 60 fps. This needs FFmpeg
on PATH, or an explicit `FFMPEG_PATH`. Export writes temporary files before replacing
the website copies; a failed encode leaves the existing copy intact.

## Second sample: Get found

A six-second local-search loop shares this project's runtime and brand assets. The original Answers video is unchanged.

- Render: `node render.mjs --get-found`
- Inspection frames: `node render.mjs --get-found --stills`
- Motion checks: `node --experimental-strip-types check-get-found.mjs`
- Output: `out/get-found-loop.mp4`, 1080 × 1080, 60fps, 360 frames, silent.
- Browser preview: <http://127.0.0.1:8091/get-found.html>
- Brief and timing: `GET-FOUND.md`.

## Third sample: Build trust

A six-second website, project-example and client-review loop. No orbiting ball or trail.

- Render: `node render.mjs --build-trust --all-frames`
- Motion checks: `node --experimental-strip-types check-build-trust.mjs`
- Output: `out/build-trust-loop.mp4`, 1080 × 1080, 60fps, 360 frames, silent.
- Browser preview: <http://127.0.0.1:8091/build-trust.html>
- Brief and timing: `BUILD-TRUST.md`.
