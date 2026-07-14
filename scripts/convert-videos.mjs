#!/usr/bin/env node
/**
 * Convert source videos into web-friendly, muted, size-capped .mp4 clips.
 *
 * Finds every .mov/.mp4/.webm dropped into a content/<section>/<project>/
 * folder and transcodes it to public/videos/projects/<slug>/<clean-name>.mp4
 * (H.264, no audio, capped to 960px, faststart) so it can autoplay in the
 * browser. Idempotent: skips a clip whose output already exists.
 *
 *   FFMPEG=/path/to/ffmpeg node scripts/convert-videos.mjs
 *
 * The originals stay put (git-ignored); only the .mp4 outputs are committed.
 */
import { readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const contentRoot = resolve(root, "content");
const videosRoot = resolve(root, "public/videos/projects");
const FFMPEG = process.env.FFMPEG || "ffmpeg";

// Preflight: make sure ffmpeg is callable before we start.
try {
  execFileSync(FFMPEG, ["-version"], { stdio: "ignore" });
} catch {
  console.error(
    `ffmpeg not found (tried "${FFMPEG}"). Install it with\n` +
      `  winget install Gyan.FFmpeg\n` +
      `then restart your terminal, or set FFMPEG=/path/to/ffmpeg.`,
  );
  process.exit(1);
}

const SRC_RE = /\.(mov|mp4|webm|m4v)$/i;

function clean(name) {
  const base =
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 44) || "clip";
  return base;
}

// Project folders live at content/<section>/<projDir>; a "01 " style number
// prefix on the folder name is for ordering and not part of the slug.
const dirs = (p) => {
  try {
    return readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
};
const projects = [];
for (const section of dirs(contentRoot)) {
  if (section.toLowerCase() === "tools") continue; // photos only there
  for (const projDir of dirs(join(contentRoot, section))) {
    const slug = projDir.replace(/^\d+[\s._-]+/, "").trim();
    if (slug) projects.push({ slug, srcDir: join(contentRoot, section, projDir) });
  }
}
if (projects.length === 0) {
  console.log("no content folders to scan");
  process.exit(0);
}

let converted = 0;
let skipped = 0;
let failed = 0;

for (const { slug, srcDir } of projects) {
  let files;
  try {
    files = readdirSync(srcDir).filter((f) => SRC_RE.test(f));
  } catch {
    continue;
  }
  if (files.length === 0) continue;
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const outDir = resolve(videosRoot, slug);
  mkdirSync(outDir, { recursive: true });

  const used = new Set();
  for (const f of files) {
    let name = clean(f);
    while (used.has(name)) name += "-x";
    used.add(name);
    const outPath = resolve(outDir, `${name}.mp4`);
    if (existsSync(outPath) && statSync(outPath).size > 0) {
      skipped++;
      continue;
    }
    const inPath = resolve(srcDir, f);
    process.stdout.write(`converting ${slug}/${f} -> ${name}.mp4 ... `);
    try {
      execFileSync(
        FFMPEG,
        [
          "-y",
          "-i", inPath,
          "-an",
          "-c:v", "libx264",
          "-crf", "27",
          "-preset", "veryfast",
          "-pix_fmt", "yuv420p",
          "-movflags", "+faststart",
          "-vf", "scale=960:960:force_original_aspect_ratio=decrease:force_divisible_by=2",
          outPath,
        ],
        { stdio: ["ignore", "ignore", "ignore"] },
      );
      const mb = (statSync(outPath).size / 1048576).toFixed(1);
      console.log(`ok (${mb} MB)`);
      converted++;
    } catch (e) {
      console.log(`FAILED (${e.message.split("\n")[0]})`);
      failed++;
    }
  }
}

console.log(
  `\nconvert-videos: ${converted} converted, ${skipped} already done, ${failed} failed`,
);
