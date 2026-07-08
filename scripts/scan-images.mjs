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
 *     sketches/                  <- section: sketch
 *     hidden/                    <- page exists but is hidden from the index
 *
 * Each project folder holds that page's media (images show in filename order)
 * and optionally a text.md whose paragraphs become the page's body text.
 * Moving a folder between sections moves the project on the site; removing it
 * hides the project; a folder with no matching code file still gets a page.
 *
 * This script syncs the tree into what the site serves:
 *   - images copy to public/images/projects/<slug>/ (generated, git-ignored)
 *   - structure (order, sections, hidden, titles, texts) is written to
 *     src/content/structure.ts, media lists to src/content/project-images.ts
 *
 * Runs automatically before `npm run dev` and `npm run build`; run
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
const videosRoot = resolve(root, "public/videos/projects");

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const VIDEO_RE = /\.(mp4|webm)$/i;
const PREFIX_RE = /^\d+[\s._-]+/; // "01 slug" -> "slug"

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
  if (n === "sketches" || n === "sketch") return "sketch";
  if (n === "hidden" || n === "unlisted") return "hidden";
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

/** Prettify a slug into a fallback page title. */
function titleFrom(slug) {
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
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

// --- sync images: content tree -> public/images/projects (generated) --------
let copied = 0;
mkdirSync(imagesOut, { recursive: true });
for (const [slug, e] of Object.entries(entries)) {
  const srcImgs = files(e.dir).filter((f) => IMAGE_RE.test(f) && !f.startsWith("."));
  const outDir = join(imagesOut, slug);
  mkdirSync(outDir, { recursive: true });
  for (const f of srcImgs) {
    const src = join(e.dir, f);
    const dst = join(outDir, f);
    let same = false;
    try {
      same = statSync(dst).size === statSync(src).size;
    } catch {
      /* missing */
    }
    if (!same) {
      copyFileSync(src, dst);
      copied++;
    }
  }
  // drop images removed from the folder
  for (const f of files(outDir)) {
    if (!srcImgs.includes(f)) rmSync(join(outDir, f), { force: true });
  }
}
// drop slug dirs whose folder left the tree entirely
for (const d of dirs(imagesOut)) {
  if (!entries[d]) rmSync(join(imagesOut, d), { recursive: true, force: true });
}

// --- media manifests (same shape as before) --------------------------------
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

// --- emit ---------------------------------------------------------------
writeFileSync(
  resolve(root, "src/content/project-images.ts"),
  `// AUTO-GENERATED by scripts/scan-images.mjs — do not edit by hand.
export const projectImages: Record<string, string[]> = ${JSON.stringify(images, null, 2)};

export const projectVideos: Record<string, string[]> = ${JSON.stringify(videos, null, 2)};
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
  `scan-images: ${Object.keys(entries).length} project folders (${selected.length} selected), ${copied} image${copied === 1 ? "" : "s"} synced, manifests: ${ni} images + ${nv} videos`,
);
