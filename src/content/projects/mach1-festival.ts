import type { Project } from "@/types/content";

export const project: Project = {
  slug: "mach1-festival",
  title: "Mach1 Festival",
  section: "installation",
  year: "2026",
  summary:
    "Festival tent installation and visual design for Mach1 Festival.",
  role: "Installation, visual design",
  categories: ["Installation", "Festival"],
  tags: ["TouchDesigner"],
  images: [
    {
      src: "/images/projects/mach1-festival/01.jpg",
      caption: "2026, Mach1 Festival, render study",
    },
    {
      src: "/images/projects/mach1-festival/02.jpg",
      caption: "Tent installation, mycelium system",
    },
    {
      src: "/images/projects/mach1-festival/03.jpg",
      caption: "Render variation",
    },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Festival tent installation and visual design for Mach1 Festival.",
      ],
    },
  ],
};
