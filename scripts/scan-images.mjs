#!/usr/bin/env node
/**
 * The content/ tree IS the site structure.
 *
 *   content/
 *     selected works/            <- membership + order (rename "01 ", "02 "
 *       01 the-xx-festival-tour/    number prefixes to reorder)
 *       02 hybrid-2-0/
 *     commissions/               <- section: commissioned
 *     installation & performance/<- section: installation
 *     personal explorations/     <- section: sketch
 *     hidden/                    <- page exists but is off the index
 *     tools/                     <- photos for the public tools list
 *
 * Each project folder holds that page's media (images show in filename order)
 * and optionally a text.md whose paragraphs become the page's body text.
 *
 * This script syncs the tree into what the site serves, OPTIMIZING as it goes:
 * originals in content/ stay untouched; the published copies are resized and
 * recompressed (via sharp), photo PNGs become JPEGs, and every project image
 * also gets a small thumbnail that rows and the visual page load instead of
 * the full file.
 *
 *   content image -> public/images/projects/<slug>/<name>   (max 1920px, q80)
 *                 -> public/images/thumbs/<slug>/<name>     (640px tall, q75)
 *   tool image    -> public/images/tools/<slug>/<name>      (max 1920px, q80)
 *
 * All public/images output is generated and git-ignored. Structure (order,
 * sections, hidden, titles, texts) goes to src/content/structure.ts, media
 * lists to src/content/project-images.ts. Runs before every dev/build; run
 * `npm run scan-images` after changing folders while the dev server is up.
 */
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  statSync,
  rmSync,
  existsSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const contentRoot = resolve(root, "content");
const imagesOut = resolve(root, "public/images/projects");
const thumbsOut = resolve(root, "public/images/thumbs");
const toolImagesOut = resolve(root, "public/images/tools");
const videosRoot = resolve(root, "public/videos/projects");

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
/** Formats sharp recompresses; the rest (animated gif etc.) copy through. */
const PROCESS_RE = /\.(jpe?g|png)$/i;
const VIDEO_RE = /\.(mp4|webm)$/i;
const PREFIX_RE = /^\d+[\s._-]+/; // "01 slug" -> "slug"

// Full tier serves the project detail pages, so it stays generous: near-4K
// long edge at high quality. Thumbs cover rows / the visual page / previews.
const FULL_EDGE = 2560; // max long edge for published images
const THUMB_H = 640; // thumbnail height (rows render at <=340px, 2x retina)
const FULL_Q = 86;
const THUMB_Q = 75;

// sharp is a native dependency; degrade to plain copies if it's unavailable
// so a fresh checkout can still dev before npm install finishes.
let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn(
    "scan-images: sharp not installed; publishing UNOPTIMIZED copies (npm install to fix)",
  );
}

/** Section-folder name -> role. Normalized: lowercase, & -> and, one space. */
function sectionRole(name) {
  const n = name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z]+/g, " ")
    .trim();
  if (n === "selected works" || n === "selected") return "selected";
  if (n === "commissions" || n === "commissioned") return "commissioned";
  if (n.startsWith("installation")) return "installation";
  if (n === "sketches" || n === "sketch" || n === "personal explorations")
    return "sketch";
  if (n === "hidden" || n === "unlisted") return "hidden";
  if (n === "tools") return "tools"; // handled separately, not a project section
  return null;
}

