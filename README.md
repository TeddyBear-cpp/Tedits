# Tedits local websites

## Video site — Phase 1
The approved redesign is index.html. video-preview.html contains the same approved page for compatibility with the review URL. Styles: video-preview.css and video-player.css. Interactions: video-preview.js and contact.js.

From PowerShell in this folder:

```powershell
node preview-server.cjs
```

Open http://127.0.0.1:8084/index.html. The server listens only on this computer and supports byte-range video requests for scrubbing. If it is already running, open the URL without starting another copy. Stop it with Ctrl+C in its terminal.

The web-design cross-link opens studio/index.html, currently a temporary introduction page. The full Tedits Studio portfolio remains Phase 3, following the steel concept conversion.

## Preserved original
backups/index-before-redesign.html is the exact original source; all original assets and videos remain. The local preview server blocks the backups directory. To inspect the original visually, use a private temporary copy in the project root so its relative asset paths resolve; do not publish the backup.

## Contact
The original Formspree endpoint is retained. Local browser verification intercepts it with simulated success/error responses; no real messages were sent. A real user submission requires internet access and a functioning Formspree account/endpoint.

## Verification
preview-check.cjs runs Edge through the bundled Playwright runtime available on this machine. It creates preview-evidence/checks.json and screenshots. It covers mobile/desktop playback, scrubbing, mute, fullscreen, synchronized canvas frames, reduced motion, Studio navigation, mocked form outcomes, and extra layout checks at 320/768/1280px.

Existing video selections include third-party footage/music; confirm permission before making any new public use. No media files were deleted. Nothing has been deployed.
