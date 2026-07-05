import type { Project } from "@/types/content";

// Promoted from the Cargo import (see docs/cargo-import.md). Photos
// auto-associate from public/images/projects/atmos-norla-dome/.
export const project: Project = {
  slug: "atmos-norla-dome",
  title: "Atmos, Norla Dome",
  section: "installation",
  year: "2024",
  weight: 0.6,
  summary:
    "Live, projection-mapped visuals for Atmos at the Norla Dome, Naarm / Melbourne.",
  role: "Visual design, live performance",
  categories: ["Live Visuals", "Projection Mapping"],
  tags: ["TouchDesigner"],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "For Atmos, I mapped multiple projects onto the curved surface of the Norla Dome to create an immersive experience, with all visuals captured and performed live in real time.",
      ],
    },
  ],
};
