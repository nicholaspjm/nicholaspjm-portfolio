/**
 * Builds public/og/<slug>.jpg — a 1200x630 share card per project, cropped
 * from the first still that project lists.
 *
 * Runs from prebuild/predev, after scan-images.mjs has published the optimized
 * images this reads from. Output is generated, not committed (see .gitignore).
 *
 * Cropping here rather than handing the raw image to Facebook/Bluesky matters:
 * a portrait still linked as-is gets centre-cropped by whichever platform is
 * rendering it, usually through the middle of the subject. Doing it at build
 * time means one predictable card, and a much smaller file on the wire.
 *
 * Pure image resizing — no text, so no font dependency and it is safe to run
 * on the Ubuntu CI runner. The text card (og-default.png) is committed instead.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const PROJECTS_DIR = "src/content/projects";
const OUT_DIR = "public/og";
const W = 1200;
const H = 630;

mkdirSync(OUT_DIR, { recursive: true });

/** First `src:` explicitly declared in the project's `images:` array.
 *  Commented-out lines are dropped first: several project files keep a
 *  commented `images:` template as a hint for filling in later, and reading
 *  one as real would point the card at a file that was never published. */
function declaredStill(source) {
  const live = source
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n");
  const start = live.indexOf("images:");
  if (start === -1) return undefined;
  const blocks = live.indexOf("blocks:", start);
  const region = live.slice(start, blocks === -1 ? undefined : blocks);
  return /src:\s*"([^"]+)"/.exec(region)?.[1];
}

/**
 * The generated media manifest. src/lib/projects.ts appends anything in a
 * project's folder that the code file does not already reference, so most
 * projects declare no images at all and get their gallery from here. Reading
 * it means this script picks the same first still that projectStill() does.
 */
function loadManifest() {
  const src = readFileSync("src/content/project-images.ts", "utf8");
  // The file exports several maps (images, videos, tool images), so match
  // braces from the projectImages declaration rather than taking the last "}".
  const decl = src.indexOf("projectImages");
  if (decl === -1) return {};
  const open = src.indexOf("{", decl);
  if (open === -1) return {};
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth += 1;
    else if (src[i] === "}") {
      depth -= 1;
      if (depth === 0) return JSON.parse(src.slice(open, i + 1));
    }
  }
  return {};
}

const fresh = (out, src) => {
  try {
    return statSync(out).mtimeMs >= statSync(src).mtimeMs;
  } catch {
    return false;
  }
};

const manifest = loadManifest();

// Explicit stills declared in code, keyed by slug. These win, matching the
// precedence in src/lib/projects.ts.
const declared = {};
for (const file of readdirSync(PROJECTS_DIR)) {
  if (!file.endsWith(".ts") || file.startsWith("_")) continue;
  const source = readFileSync(join(PROJECTS_DIR, file), "utf8");
  const slug = /slug:\s*"([^"]+)"/.exec(source)?.[1];
  if (!slug) continue;
  const still = declaredStill(source);
  if (still) declared[slug] = still;
}

// Every project with any still at all: declared, or auto-associated from its
// folder. Includes stub projects that exist as a folder with no code file.
const slugs = new Set([...Object.keys(manifest), ...Object.keys(declared)]);

let made = 0;
let skipped = 0;
let missing = 0;

const exists = (path) => {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
};

for (const slug of slugs) {
  // Declared still first, then the auto-associated ones, and take the first
  // that is actually on disk. src/lib/seo.ts decides a project *has* a card
  // from its metadata alone, so failing to write one here would leave the
  // page advertising an image that 404s — worse than a different image.
  const candidates = [declared[slug], ...(manifest[slug] ?? [])].filter(Boolean);
  const still = candidates.find((c) => exists(join("public", c.replace(/^\//, ""))));

  // No still at all (video- or embed-led work) — falls back to the site card.
  if (!still) {
    if (candidates.length) missing += 1;
    continue;
  }

  const src = join("public", still.replace(/^\//, ""));
  const out = join(OUT_DIR, `${slug}.jpg`);

  if (fresh(out, src)) {
    skipped += 1;
    continue;
  }

  const buf = await sharp(src)
    .resize(W, H, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  writeFileSync(out, buf);
  made += 1;
}

console.log(
  `og-images: ${made} built, ${skipped} already current` +
    (missing ? `, ${missing} skipped (source image not published)` : ""),
);
