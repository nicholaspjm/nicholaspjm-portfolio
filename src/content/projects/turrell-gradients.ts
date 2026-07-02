import type { Project } from "@/types/content";

export const project: Project = {
  slug: "turrell-gradients",
  title: "Turrell Gradients",
  section: "sketch",
  year: "2025",
  summary:
    "A James-Turrell-style ultra-soft gradient instrument — 32-bit float colour with dithering, ten patterns, eleven palettes, playable like an instrument in a live set.",
  role: "For fun",
  categories: ["Sketch", "Light"],
  tags: ["TouchDesigner", "GLSL"],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "An instrument for making the softest possible gradients: 32-bit float colour end to end with a dither pass so nothing bands, ten field patterns, eleven palettes, and look presets that can be randomised and morphed live. Built to sit behind performers and behave like weather.",
      ],
    },
  ],
};
