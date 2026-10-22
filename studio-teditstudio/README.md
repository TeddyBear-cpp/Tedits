# Tedits Studio CMS

Standalone Sanity Studio for project `yjcpyptx`, dataset `production`.
The existing `../studio/` directory is the public HTML website, not the CMS editor.
This folder is a separate React application; the public site remains HTML/CSS/JavaScript.

## Run the editor

From this folder:

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

Open http://127.0.0.1:3333 and sign in with the Sanity account that owns teditstudio.
If Sanity requests an allowed origin, add this exact local origin for Studio login
in the project's API settings (credentials enabled). Do not allow wildcard origins.

## Populate existing content

`seed.ndjson` contains only the existing public homepage copy and four concept entries.
To import it, authenticate the local CLI and run:

```sh
pnpm run login
pnpm run seed
```

The import uses `--missing`, so existing documents with the same IDs are preserved.
These seed documents are published documents. Sanity's public dataset must contain
only content intended for public reading; keep credentials and private notes out.

## Editing

- **Homepage:** hero headline, introduction, and search metadata. A single fixed document.
- **Why Teditstudio:** rotating business examples, hero introduction, problem and benefit lists, process steps, starting price, revision count, timeline and search metadata. A single fixed document.
- **Enquiry page:** introduction and search metadata. The quote form fields and Formspree destination live in `../studio/enquire.html` so the published CMS cannot change where enquiries are sent.
- **Portfolio projects:** order, visibility, featured label, business category, title, summary, services, optional preview image with required alternative text, case study, and disclosure.
- **Olive & Ember menus:** reorderable menu tabs, headings, photos and nested dishes with dietary labels. Optional Monday–Saturday photo set controls the weekly meal-prep stack; if omitted, the page keeps its local photos.
- **Rivet & Beam materials and promos:** reorderable cards, descriptions/specifications, photos, availability, optional promo labels and start/end dates, and enquiry categories. Promo date windows are evaluated when the site is built; a later content publish triggers another build.
- **AFTERHOURS tracks:** reorderable tracks, artist, genre, labels, release status/date, featured label, credit notes, optional Spotify links and MP3 uploads. Existing local audio can be reused without uploading.
- Catalogue documents use fixed IDs. Removing an item from the array removes it from the next published build; each catalogue needs at least one item.
- Each project selects one of the four existing concepts. Creating a new
  type of concept requires building its page and updating the allowed options and renderer.
- Keep one published entry per concept. Duplicate selections fail the website build.
- Changes are drafts until **Publish**. The website build requests only published content.
- With an empty dataset the checked-in homepage and cards remain available.
- There is no live draft preview yet. Check the local packaged site after a build.

## Build and publish the public website

From the repository root:

```sh
node build-video.cjs
node build-studio.cjs
node build-sanity.cjs
```

The last command fetches published content from Sanity and updates the packaged
portfolio homepage and all three concept catalogues. Source HTML remains the fallback when a catalogue document is absent. No API token or
browser CORS access is required for this server-side fetch from a public dataset.
For a local build without network access, use `node build-sanity.cjs --offline`.
Network/API failures stop a normal build instead of silently deploying stale content.

Publishing in Sanity automatically starts the **Deploy Tedits websites** GitHub Actions
workflow through the enabled **Deploy Tedits published content** webhook. It listens
to create/update/delete events for the five website document types in `production`;
drafts and content versions are excluded. Its payload dispatches the workflow on `main`.
The webhook stores a fine-grained GitHub token with Actions read/write access to
`TeddyBear-cpp/Tedits` only (plus required read-only metadata). It cannot write code.
The current token expires **November 16, 2026**; renew it in GitHub and update the
webhook Authorization header before then. Never copy the token into this repository.
The workflow can also be run manually in GitHub Actions.
The separately hosted AFTERHOURS concept on chatgpt.site is not connected by this change.

## Verify / host the editor

```sh
pnpm exec tsc --noEmit
pnpm run build
pnpm run deploy
```

Deploying the editor requires CLI authentication and choosing an available Sanity
Studio hostname. Hosting the editor and deploying the website are separate actions.
Never commit authentication tokens or `.env` files. `sanity.cli.ts` contains public
project identifiers only. `pnpm-lock.yaml` pins the installed dependency versions.

## Catalogue setup and checks

`catalogues.ndjson` contains three new documents sourced from the concept pages. Import with
`pnpm exec sanity datasets import -p yjcpyptx -d production catalogues.ndjson --missing`
from this directory. It does not overwrite existing documents. Do not use replace mode for routine setup.

From the repository root, run `node verify-catalogues.cjs` for rendering and validation checks.
After packaging and fetching published content, `node check-catalogue-browser.cjs` checks desktop/mobile menus, enquiry links and audio playback using the installed local Playwright runtime.
The browser check expects the initial sample menu labels and order; update it when intentionally changing that sample content.

`node verify-live-catalogues.cjs` from the repository root compares all three live
catalogues with published Sanity content. For an end-to-end publish check, run
`pnpm exec sanity exec check-publish-webhook.mjs --with-user-token` here after CLI
login. It creates and removes a temporary, non-routed catalogue document; both events
trigger deployments while page content stays unchanged. Confirm successful runs in
GitHub Actions. Do not interrupt this check between creation and cleanup.

The integration preserves the existing page styles, keyboard tab navigation, enquiry form categories and audio transport controls. No new media downloads or dependency installs are required.
