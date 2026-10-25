# nicholaspjm.com

Portfolio site for Nicholas Marriott. Next.js 16 (App Router), TypeScript,
Tailwind v4, exported as static HTML.

## Pages

| Route | What it is |
| --- | --- |
| `/` | index — intro, selected works, sections, tools |
| `/work` | every project as a list, filterable by category |
| `/work/<slug>` | one project: media, credits, description |
| `/visual` | every image and clip on one page |
| `/cv` | performances, awards, press, teaching, education |
| `/info` | about and contact |
| `/sketches` | personal explorations |
| `/preview` | unlisted test page, noindex, linked from nowhere |

## Local dev

```bash
npm install
```

```bash
npm run dev
```

`predev` and `prebuild` run `scan-images` and `make-og-images` first, so the
media manifests and share cards are current before the server or build starts.

```bash
npm run build
```

Static export; output lands in `out/`.

## Content

Projects are one `.ts` file each in `src/content/projects/`, registered in
`_index.ts`. Media is picked up from the folders automatically — drop files in
`public/images/projects/<slug>/` and `public/videos/projects/<slug>/` and
`npm run scan-images` writes them into the manifests, along with video
dimensions and poster frames.

| Path | Holds |
| --- | --- |
| `src/content/projects/` | one file per project |
| `src/content/site.ts` | name, nav, social, contact, keywords |
| `src/content/tools.ts` | the tools list on the index |
| `content/cv.csv` | CV source — edit the spreadsheet, then `scan-images` |
| `src/content/editable-text.json` | copy and layout saved from the studio |
| `src/types/content.ts` | the content schema |

`npm run studio` serves an editor for the copy and image rows; what it saves
goes to `editable-text.json`.

## Deploy

Every push to `main` publishes twice: GitHub Pages (via Actions, served under
`/nicholaspjm-portfolio`) and Cloudflare (Git-connected, serving the apex
domain). Cloudflare's build lags the Pages mirror by a few minutes, so check
the mirror first when verifying a change.

## Scripts

| Script | Does |
| --- | --- |
| `scan-images` | media manifests, video dimensions, posters, CV from CSV |
| `og-images` | per-project share cards |
| `og-default` | the fallback share card |
| `convert-videos` | transcode source video to web `.mp4` |
| `new-project` | scaffold a project file and its media folders |
| `studio` | local copy/layout editor |

`scan-images`, `og-images` and `convert-videos` need `ffmpeg`/`ffprobe` and
`sharp`. Video dimensions are seeded from the committed manifest when ffprobe
is missing, so CI does not wipe them.

## Notes

- Body type is Arial, with a mono stack for technical data. No webfonts.
- The index backdrop is a physarum simulation on canvas, run in a worker.
- Source video originals are gitignored; only the web `.mp4`s are committed.
