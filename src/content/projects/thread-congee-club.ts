import type { Project } from "@/types/content";

// Promoted from the Cargo import (see docs/cargo-import.md). This piece is
// video-only; its clips auto-associate from public/videos/projects/thread-congee-club/.
export const project: Project = {
  slug: "thread-congee-club",
  title: "Thread & Congee Club's First Birthday",
  section: "installation",
  year: "2025",
  weight: 0.6,
  summary:
    "Real-time, audio-reactive GLSL visuals for Thread and Congee Club's first birthday at Miscellania, Naarm / Melbourne.",
  role: "Visual design, live performance",
  categories: ["Live Visuals", "Club"],
  tags: ["TouchDesigner", "GLSL"],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "A real-time, audio-reactive visual and my second dive into GLSL in TouchDesigner. This time I tried to craft something organic while staying true to the abstraction and palette of Justin Deng's work.",
      ],
    },
    {
      kind: "text",
      paragraphs: [
        "I experimented with a 2D physalis growth system in GLSL and TouchDesigner. Reaction-diffusion shaders generate the vein-like lattices, and curl-noise advection drives the natural branching. Local density clamps act like crowding while decay erodes it in low-nutrient regions, resulting in the visual you see.",
      ],
    },
  ],
};
