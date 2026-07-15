import type { Project } from "@/types/content";

// Media auto-associates from content/installation & performance/handclap-album-launch/.
// Details to be filled in; summary and text are editable in the studio.
export const project: Project = {
  slug: "handclap-album-launch",
  title: "Hand Clap Album Launch",
  section: "installation",
  year: "2026",
  weight: 0.6,
  summary:
    "Visuals for Hand Clap's album launch, Naarm / Melbourne.",
  role: "Live visuals",
  categories: ["Performance", "Live Visuals"],
  tags: ["TouchDesigner"],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Visuals for the album launch of Hand Clap, whose practice sits at the crossroads of ambient music, electronic experimentation, string composition, and visual art. Naarm / Melbourne.",
      ],
    },
  ],
};
