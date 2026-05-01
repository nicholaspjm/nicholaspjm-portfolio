import type { Project } from "@/types/content";

export const project: Project = {
  slug: "print-runs",
  title: "Print Runs 2021–24",
  year: "2021",
  summary:
    "Selected printed work — broadsheets, posters, zines, and stickers — produced in small editions.",
  role: "Print · Type",
  categories: ["Print"],
  tags: ["Risograph", "Letterpress"],
  cover: {
    src: "/images/placeholder/halftone-02.svg",
    alt: "Topographic curves with a square accent.",
    ratio: "3/2",
  },
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "An archive of small print editions over four years. Most are now sold out; remaining copies are kept in the studio's reference shelf.",
      ],
    },
    {
      kind: "gallery",
      columns: 3,
      items: [
        { src: "/images/placeholder/halftone-01.svg", alt: "Plate 01", ratio: "3/2" },
        { src: "/images/placeholder/halftone-02.svg", alt: "Plate 02", ratio: "3/2" },
        { src: "/images/placeholder/halftone-03.svg", alt: "Plate 03", ratio: "3/2" },
      ],
      caption: "2021–22 broadsheets.",
    },
    {
      kind: "gallery",
      columns: 3,
      items: [
        { src: "/images/placeholder/halftone-04.svg", alt: "Plate 04", ratio: "1/1" },
        { src: "/images/placeholder/halftone-05.svg", alt: "Plate 05", ratio: "1/1" },
        { src: "/images/placeholder/halftone-06.svg", alt: "Plate 06", ratio: "3/2" },
      ],
      caption: "2023–24 posters and zines.",
    },
  ],
};
