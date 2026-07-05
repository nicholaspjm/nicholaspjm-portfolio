import type { Project } from "@/types/content";

// Stub built from CV facts. Add media / fuller text when ready, then remove
// `unlisted` to surface it in the installation & performance list as well.
export const project: Project = {
  slug: "hybrid-2-0",
  title: "Hybrid 2.0",
  section: "installation",
  year: "2025",
  weight: 0.75,
  summary:
    "Live audiovisual installation, presented in the Platform Presents group exhibition, Naarm / Melbourne.",
  role: "Concept, visual design",
  categories: ["Installation", "Exhibition"],
  tags: ["TouchDesigner"],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Hybrid 2.0 is a live audiovisual installation, presented as part of the Platform Presents group exhibition in Naarm / Melbourne.",
      ],
    },
    {
      kind: "text",
      paragraphs: ["Documentation and images coming soon."],
    },
  ],
};
