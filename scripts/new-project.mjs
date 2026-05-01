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
  role: "Role · Credit",
  categories: ["Category"],
  tags: ["Tag"],
  cover: {
    src: "/images/projects/${slug}/cover.jpg",
    alt: "Hero image alt.",
    ratio: "3/2",
  },
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Lead paragraph — what is this project, in one breath.",
      ],
    },
    {
      kind: "image",
      src: "/images/projects/${slug}/01.jpg",
      alt: "Image 01.",
      ratio: "3/2",
      layout: "center",
    },
  ],
};
`;

writeFileSync(filePath, tpl);
console.log(`Created ${filePath}`);
console.log(`\nNext: add this line to src/content/projects/_index.ts`);
console.log(
  `   import { project as ${slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase())} } from "./${slug}";`,
);
console.log(`\nDrop images into: public/images/projects/${slug}/`);
console.log(`Drop video into: public/videos/projects/${slug}/`);
