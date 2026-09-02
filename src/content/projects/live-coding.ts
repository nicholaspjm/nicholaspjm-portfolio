import type { Project } from "@/types/content";

export const project: Project = {
  slug: "live-coding",
  title: "Live AV Performances",
  section: "installation",
  year: "2025",
  date: "2024-2025, Naarm / Melbourne",
  credits: ["dshut", "Six12", "Oddany Gallery"],
  weight: 0.6,
  summary:
    "A series of live audiovisual performances across 2024 and 2025, at dshut, Six12 and Oddany Gallery: sound and visuals built live in front of an audience.",
  role: "Live audiovisual performance",
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
        "A series of live audiovisual performances across 2024 and 2025, at dshut, Six12 and Oddany Gallery. An exploration of constructing sound and visuals together in real time, in front of an audience, with nothing prepared in advance.",
      ],
    },
    {
      kind: "text",
      paragraphs: [
        "Everything is built live, so the visuals respond to the sound as it happens and the audience watches the construction itself rather than a finished piece. The renders and clips here are from across the series.",
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
      src: "/videos/projects/live-coding/01.mp4",
      ratio: "9/16",
      autoplay: false,
      caption: "Set capture",
    },
  ],
};
