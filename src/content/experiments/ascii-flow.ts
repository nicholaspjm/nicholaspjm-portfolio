import type { Experiment } from "@/types/content";

export const experiment: Experiment = {
  slug: "ascii-flow",
  title: "ASCII Flow",
  year: "2025",
  summary:
    "A grid of monospaced glyphs sampling a moving flow field. The cursor punches a heat ring of brighter characters into the field.",
  tags: ["Canvas", "Type"],
  component: "ascii-flow",
  blocks: [
    {
      kind: "text",
      paragraphs: [
        "No WebGL — just a 2D canvas. Each cell picks a glyph from a brightness ramp by sampling a noise field. The cursor adds a radial 1/r term to the field, so glyphs near the pointer brighten and turn blue.",
      ],
    },
  ],
};
