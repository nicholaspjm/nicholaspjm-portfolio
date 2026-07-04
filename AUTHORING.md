# Adding content

Each project has two media folders and one content file.

## 1. Drop in media

```
public/images/projects/<slug>/     ← jpg / png / webp
public/videos/projects/<slug>/     ← mp4 / webm
```

`<slug>` is the project's folder name (e.g. `the-xx-festival-tour`). The folders
already exist for every project.

Keep files reasonably sized (images < ~1.5 MB, video < ~20 MB) so the site stays
fast. Name them simply — `01.jpg`, `coachella.mp4`, `poster.jpg`.

## 2. Write text + place media

Open the project's content file:

```
src/content/projects/<slug>.ts
```

The `blocks` array is the page body, top to bottom. Mix text and media in any
order. See `the-xx-festival-tour.ts` for a fully annotated example.

```ts
blocks: [
  { kind: "text", lead: true, paragraphs: ["Opening paragraph."] },
  { kind: "video", src: "/videos/projects/<slug>/clip.mp4",
    poster: "/images/projects/<slug>/poster.jpg", caption: "Main stage" },
  { kind: "text", paragraphs: ["More text after the clip.", "Another para."] },
  { kind: "image", src: "/images/projects/<slug>/01.jpg", alt: "…", caption: "…" },
]
```

For a simple gallery row under the entry, use `images` instead of image blocks:

```ts
images: [
  { src: "/images/projects/<slug>/01.jpg", caption: "…" },
  { src: "/images/projects/<slug>/02.jpg", caption: "…" },
]
```

Block kinds: `text` (`paragraphs`, optional `lead`), `image` (`src`, `alt`,
`caption?`, `ratio?`), `video` (`src`, `poster?`, `caption?`), `quote`
(`text`, `cite?`), `divider` (`label?`).

## 3. See it

`npm run dev` → open the project at `/work/<slug>`. Paths always start with `/`
(no `public`), e.g. `/images/projects/<slug>/01.jpg`.

New project: `npm run new-project -- <slug> "Title" 2026` scaffolds the file and
folders, or copy an existing `.ts` and register it in
`src/content/projects/_index.ts`.
