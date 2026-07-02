import type { Project } from "@/types/content";

export const project: Project = {
  slug: "orca-sequencer",
  title: "Orca in TouchDesigner",
  section: "sketch",
  year: "2025",
  summary:
    "A faithful, playable port of the Orca livecoding language running inside TouchDesigner — editable program, OSC and CHOP voice outputs, plus a generative visual built from its dot-grid look.",
  role: "For fun",
  categories: ["Sketch", "Livecoding"],
  tags: ["TouchDesigner", "Orca"],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "A real source port of Orca (hundredrabbits) as a TouchDesigner Base COMP: the interpreter runs the actual language, the grid is live-editable, and voices leave over OSC and CHOPs to drive whatever is nearby. A companion piece recreates the Orca look as a generative visual engine.",
      ],
    },
  ],
};
