# Cloud parallax study

Open `http://127.0.0.1:8086/hero-parallax/index.html`. To restart the preview later, run `node hero-parallax/preview.cjs` from the repository root.

The hands retain their pose and position inside a sticky scene. A distant sky and three cloud planes translate at different speeds with scroll progress, with a default depth of 1.2. Movement stops when scrolling settles; the ambient drift and moving sunlight have been removed. No video or external dependencies are needed. A depth slider and a headline toggle are available under the bottom-right control.

Motion off freezes the current parallax composition and collapses the scene to the hero's natural height. Turning motion back on restores the previous parallax progress. Reduced-motion preference defaults to the shorter static scene. The hero also fits short desktop windows so its motion control remains visible.

## Design decisions

- Standalone browser prototype using the approved blue-gray cloud direction and existing Tedits wordmark.
- Ivory page, a 30px rounded stage, local Syne and DM Sans, and minimal copy to keep attention on the interaction.
- Creative portfolio context: Jakub's restraint and polish with Jhey's scroll-based exploration. Parallax uses transforms on the four background/foreground planes. There are no continuous animations; the hands have no animation.
- Existing image assets: `../hero-animation/assets/cloud-plate.png` and `hands-cutout.png`.
- `assets/cloud-bank.png` was created with the built-in image generation tool as a transparent cloud overlay, then copied into this project. The full generation prompt is in `assets/cloud-bank-prompt.txt`.

The actual studio page is separate from this prototype.

## Browser check

Viewed the first, middle, and final scroll states in the in-app browser. All artwork loaded. The hands retained `transform: none`; foreground and background cloud transforms differed as intended. Verified the depth and headline controls and reversed the scroll.

At the 476px-high browser viewport, switching motion off reduced the scene from 1334px to 444px, exactly matching the hero height, while preserving its 16px screen position. Switching on restored the saved scroll progress. The default depth reads 1.2. The same shorter layout is selected by the reduced-motion listener. Screenshots and observed DOM states are in `evidence/`. The ambient check files document the superseded experiment; `rollback-check.json` documents the restored scroll-only version.
