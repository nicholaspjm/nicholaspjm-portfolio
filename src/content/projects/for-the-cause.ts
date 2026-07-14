import type { Project } from "@/types/content";

export const project: Project = {
  slug: "for-the-cause-25",
  title: "For The Cause 2025",
  section: "installation",
  year: "2025",
  weight: 0.75,
  summary:
    "Main-stage visual design for For The Cause (FTC), an intimate festival on Boonwurrung Country.",
  role: "Visual / lighting design",
  categories: ["Festival", "Live Visuals"],
  tags: ["TouchDesigner", "GLSL"],
  images: [
    { src: "/images/projects/for-the-cause-25/01.jpg", caption: "For The Cause, Boonwurrung Country" },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "For The Cause (FTC) is an intimate festival held on Boonwurrung Country. I curated the main-stage visuals across the entirety of the event, 28 to 30 March 2025.",
      ],
    },
    {
      kind: "text",
      paragraphs: [
        "I built an endlessly evolving GLSL fractal as the backbone of the set, alongside a suite of other real-time GLSL pieces that reacted to the night.",
      ],
    },
    {
      kind: "video",
      src: "/videos/projects/for-the-cause-25/01.mp4",
      ratio: "16/9",
      caption: "Main-stage visual",
    },
    {
      kind: "video",
      src: "/videos/projects/for-the-cause-25/02.mp4",
      ratio: "16/9",
      autoplay: false,
      caption: "Evolving GLSL fractal",
    },
    {
      kind: "video",
      src: "/videos/projects/for-the-cause-25/05.mp4",
      ratio: "16/9",
      autoplay: false,
    },
  ],
};
