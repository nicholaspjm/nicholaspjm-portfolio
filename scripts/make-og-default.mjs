/**
 * Builds public/og-default.png — the 1200x630 card shown when a page has no
 * image of its own (home, /work, /cv, /info, /sketches, and any project that
 * leads with a video rather than a still).
 *
 * Run by hand, and the PNG is COMMITTED:
 *
 *   node scripts/make-og-default.mjs
 *
 * It is not part of prebuild on purpose. This card draws text, and text needs
 * fonts — the CI runner is Ubuntu and has neither Arial nor Courier New, so a
 * card generated there would silently come out in a substitute face. Building
 * it on a machine that has the site's actual fonts and committing the result
 * keeps every share preview identical.
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const W = 1200;
const H = 630;

// Deterministic PRNG, so re-running produces a byte-identical card instead of
// a fresh scatter that shows up as a spurious diff.
let seed = 20260825;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

// A loose cloud echoing the homepage point cloud: gaussian-ish falloff around
// a centre right of the text block.
const box = (n) => {
  let s = 0;
  for (let i = 0; i < n; i++) s += rand();
  return s / n - 0.5;
};

// Keep the cloud clear of the text block. A hard rectangular cull leaves a
// visible straight edge through the cloud, so thin the dots out gradually
// instead: probability of keeping one ramps from 0 at the edge of the text
// box to 1 about 120px away, which reads as natural falloff.
const TEXT = { x0: 40, x1: 772, y0: 200, y1: 456 };
const FEATHER = 120;

const keepAt = (x, y) => {
  const dx = Math.max(TEXT.x0 - x, x - TEXT.x1, 0);
  const dy = Math.max(TEXT.y0 - y, y - TEXT.y1, 0);
  const d = Math.hypot(dx, dy);
  if (d >= FEATHER) return true;
  const t = d / FEATHER;
  return rand() < t * t * (3 - 2 * t); // smoothstep
};

const dots = [];
for (let i = 0; i < 3600; i++) {
  const x = 838 + box(3) * 660;
  const y = 315 + box(3) * 480;
  const r = rand() < 0.86 ? 1.5 : 2.4;
  if (x > 8 && x < W - 8 && y > 8 && y < H - 8 && keepAt(x, y))
    dots.push({ x, y, r });
}

const cloud = dots
  .map((d) => `<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${d.r}"/>`)
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <g fill="#000000">${cloud}</g>
  <g font-family="Arial, Helvetica, sans-serif" fill="#000000">
    <text x="72" y="300" font-size="76" font-weight="400">Nicholas Marriott</text>
  </g>
  <g font-family="'Courier New', Courier, monospace" fill="#000000">
    <text x="74" y="344" font-size="25">nicholaspjm</text>
    <text x="74" y="392" font-size="25">projection &#183; new media &#183; creative technology</text>
    <text x="74" y="426" font-size="25">naarm / melbourne</text>
  </g>
  <rect x="72" y="238" width="152" height="3" fill="#0000ff"/>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync("public/og-default.png", png);
console.log(`og-default.png: ${W}x${H}, ${(png.length / 1024).toFixed(0)}KB, ${dots.length} dots`);
