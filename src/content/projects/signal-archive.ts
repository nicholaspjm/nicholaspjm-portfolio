import type { Project } from "@/types/content";

export const project: Project = {
  slug: "signal-archive",
  title: "Signal Archive",
  year: "2024",
  summary:
    "A real-time installation translating field recordings into a printed,  scrolling broadsheet.",
  role: "Direction · Code · Type",
  categories: ["Installation", "Code"],
  tags: ["TouchDesigner", "WebGL", "Risograph"],
  cover: {
    src: "/images/placeholder/halftone-01.svg",
    alt: "Concentric circles over halftone dots, single blue accent.",
    ratio: "3/2",
  },
  blocks: [
    {
      kind: "text",
      heading: "Brief",
      lead: true,
      paragraphs: [
        "<em>Signal Archive</em> is an ongoing piece in which sound captured in transit — train platforms, hotel lobbies, the dead air of empty rooms — is parsed into typeset broadsheet pages, printed live as visitors approach.",
      ],
    },
    {
      kind: "image",
      src: "/images/placeholder/halftone-01.svg",
      alt: "Plate 01 — concentric circles.",
      ratio: "3/2",
      layout: "bleed",
      caption: "Plate 01 / hero — printed at 1:1 from the live patch.",
    },
    {
      kind: "text",
      paragraphs: [
        "The system runs in TouchDesigner, with a small Node service brokering between the audio analysis chain and a custom layout engine. Each visitor's arrival reshapes the page in front of them.",
        "Every page is a one-off. The archive grows by one sheet every twelve seconds; older sheets are scanned, indexed, and added to the rolling broadsheet displayed on the wall.",
      ],
    },
    {
      kind: "gallery",
      columns: 3,
      items: [
        { src: "/images/placeholder/halftone-04.svg", alt: "circuit", ratio: "1/1" },
        { src: "/images/placeholder/halftone-05.svg", alt: "target", ratio: "1/1" },
        { src: "/images/placeholder/halftone-06.svg", alt: "signal", ratio: "1/1" },
      ],
      caption: "Production plates 04–06.",
    },
    {
      kind: "quote",
      text: "A page is just a moment that didn't get away.",
      cite: "studio note, 2024",
    },
    {
      kind: "image",
      src: "/images/placeholder/halftone-02.svg",
      alt: "Topographic curves with a single blue square.",
      ratio: "3/2",
      caption: "Layout test — topographic ground.",
    },
  ],
};
