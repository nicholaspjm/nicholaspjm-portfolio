#!/usr/bin/env node
/**
 * Scaffold a new project content file.
 *
 *   node scripts/new-project.mjs my-new-project "My New Project" 2025
 *
 * Creates src/content/projects/<slug>.ts and reminds you to add it to _index.ts.
 */
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const [, , slugArg, titleArg, yearArg] = process.argv;
if (!slugArg || !titleArg) {
  console.error("Usage: node scripts/new-project.mjs <slug> \"<Title>\" [year]");
  process.exit(1);
}

const slug = slugArg.toLowerCase().replace(/[^a-z0-9-]/g, "-");
const year = yearArg || String(new Date().getFullYear());
const filePath = resolve(root, "src/content/projects", `${slug}.ts`);

if (existsSync(filePath)) {
  console.error(`Already exists: ${filePath}`);
  process.exit(1);
}

mkdirSync(resolve(root, `public/images/projects/${slug}`), { recursive: true });
mkdirSync(resolve(root, `public/videos/projects/${slug}`), { recursive: true });

const tpl = `import type { Project } from "@/types/content";

export const project: Project = {
  slug: "${slug}",
  title: "${titleArg.replace(/"/g, '\\"')}",
  year: "${year}",
  summary: "One-line summary.",
  role: "Role, credit",
  categories: ["Category"],
  tags: ["Tag"],
  // Images: just drop files into public/images/projects/${slug}/ and they are
  // auto-associated with this page (see scripts/scan-images.mjs). Only add an
  // explicit \`images\` array here if you want captions or a specific order.
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Lead paragraph. What is this project, in one breath.",
      ],
    },
  ],
};
`;

writeFileSync(filePath, tpl);
const camel = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
console.log(`Created ${filePath}`);
console.log(`\nNext: register it in src/content/projects/_index.ts`);
console.log(`   import { project as ${camel} } from "./${slug}";`);
console.log(`   ...then add ${camel} to the projects array.`);
console.log(
  `\nDrop images into: public/images/projects/${slug}/  (they auto-appear;`,
);
console.log(`   run \`npm run scan-images\` or restart the dev server to refresh)`);
console.log(`Drop video into:  public/videos/projects/${slug}/`);
