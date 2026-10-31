# Reaching hands hero loop

An eight-second silent animation of the approved hands image, kept separate from the Tedits Studio page for review.

## Files

- `output/reaching-hands-loop.mp4` — H.264, 1440 × 810, 24 fps.
- `output/reaching-hands-loop.webm` — VP9 alternative.
- `output/poster.jpg` — still fallback for reduced motion.
- `preview.html` — looping browser preview with a pause control.
- `assets/` — original image, cloud-only plate, transparent hands, and still composite.
- `render.py` and `verify.py` — reproducible animation and seam checks.

The hands make a tiny reach-and-ease-back movement. Two low-opacity cloud layers and the cloud plate drift on finite periodic paths. Frame 0 equals the mathematical eight-second endpoint; the last-frame-to-first-frame difference equals the first-to-second-frame difference.

To rebuild on Windows, run `npm install`, install `requirements.txt` into Python, then run `python render.py` and `python verify.py`. `render.py` exports both video formats. `node_modules` is ignored by Git. The Studio page has not been edited.
