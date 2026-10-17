# Video website deployment

Public URL: https://teddybear-cpp.github.io/Tedits/

GitHub Pages uses the `Deploy video website` Actions workflow. Pushes to main that change video-site files trigger a deployment; it can also be run manually in Actions.

`node build-video.cjs` creates `_site-video` from an explicit list of required files. Use a fresh checkout or an empty output directory. The output includes the five videos, player, form, logos and font assets. Studio, concepts, backups, source notes and test evidence are excluded.

The production HTML removes the local preview's noindex directive and adds a canonical URL, robots.txt and sitemap.xml. The local website remains unchanged. Until the separate Studio portfolio is deployed, the web-design link opens a web-design enquiry to teditstudiozm@gmail.com. Replace this production substitution with the portfolio's public URL when available.

The contact form retains its existing Formspree endpoint. Automated verification simulates submissions; it does not send real enquiries or confirm mailbox delivery.

To roll back, re-run a successful previous video deployment workflow, or revert the relevant deployment/source commit and push. Do not change Pages back to publishing the repository root: it contains other projects and local review artifacts.
