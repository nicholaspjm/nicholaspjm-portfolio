# Adding images (and video)

Every project page has its own folder. Drop images in and they show up on that
page. No code editing required.

## Add images to a page

1. Find the page's folder. It is `public/images/projects/<slug>/`, where
   `<slug>` is the last part of the page's URL. For example the page at
   `/work/cat-among-animals` uses
   `public/images/projects/cat-among-animals/`.

2. Drop image files into that folder. Supported: `.jpg`, `.jpeg`, `.png`,
   `.webp`, `.gif`, `.avif`.

3. Name them so they sort the way you want them shown, e.g. `01.jpg`, `02.jpg`,
   `03.jpg`. They appear left to right in that order. (Numbers sort naturally,
   so `10.jpg` comes after `9.jpg`, not before.)

4. Refresh:
   - If the dev server is running, run `npm run scan-images` in a second
     terminal (the page hot-reloads), or just restart the dev server.
   - On the live site, a normal push rebuilds and picks them up automatically.

That is it. The new images join whatever is already on the page.

## Ordering and what shows

- Images sort by filename. Rename files to reorder (a leading number is the
  easy way).
- The home page shows the row across one line and hides anything past the edge,
  so put the images you most want seen first (lowest numbers).
- The full set always shows on the project's own page at `/work/<slug>`.

## Curating instead of auto (optional)

Auto-association is the default. If you want captions or a hand-picked order
for a page, open its file at `src/content/projects/<slug>.ts` and add an
`images` array:

```ts
images: [
  { src: "/images/projects/<slug>/hero.jpg", caption: "Opening night" },
  { src: "/images/projects/<slug>/02.jpg" },
],
```

Anything you list there comes first, in that order. Any other file in the
folder is still appended after it, so a listed page keeps auto-picking up new
drops too. To show only your listed images and nothing else, keep the folder to
just those files.

## Video

Videos auto-associate like images, but browsers can't play the `.mov` files
that TouchDesigner and phones export, so they need a one-time convert first.

1. Drop your clips (`.mov`, `.mp4`, `.webm`) into the page's image folder,
   `public/images/projects/<slug>/`, the same place as photos.
2. Convert them (needs ffmpeg: `winget install Gyan.FFmpeg`, then restart the
   terminal):

   ```
   npm run convert-videos
   ```

   This transcodes each clip to a web-friendly, muted, size-capped `.mp4` in
   `public/videos/projects/<slug>/`. It skips clips already done, and the heavy
   originals stay local (only the `.mp4` outputs are committed).
3. Refresh: `npm run scan-images` (or restart dev). The clips now show in the
   gallery as muted autoplay video, sized like the photos, playing only while
   on screen.

To reorder, rename the clips (they sort by filename). Prefer a YouTube embed
for a specific work? Add `{ youtube: "VIDEO_ID" }` (optionally `start: 90`) to
the file's `images` array instead.

## Making a whole new page

A new page needs a title and a few details, so scaffold it:

```
npm run new-project my-new-slug "My New Title" 2026
```

That creates `src/content/projects/my-new-slug.ts` and the image/video folders.
Register it by adding the two lines it prints to
`src/content/projects/_index.ts`, then drop images into its folder as above.
