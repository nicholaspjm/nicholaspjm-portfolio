import type { Project } from "@/types/content";

// Stub built from CV facts. Add media / fuller text when ready, then remove
// `unlisted` to surface it in the installation & performance list as well.
export const project: Project = {
  slug: "hybrid-1-0",
  title: "Hybrid 1.0",
  section: "sketch",
  year: "2025",
  date: "2025, Naarm / Melbourne",
  credits: ["Presented in Hybrid 1.0, a Platform Presents group exhibition", "640 LEDs, acrylic, aluminium, steel wire"],
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
        "Hybrid 1.0 is a live audiovisual installation, presented as part of the Platform Presents group exhibition in Naarm / Melbourne.",
      ],
    },
  ],
};
