import type { Project } from "@/types/content";

export const project: Project = {
  slug: "halftone-type",
  title: "Halftone Type Specimens",
  year: "2024",
  summary:
    "A typographic study printing variable fonts through halftone screens at varying line counts.",
  role: "Type · Print",
  categories: ["Type", "Print"],
  tags: ["Variable Fonts", "Risograph"],
  cover: {
    src: "/images/placeholder/halftone-03.svg",
    alt: "N · PJM rules sheet.",
    ratio: "3/2",
  },
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "An ongoing series of broadsheets exploring how digital typography degrades, blooms, and recovers when forced through analogue screens.",
      ],
    },
    {
      kind: "image",
      src: "/images/placeholder/halftone-03.svg",
      alt: "Rules sheet with N · PJM mark.",
      ratio: "3/2",
      layout: "center",
      caption: "Specimen 003 — set in 120 / 800 mass.",
    },
    {
      kind: "text",
      paragraphs: [
        "The typeface stays the same across every sheet. The only variable is the line frequency of the halftone — from a coarse 25 lpi (visible as a field of dots) to 175 lpi (which reads as a continuous tone).",
      ],
    },
    {
      kind: "gallery",
      columns: 2,
      items: [
        { src: "/images/placeholder/halftone-04.svg", alt: "circuit", ratio: "1/1" },
        { src: "/images/placeholder/halftone-05.svg", alt: "target", ratio: "1/1" },
      ],
    },
  ],
};
