import type { Project } from "@/types/content";

// Promoted from the Cargo import (see docs/cargo-import.md). Photos
// auto-associate from public/images/projects/pitch-far-from-god/.
export const project: Project = {
  slug: "pitch-far-from-god",
  title: "Pitch Music & Arts: Far from God, Close to Heaven",
  section: "installation",
  year: "2025",
  weight: 0.72,
  summary:
    "A three-hour improvised audiovisual set at Pitch Music & Arts, Grampian Plains, Victoria.",
  role: "Visual design, live performance",
  categories: ["Festival", "Live Visuals"],
  tags: ["TouchDesigner", "Live Coding"],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "For my second performance at Pitch Music & Arts, I collaborated with Far from God, Close to Heaven on a three-hour improvised audiovisual set. I performed live visuals on stage, transitioning from abstract starry galaxies to intricate microcosms, the visuals reacting in real time to the improvised music and intertwining with my own spontaneous visual storytelling.",
      ],
    },
  ],
};
