# Tedits websites and Sanity CMS

[Live portfolio](https://teddybear-cpp.github.io/Tedits/studio/) · [CMS setup and content model](studio-teditstudio/README.md) · [Deployment](DEPLOYMENT.md)

The repository contains a video portfolio, a web design portfolio, and three business website concepts. The concepts have editable menus, materials/promotions and music catalogues backed by Sanity.

## CMS code walkthrough

- `studio-teditstudio/schemaTypes/`: homepage, portfolio projects and three catalogue schemas. Catalogue arrays determine item order; menus contain nested dishes.
- `studio-teditstudio/sanity.config.ts`: editor navigation and fixed catalogue document IDs.
- `build-sanity.cjs`: fetches published content and applies it to the packaged website.
- `catalogue-renderer.cjs`: validates catalogue content, escapes text, restricts media URLs and renders each concept's existing components.
- `studio/projects/`: source templates, styles and interactive controls.
- `.github/workflows/video-pages.yml`: builds and deploys to GitHub Pages.

Content stays in Sanity; code stays in GitHub. Draft edits are excluded from the public build. An absent catalogue uses the source template; invalid published data or an API failure stops deployment.

Start the CMS with `pnpm install --frozen-lockfile` and `pnpm dev` inside `studio-teditstudio`. The project and dataset IDs are public configuration; editing requires an authorized Sanity login. To adapt this for your own project, change those IDs in the Studio configuration and build scripts.

Run `node verify-sanity.cjs` and `node verify-catalogues.cjs` from the repository root. Run `pnpm exec tsc --noEmit` and `pnpm build` inside `studio-teditstudio`. Browser checks additionally require Playwright and Edge; their runtime path currently targets the development machine.

## Video site — Phase 1
The approved redesign is index.html. video-preview.html contains the same approved page for compatibility with the review URL. Styles: video-preview.css and video-player.css. Interactions: video-preview.js and contact.js.

From PowerShell in this folder:

```powershell
node preview-server.cjs
```

Open http://127.0.0.1:8084/index.html. The server listens only on this computer and supports byte-range video requests for scrubbing. If it is already running, open the URL without starting another copy. Stop it with Ctrl+C in its terminal.

The web-design cross-link opens the Studio portfolio at studio/index.html, with catering, fabrication and music concept pages.

## Preserved original
backups/index-before-redesign.html is the exact original source; all original assets and videos remain. The local preview server blocks the backups directory. To inspect the original visually, use a private temporary copy in the project root so its relative asset paths resolve; do not publish the backup.

## Contact
The original Formspree endpoint is retained. Local browser verification intercepts it with simulated success/error responses; no real messages were sent. A real user submission requires internet access and a functioning Formspree account/endpoint.

## Verification
preview-check.cjs runs Edge through the bundled Playwright runtime available on this machine. It creates preview-evidence/checks.json and screenshots. It covers mobile/desktop playback, scrubbing, mute, fullscreen, synchronized canvas frames, reduced motion, Studio navigation, mocked form outcomes, and extra layout checks at 320/768/1280px.

Existing video selections include third-party footage/music; confirm permission before making any new public use. Media credits are retained with the source projects.
