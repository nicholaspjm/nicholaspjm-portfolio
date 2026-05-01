import type { Project } from "@/types/content";

export const project: Project = {
  slug: "room-tone",
  title: "Room Tone",
  year: "2023",
  summary:
    "Audio-reactive identity for an electronic music label — a generative cover system run from a single seed per release.",
  role: "Identity · Code",
  categories: ["Identity", "Code", "Motion"],
  tags: ["WebGL", "Generative"],
  cover: {
    src: "/images/placeholder/halftone-06.svg",
    alt: "Signal print with binary header.",
    ratio: "3/2",
  },
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "An identity for a label that releases mostly ambient and field-recorded music. Each release receives a deterministic cover image, generated from a seed derived from the release's catalogue number.",
      ],
    },
    {
      kind: "image",
      src: "/images/placeholder/halftone-06.svg",
      alt: "Signal print.",
      ratio: "3/2",
      layout: "center",
    },
    {
      kind: "text",
      paragraphs: [
        "The same code base produces the static cover, the animated motion identity for live shows, and the audio-reactive visualiser bundled with the digital release.",
      ],
    },
    {
      kind: "video",
      src: "/videos/placeholder/.gitkeep",
      poster: "/images/placeholder/halftone-02.svg",
      ratio: "16/9",
      caption: "Drop a real .mp4 alongside this poster — the player will pick it up.",
      autoplay: false,
    },
  ],
};
