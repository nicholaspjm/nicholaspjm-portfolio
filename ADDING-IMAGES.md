# The content folder: how the site is organized

The `content/` folder at the repo root mirrors the site. Its layout IS the
site's layout:

```
content/
  selected works/
    01 the-xx-festival-tour/     <- number prefix sets the order
    02 hybrid-2-0/
    ...
  commissions/
    odetari-dont-die/
    ...
  installation & performance/
    cat-among-animals/
    ...
  hidden/                        <- pages that exist but are off every index
```

Each project folder holds that page's media and text. The folder name (minus
any leading number) is the page's URL slug: `/work/<slug>`.

After changing anything below, refresh with:

```
npm run scan-images
```

(or just restart the dev server; deploys pick everything up automatically).

## Moving things around

- **Move a folder between sections** and the project moves on the site:
  drag `cat-among-animals` from `installation & performance` into
  `commissions` and it lists as a commission.
- **Selected works** is the highlight reel at the top of the homepage. Put a
  project's folder in there to feature it; the `01`, `02` number prefixes on
  the folder names set the order, so rename to reorder. Projects there keep
  their original section listing too.
- **Hide a project**: move its folder into `content/hidden/`. The page stays
  reachable by URL but disappears from all lists.
- **Remove a folder entirely** and the project disappears from the site's
  indexes (its media is dropped too, so prefer `hidden/` if unsure).

## Images

Drop image files (`.jpg .png .webp .gif .avif`) straight into a project's
folder. They appear on that page in filename order, so name them `01.jpg`,
`02.jpg`, ... to control order. Fine-tuning (per-image size, reorder,
subtext, hiding from /visual) lives in the local editor: `npm run studio` +
the ✎ edit button.

## Text

Add a `text.md` to a project folder and its paragraphs (separated by blank
lines) become the page's body text, replacing what the code defines. The
first paragraph renders as the lead.

## Tool photos

The public tools each have a folder too, under `content/tools/` (for example
`content/tools/woven-touch/`). Drop images in and they show as a row under
that tool on the homepage, with the same size / reorder / hide controls as
project rows.

## Video

Drop clips (`.mov .mp4 .webm`) into the project folder, then:

```
npm run convert-videos
```

That transcodes them to web-friendly muted `.mp4` (the heavy originals stay
local and never commit) and they join the page's gallery, autoplaying only
while on screen. YouTube: add `{ youtube: "VIDEO_ID" }` to the project's
`images` array in `src/content/projects/<slug>.ts`.

## A brand new page

Just add a folder:

```
npm run new-project my-new-work commissions
```

That creates `content/commissions/my-new-work/` with a `text.md` template.
Drop images in and the page exists with a title taken from the folder name.
For a proper year, links, categories, or custom layout blocks, also add
`src/content/projects/my-new-work.ts` (copy an existing file) and register it
in `src/content/projects/_index.ts`; the folder still controls where it
appears.

## Under the hood

`scripts/scan-images.mjs` runs before every dev/build. It syncs the tree into
`public/images/projects/` (generated, git-ignored) and writes the structure
(order, sections, hidden, text) to `src/content/structure.ts`. Commit the
`content/` folder; never edit the generated files by hand.
