import type { Experiment } from "@/types/content";

export const experiment: Experiment = {
  slug: "particles",
  title: "Particles 001",
  year: "2025",
  summary:
    "Twelve thousand particles drifting through a coarse curl-noise flow field. The cursor pulls them in like a magnet through iron filings.",
  tags: ["WebGL", "R3F"],
  component: "particles",
  blocks: [
    {
      kind: "text",
      paragraphs: [
        "Each particle keeps a tiny velocity buffer. The flow field is the cheap version — sin/cos of the position, offset by time — but it's enough to read as wind.",
        "Cursor attraction is plain inverse-square pull. Limit it to a small radius if you don't want particles to escape the screen.",
      ],
    },
  ],
};
