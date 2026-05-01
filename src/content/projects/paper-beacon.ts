import type { Project } from "@/types/content";

export const project: Project = {
  slug: "paper-beacon",
  title: "Paper Beacon",
  year: "2022",
  summary:
    "A QR-driven pamphlet system: each sheet is its own micro-website, hand-printed and given away.",
  role: "Print · Web",
  categories: ["Print", "Web"],
  tags: ["AR", "Risograph"],
  cover: {
    src: "/images/placeholder/halftone-05.svg",
    alt: "Target plate with blue centre square.",
    ratio: "3/2",
  },
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "<em>Paper Beacon</em> is a project about distributing the web by hand. Each pamphlet, hand-printed on a Risograph, prints a unique QR code that resolves to a corresponding micro-site.",
      ],
    },
    {
      kind: "image",
      src: "/images/placeholder/halftone-05.svg",
      alt: "Target plate.",
      ratio: "3/2",
    },
    {
      kind: "quote",
      text: "If a website is a place, a pamphlet is a way of getting there on foot.",
    },
  ],
};
