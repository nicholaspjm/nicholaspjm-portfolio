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

### Option A: connect the Git repo (recommended)

No uploading at all, and it redeploys itself on every push.

Cloudflare dashboard → *Workers & Pages* → *Create* → *Pages* →
*Connect to Git* → pick `nicholaspjm/nicholaspjm-portfolio`, then:

- Build command: `npm run build`
- Output directory: `out`
- Environment variables: none

Leave `NEXT_PUBLIC_BASE_PATH` unset so the build targets the domain root.

### Option B: deploy from this machine

One command, uploads `out/` directly:

```
npm run deploy-cloudflare
```

The first run opens a browser to authorise Wrangler against your Cloudflare
account. Use this if you want to publish without pushing to GitHub.

### Do not drag the folder into the dashboard

The browser upload silently drops subdirectories on a payload this size (the
site is ~490MB, mostly video), which publishes the HTML with no CSS, images, or
routes. Use Option A or B instead.

## Custom domain

Both hosts serve from the root, so no code change is needed for Cloudflare.
Attach the domain under the Pages project's *Custom domains* tab.

To put the domain on **GitHub Pages** instead, the build must stop using the
`/nicholaspjm-portfolio` base path and the repo needs a `CNAME` file; ask
before switching so the change is verified in one pass.