const dirs = (p) => {
  try {
    return readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
};
const files = (p) => {
  try {
    return readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name);
  } catch {
    return [];
  }
};
const natural = (a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

function titleFrom(slug) {
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const fresh = (src, dst) => {
  try {
    return statSync(dst).mtimeMs >= statSync(src).mtimeMs;
  } catch {
    return false;
  }
};

let processed = 0;

/** Published name for a source image: photo PNGs become JPEGs. */
async function outName(srcPath, name) {
  if (!sharp || !/\.png$/i.test(name)) return name;
  try {
    const meta = await sharp(srcPath).metadata();
    if (!meta.hasAlpha) return name.replace(/\.png$/i, ".jpg");
  } catch {
    /* fall through, keep name */
  }
  return name;
}

/** Resize + recompress one image into dst (or plain-copy when sharp can't). */
async function publishImage(src, dst, { height = null, quality = FULL_Q }) {
  if (fresh(src, dst)) return;
  mkdirSync(dirname(dst), { recursive: true });
  if (!sharp || !PROCESS_RE.test(src)) {
    copyFileSync(src, dst);
    processed++;
    return;
  }
  try {
    let img = sharp(src).rotate(); // bake EXIF orientation
    img = height
      ? img.resize({ height, withoutEnlargement: true })
      : img.resize({
          width: FULL_EDGE,
          height: FULL_EDGE,
          fit: "inside",
          withoutEnlargement: true,
        });
    if (/\.jpg$/i.test(dst) || /\.jpe?g$/i.test(src)) {
      img = img.jpeg({ quality, progressive: true, mozjpeg: true });
    } else if (/\.png$/i.test(dst)) {
      img = img.png({ compressionLevel: 9, palette: true, quality: 90 });
    }
    await img.toFile(dst);
    processed++;
  } catch (e) {
    console.warn(`scan-images: failed to optimize ${src} (${e.message}); copying`);
    copyFileSync(src, dst);
    processed++;
  }
}

/** Sync one folder of images into outDir (+ optional thumbs), delete stale. */
async function syncImages(srcDir, outDir, thumbDir) {
  const srcImgs = files(srcDir).filter(
    (f) => IMAGE_RE.test(f) && !f.startsWith("."),
  );
  mkdirSync(outDir, { recursive: true });
  if (thumbDir) mkdirSync(thumbDir, { recursive: true });
  const expected = new Set();
  for (const f of srcImgs) {
    const src = join(srcDir, f);
    const name = await outName(src, f);
    expected.add(name);
    await publishImage(src, join(outDir, name), {});
    if (thumbDir) {
      await publishImage(src, join(thumbDir, name), {
        height: THUMB_H,
        quality: THUMB_Q,
      });
    }
  }
  for (const f of files(outDir)) {
    if (!expected.has(f)) rmSync(join(outDir, f), { force: true });
  }
  if (thumbDir) {
    for (const f of files(thumbDir)) {
      if (!expected.has(f)) rmSync(join(thumbDir, f), { force: true });
    }
  }
}

// --- walk the tree ---------------------------------------------------------
/** slug -> { section, hidden, selected, dir, title, text } */
const entries = {};
const selected = [];

for (const sectionDir of dirs(contentRoot).sort(natural)) {
  const role = sectionRole(sectionDir);
  if (!role) {
    console.warn(`scan-images: skipping unknown section folder "${sectionDir}"`);
    continue;
  }
  if (role === "tools") continue; // tool photos, synced separately below
  for (const projDir of dirs(join(contentRoot, sectionDir)).sort(natural)) {
    const slug = projDir.replace(PREFIX_RE, "").trim();
    if (!slug) continue;
    if (entries[slug]) {
      console.warn(
        `scan-images: "${slug}" appears in both "${entries[slug].sectionDir}" and "${sectionDir}"; keeping the first`,
      );
      continue;
    }
    const dir = join(contentRoot, sectionDir, projDir);
    // optional page text: text.md / text.txt, blank-line separated paragraphs
    let text = null;
    for (const tf of ["text.md", "text.txt"]) {
      const p = join(dir, tf);
      if (existsSync(p)) {
        text = readFileSync(p, "utf8")
          .replace(/\r\n/g, "\n")
          .split(/\n\s*\n/)
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      }
    }
    entries[slug] = {
      sectionDir,
      section: role === "selected" || role === "hidden" ? null : role,
      hidden: role === "hidden",
      title: titleFrom(slug),
      text,
      dir,
    };
    if (role === "selected") selected.push(slug);
  }
}

// --- publish project images (optimized full + thumb) -----------------------
mkdirSync(imagesOut, { recursive: true });
mkdirSync(thumbsOut, { recursive: true });
for (const [slug, e] of Object.entries(entries)) {
  await syncImages(e.dir, join(imagesOut, slug), join(thumbsOut, slug));
}
for (const base of [imagesOut, thumbsOut]) {
  for (const d of dirs(base)) {
    if (!entries[d]) rmSync(join(base, d), { recursive: true, force: true });
  }
}

// --- publish tool photos ----------------------------------------------------
const toolSlugs = new Set();
mkdirSync(toolImagesOut, { recursive: true });
for (const sectionDir of dirs(contentRoot)) {
  if (sectionRole(sectionDir) !== "tools") continue;
  for (const tool of dirs(join(contentRoot, sectionDir)).sort(natural)) {
    const slug = tool.replace(PREFIX_RE, "").trim();
    if (!slug) continue;
    toolSlugs.add(slug);
    await syncImages(join(contentRoot, sectionDir, tool), join(toolImagesOut, slug), null);
  }
}
for (const d of dirs(toolImagesOut)) {
  if (!toolSlugs.has(d)) rmSync(join(toolImagesOut, d), { recursive: true, force: true });
}

// --- CV: content/cv.csv -> src/content/cv-data.ts ---------------------------
// The CV is edited as a spreadsheet: open content/cv.csv in Excel / Numbers /
// Sheets, change rows, save it back. Columns:
//   section (performance|award|press|teaching|education), year, title,
//   detail, link_href, link_label
// Rows keep their file order on the site.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQ = false;
  const s = text.replace(/^﻿/, ""); // strip Excel's UTF-8 BOM
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQ) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else inQ = false;
      } else field += c;
    } else if (c === '"') {
      inQ = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

const cvCsvPath = resolve(root, "content/cv.csv");
let cvRows = 0;
if (existsSync(cvCsvPath)) {
  const rows = parseCsv(readFileSync(cvCsvPath, "utf8"));
  const header = rows.shift()?.map((h) => h.trim().toLowerCase()) ?? [];
  const col = (name) => header.indexOf(name);
  const iSection = col("section");
  const iYear = col("year");
  const iTitle = col("title");
  const iDetail = col("detail");
  const iHref = col("link_href");
  const iLabel = col("link_label");
  const buckets = {
    performance: [],
    award: [],
    press: [],
    teaching: [],
    education: [],
  };
  for (const r of rows) {
    const raw = (r[iSection] ?? "").trim().toLowerCase();
    // accept plural forms ("performances") but keep "press" intact
    const section = buckets[raw] ? raw : raw.replace(/s$/, "");
    const bucket = buckets[section];
    if (!bucket) {
      console.warn(`scan-images: cv.csv row with unknown section "${r[iSection]}" skipped`);
      continue;
    }
    const title = (r[iTitle] ?? "").trim();
    if (!title) continue;
    const entry = { year: (r[iYear] ?? "").trim(), title };
    const detail = (r[iDetail] ?? "").trim();
    if (detail) entry.detail = detail;
    const href = (r[iHref] ?? "").trim();
    if (href) entry.link = { href, label: (r[iLabel] ?? "link").trim() || "link" };
    bucket.push(entry);
    cvRows++;
  }
  writeFileSync(
    resolve(root, "src/content/cv-data.ts"),
    `// AUTO-GENERATED from content/cv.csv by scripts/scan-images.mjs — edit the CSV.
export interface CVEntry {
  year: string;
  title: string;
  detail?: string;
  link?: { href: string; label: string };
}

export const performances: CVEntry[] = ${JSON.stringify(buckets.performance, null, 2)};

export const awards: CVEntry[] = ${JSON.stringify(buckets.award, null, 2)};

export const press: CVEntry[] = ${JSON.stringify(buckets.press, null, 2)};

export const teaching: CVEntry[] = ${JSON.stringify(buckets.teaching, null, 2)};

export const education: CVEntry[] = ${JSON.stringify(buckets.education, null, 2)};
`,
  );
} else {
  console.warn("scan-images: content/cv.csv missing; keeping existing cv data");
}

// --- media manifests --------------------------------------------------------
function scanMedia(base, re, urlBase) {
  const out = {};
  for (const slug of dirs(base).sort(natural)) {
    const list = files(join(base, slug))
      .filter((f) => re.test(f) && !f.startsWith("."))
      .sort(natural);
    if (list.length) out[slug] = list.map((f) => `${urlBase}/${slug}/${f}`);
  }
  return out;
}
const images = scanMedia(imagesOut, IMAGE_RE, "/images/projects");
const videos = scanMedia(videosRoot, VIDEO_RE, "/videos/projects");
const toolImages = scanMedia(toolImagesOut, IMAGE_RE, "/images/tools");

// Stamp the build/update date for the corner readout. Runs on every
// predev/prebuild, so CI bakes the deploy date and local dev the current one.
writeFileSync(
  resolve(root, "src/content/build-info.ts"),
  `// AUTO-GENERATED by scripts/scan-images.mjs — do not edit by hand.
export const BUILD_DATE = "${new Date().toISOString().slice(0, 10)}";
`,
);

// --- emit ---------------------------------------------------------------
writeFileSync(
  resolve(root, "src/content/project-images.ts"),
  `// AUTO-GENERATED by scripts/scan-images.mjs — do not edit by hand.
export const projectImages: Record<string, string[]> = ${JSON.stringify(images, null, 2)};

export const projectVideos: Record<string, string[]> = ${JSON.stringify(videos, null, 2)};

export const toolImages: Record<string, string[]> = ${JSON.stringify(toolImages, null, 2)};
`,
);

const structEntries = {};
for (const [slug, e] of Object.entries(entries)) {
  structEntries[slug] = {
    section: e.section,
    hidden: e.hidden,
    title: e.title,
    text: e.text,
  };
}
writeFileSync(
  resolve(root, "src/content/structure.ts"),
  `// AUTO-GENERATED by scripts/scan-images.mjs — do not edit by hand.
// Derived from the content/ folder tree; see that folder to reorganize the site.
export interface StructureEntry {
  /** Section from the folder's location; null = keep the code-defined one. */
  section: "commissioned" | "installation" | "sketch" | null;
  /** In content/hidden: page exists but is left off the index. */
  hidden: boolean;
  /** Fallback page title (from the folder name) for folders with no code file. */
  title: string;
  /** Paragraphs from the folder's text.md, replacing the page's body text. */
  text: string[] | null;
}

export const structure: {
  /** Selected Works slugs, in folder-name order. */
  selected: string[];
  entries: Record<string, StructureEntry>;
} = ${JSON.stringify({ selected, entries: structEntries }, null, 2)};
`,
);

const ni = Object.values(images).reduce((s, a) => s + a.length, 0);
const nv = Object.values(videos).reduce((s, a) => s + a.length, 0);
console.log(
  `scan-images: ${Object.keys(entries).length} project folders (${selected.length} selected), ${processed} image${processed === 1 ? "" : "s"} published${sharp ? " optimized" : " UNOPTIMIZED"}, manifests: ${ni} images + ${nv} videos`,
);
