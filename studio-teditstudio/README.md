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

`seed.ndjson` contains only the existing public homepage copy and three concept entries.
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
- **Portfolio projects:** order, business category, title, summary, services,
  optional preview image with required alternative text, case study, and disclosure.
- **Olive & Ember menus:** reorderable menu tabs, headings, photos and nested dishes with dietary labels.
- **Rivet & Beam materials and promos:** reorderable cards, descriptions/specifications, photos, promo labels and enquiry categories.
- **AFTERHOURS tracks:** reorderable tracks, artist, genre, labels, credit notes, optional Spotify links and MP3 uploads. Existing local audio can be reused without uploading.
- Catalogue documents use fixed IDs. Removing an item from the array removes it from the next published build; each catalogue needs at least one item.
- Each project selects one of the three existing concept pages. Creating a new
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

Publishing in Sanity does not automatically deploy GitHub Pages. Once this integration
has been committed and deployed, run the existing **Deploy Tedits websites** GitHub
Actions workflow after publishing content. An automated webhook is not configured.
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

The integration preserves the existing page styles, keyboard tab navigation, enquiry form categories and audio transport controls. No new media downloads or dependency installs are required.
