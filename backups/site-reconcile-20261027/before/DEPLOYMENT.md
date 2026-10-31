# Tedits websites deployment

Public URL: https://teddybear-cpp.github.io/Tedits/

Studio portfolio: https://teddybear-cpp.github.io/Tedits/studio/

GitHub Pages uses the `Deploy Tedits websites` Actions workflow. Pushes to main that change website files trigger a deployment; it can also be run manually in Actions. Video and Studio retain independent homepages and styles, with reciprocal links.

Run `node build-video.cjs` followed by `node build-studio.cjs`. The first creates `_site-video` from an explicit list of video files; the second adds Studio and its three concept pages. Use a fresh checkout or an empty output directory. Only selected pages, styles, scripts and media are packaged. Backups, source notes, test evidence, Figma utilities and the original AFTERHOURS source checkout are excluded. Local HTML and CSS links are checked for missing files and exact filename case.

Then run `node build-sanity.cjs` to apply published Sanity homepage, portfolio and catalogue content to the packaged pages. An empty dataset preserves the checked-in defaults. API/network errors fail the build; use `--offline` only for deliberate local fallback builds. The Sanity publish webhook automatically dispatches the deployment workflow on `main`; drafts do not trigger it. See `studio-teditstudio/README.md` for setup, verification and deployment-token renewal (current expiration: November 16, 2026).

Production homepages remove preview noindex directives and receive canonical URLs; robots.txt and sitemap.xml include both homepages. Concepts retain fictional labels and noindex so they do not appear as real businesses in search. Studio's Figma capture helper is excluded. Its favicon reuses the T and playhead paths from the supplied logo in the Ink wash palette. The video-to-Studio link is restored by the second build step.

The contact form retains its existing Formspree endpoint. Automated verification simulates submissions; it does not send real enquiries or confirm mailbox delivery.

All five pages use `section-navigation.js` for in-page links. Short focal blocks are centred; tall content starts near the top of the viewport. Normal fragment URLs, keyboard focus, initial deep links and reduced-motion preferences remain supported. `navigation-check.cjs` checks the visible fragment links on mobile and desktop and measures key focal blocks.

To roll back, re-run a successful previous video deployment workflow, or revert the relevant deployment/source commit and push. Do not change Pages back to publishing the repository root: it contains other projects and local review artifacts.
