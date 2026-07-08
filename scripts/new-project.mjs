#!/usr/bin/env node
/**
 * Scaffold a new project.
 *
 *   node scripts/new-project.mjs <slug> [section]
 *   npm run new-project my-new-work commissions
 *
 * section: commissions (default) | installation | selected | hidden
 *
 * Creates the project's folder in the content/ tree with a text.md template.
 * That alone makes a page: drop images/clips into the folder and run
 * `npm run scan-images`. For rich data (year, links, categories, custom
 * blocks) add src/content/projects/<slug>.ts and register it in _index.ts;
 * the folder still controls where the project appears.
 */
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const SECTION_DIRS = {
  commissions: "commissions",
  commissioned: "commissions",
  installation: "installation & performance",
  selected: "selected works",
  hidden: "hidden",
};

const [, , slugArg, sectionArg] = process.argv;
if (!slugArg) {
  console.error("Usage: node scripts/new-project.mjs <slug> [commissions|installation|selected|hidden]");
  process.exit(1);
}
const slug = slugArg.toLowerCase().replace(/[^a-z0-9-]/g, "-");
const sectionDir = SECTION_DIRS[(sectionArg || "commissions").toLowerCase()];
if (!sectionDir) {
  console.error(`Unknown section "${sectionArg}". Use commissions | installation | selected | hidden.`);
  process.exit(1);
}

const dir = resolve(root, "content", sectionDir, slug);
if (existsSync(dir)) {
  console.error(`Already exists: ${dir}`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });
writeFileSync(
  resolve(dir, "text.md"),
  "Lead paragraph. What is this project, in one breath.\n\nA second paragraph with more detail.\n",
);

console.log(`Created content/${sectionDir}/${slug}/ (with a text.md template)`);
console.log(`\nNext:`);
console.log(`  1. Drop images / video clips into that folder`);
console.log(`  2. npm run convert-videos   (only if you added video)`);
console.log(`  3. npm run scan-images      (or restart the dev server)`);
console.log(`\nOptional, for year/links/categories: add src/content/projects/${slug}.ts`);
console.log(`and register it in src/content/projects/_index.ts.`);
