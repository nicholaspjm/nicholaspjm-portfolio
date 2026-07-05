import type { Project } from "@/types/content";

export const project: Project = {
  slug: "odetari-dont-die",
  title: "DON'T DIE — Odetari ft. SOYEON",
  year: "2026",
  weight: 0.8,
  summary:
    "VFX for Odetari's official music video for “DON'T DIE”, featuring SOYEON of (G)I-DLE.",
  role: "VFX",
  categories: ["Music Video", "VFX"],
  tags: ["TouchDesigner"],
  links: [{ href: "https://youtu.be/h3FZlwFDwy4", label: "official video" }],
  images: [
    {
      src: "/images/projects/odetari-dont-die/video.jpg",
      caption: "DON'T DIE — official music video",
    },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Visual effects for Odetari's official music video for “DON'T DIE”, featuring SOYEON of (G)I-DLE.",
      ],
    },
    {
      kind: "embed",
      url: "https://www.youtube.com/embed/h3FZlwFDwy4",
      caption: "DON'T DIE — official music video",
    },
  ],
};
