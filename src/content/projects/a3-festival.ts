import type { Project } from "@/types/content";

// Stub built from CV facts. Add media / fuller text when ready, then remove
// `unlisted` to surface it in the installation & performance list as well.
export const project: Project = {
  slug: "a3-festival",
  title: "A3 Festival",
  section: "installation",
  year: "2025",
  weight: 0.75,
  summary:
    "Main-stage visual design and live performance at A3 Festival.",
  role: "Visual design, live performance",
  categories: ["Festival", "Live Visuals"],
  tags: ["TouchDesigner"],
  unlisted: true,
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Main-stage visual design and live performance at A3 Festival, 2025.",
      ],
    },
    {
      kind: "text",
      paragraphs: ["Documentation and images coming soon."],
    },
  ],
};
