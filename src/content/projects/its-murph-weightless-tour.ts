import type { Project } from "@/types/content";

export const project: Project = {
  slug: "its-murph-weightless-tour",
  title: "Its Murph Weightless Tour 2026",
  year: "2026",
  weight: 0.8,
  summary:
    "Tour visual design for Its Murph's 2026 Weightless Tour across North America.",
  role: "Visual design",
  categories: ["Live Visuals", "Touring"],
  tags: ["TouchDesigner"],
  links: [{ href: "https://youtu.be/SLvYbaZUn-Y?t=3885", label: "watch" }],
  images: [
    {
      youtube: "SLvYbaZUn-Y",
      start: 3885,
      caption: "Weightless Tour live set",
    },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Tour visual design for Its Murph's 2026 Weightless Tour across North America.",
      ],
    },
    {
      kind: "embed",
      url: "https://www.youtube.com/embed/SLvYbaZUn-Y?start=3885",
      caption: "Weightless Tour live set",
    },
  ],
};
