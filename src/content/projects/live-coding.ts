import type { Project } from "@/types/content";

export const project: Project = {
  slug: "live-coding",
  title: "Live Visual Coding",
  section: "installation",
  year: "2025",
  weight: 0.6,
  summary:
    "Live-coded visual performances — Six12 with Steve Pan, Odd Chaos, and Pop Pop with Cy_.",
  role: "Live coding, visual performance",
  categories: ["Performance", "Live Coding"],
  tags: ["TouchDesigner", "GLSL", "Live Coding"],
  images: [
    { src: "/images/projects/live-coding/01.png", caption: "Live coding set" },
    { src: "/images/projects/live-coding/02.jpg", caption: "Performance" },
    { src: "/images/projects/live-coding/03.jpg", caption: "On stage" },
    { src: "/images/projects/live-coding/04.jpg", caption: "Rendered frame" },
    { src: "/images/projects/live-coding/05.jpg", caption: "Code and visuals" },
    { src: "/images/projects/live-coding/06.jpg", caption: "Frame study" },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Live coding is the use of code in real time as both a creative tool and a performance medium. It produces visuals that shift and evolve spontaneously with music, touch, or environment — blurring the line between programming and performance.",
      ],
    },
    {
      kind: "text",
      paragraphs: [
        "I craft all my visuals live so they can respond dynamically, while the audience sees the code unfold alongside the visuals and sound. The renders and clips here are from recent performances that featured live coding — Six12 with Steve Pan, Odd Chaos, and Pop Pop with Cy_.",
      ],
    },
    {
      kind: "video",
      src: "/videos/projects/live-coding/04.mp4",
      ratio: "16/9",
      caption: "Live-coded performance",
    },
    {
      kind: "video",
      src: "/videos/projects/live-coding/01.mov",
      ratio: "9/16",
      autoplay: false,
      caption: "Set capture",
    },
  ],
};
