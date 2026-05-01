# nicholaspjm.com — v2

A portfolio site for Nicholas PJM. Built on Next.js 16 (App Router),
TypeScript, Tailwind v4, and React Three Fiber.

## What's here

- **/** — home, with a live WebGL hero (domain-warped fbm rendered as
  topographic isobands; cursor distorts the field).
- **/work** — index of projects, filterable by category.
- **/work/[slug]** — project detail page; renders a sequence of typed
  content blocks (image / video / gallery / text / quote / embed / divider).
- **/lab** — code experiments, each running live in the browser
  (particles, ASCII flow, grid pulse, mini-blob).
- **/info** — bio, contact, colophon.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styles | Tailwind v4 (tokens via `@theme inline`) |
| 3D / GL | three + @react-three/fiber + drei |
| Type | EB Garamond + JetBrains Mono |

## Adding a project

```bash
npm run new-project -- <slug> "Title" 2025
```

Then drop images/videos into `public/images/projects/<slug>/` and
`public/videos/projects/<slug>/`, fill out the content blocks in the
generated `.ts` file, and register the import in
`src/content/projects/_index.ts`.

The content schema lives in `src/types/content.ts` and supports:
`text`, `image`, `video`, `gallery`, `embed`, `quote`, `divider`.

To add a new block type: add it to the union in `types/content.ts`, write
a renderer in `src/components/content/<name>-block.tsx`, and add a case
in `block-renderer.tsx`.

## Adding a lab experiment

1. Drop a client component in `src/components/lab/experiments/<name>.tsx`.
2. Add a key for it in the `Experiment["component"]` union in
   `types/content.ts`.
3. Wire it into `src/components/lab/registry.tsx`.
4. Create `src/content/experiments/<slug>.ts` and register it in
   `_index.ts`.

## Project structure

```
src/
  app/                    routes (home, /work, /lab, /info)
  components/
    layout/               header, footer, paper grain
    ui/                   hyperlink, tag, marquee
    content/              block renderers
    hero/                 home WebGL hero + shaders
    lab/                  experiment frame + experiments
  content/
    projects/             one .ts per project
    experiments/          one .ts per experiment
    site.ts               site name, nav, social, contact
  lib/                    pure functions for reading content
  types/                  content schema
public/
  images/placeholder/     placeholder SVG plates
  images/projects/<slug>/ per-project images
  videos/projects/<slug>/ per-project videos
scripts/
  new-project.mjs         scaffold a new project file + folders
```

## Local dev

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static build with prerendered project pages
npm run start    # serve the build
```

## Design notes

- Warm paper ground (`--color-paper`), deep ink text, classic underlined
  hyperlink blue (`--color-link: #1c39ff`).
- Serif body (EB Garamond) for editorial feel, mono caption (JetBrains
  Mono) for technical metadata.
- Hairlines in `--color-rule` define grid edges; no shadows anywhere.
- Hero shader: domain-warped fbm sampled into 14 isobands, blended with a
  cursor halo. See `src/components/hero/shaders/hero.glsl.ts`.
