# Deploying

The site is a static export: `npm run build` writes the whole site to `out/`.
`prebuild` runs `scripts/scan-images.mjs` first, which regenerates every
optimized image from the `content/` tree, so a fresh clone builds a complete
site with no extra steps.

## Currently live

GitHub Pages, automatically on every push to `main`, at
`nicholaspjm.github.io/nicholaspjm-portfolio`. The workflow
(`.github/workflows/deploy.yml`) sets `NEXT_PUBLIC_BASE_PATH` because the site
sits on a project subpath there. Nothing to do by hand.

## Cloudflare Pages

A local `npm run build` produces a **root-path** build (no base path), which is
what Cloudflare and a custom domain want.

`wrangler.jsonc` is what makes this work. It declares the site as **static
assets** served from `out/`. Without it, `wrangler deploy` auto-detects
"Next.js", assumes a server app, runs the OpenNext adapter, and fails looking
for `.next/standalone/.next/server/pages-manifest.json` — which a static export
never produces.

### Option A: connect the Git repo (recommended)

No uploading, and it redeploys on every push. Cloudflare dashboard →
*Workers & Pages* → *Create* → *Connect to Git* → pick
`nicholaspjm/nicholaspjm-portfolio`, then:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Environment variables: none

Leave `NEXT_PUBLIC_BASE_PATH` unset so the build targets the domain root.

### Option B: deploy from this machine

```
npm run deploy-cloudflare
```

Builds, then uploads `out/` via `wrangler deploy`. The first run opens a
browser to authorise Wrangler against your Cloudflare account.

Validate config changes without deploying:

```
npx wrangler deploy --dry-run
```

### Do not drag the folder into the dashboard

The browser upload silently drops subdirectories on a payload this size,
publishing the HTML with no CSS, images, or routes. Use Option A or B.

### Keep source video out of `public/`

`public/` is copied verbatim into `out/` and uploaded. Only transcoded `.mp4`
files belong there; `.mov` originals live in `content/` (gitignored) or
`archive-video-originals/`. Leaving 19 stale `.mov` files in `public/videos`
had `out/` at 489MB instead of 235MB.

## Custom domain

Both hosts serve from the root, so no code change is needed for Cloudflare.
Attach the domain under the Pages project's *Custom domains* tab.

To put the domain on **GitHub Pages** instead, the build must stop using the
`/nicholaspjm-portfolio` base path and the repo needs a `CNAME` file; ask
before switching so the change is verified in one pass.
