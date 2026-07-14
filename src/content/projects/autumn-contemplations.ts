import type { Project } from "@/types/content";

// Media auto-associates from content/personal explorations/autumn-contemplations/.
// Summary and text are editable in the studio (work.autumn-contemplations.*).
export const project: Project = {
  slug: "autumn-contemplations",
  title: "Autumn Contemplations",
  section: "sketch",
  year: "2026",
  weight: 0.5,
  summary:
    "A personal series of real-time studies: slow, organic systems in an autumn palette.",
  role: "Personal work",
  categories: ["Personal", "Real-time"],
  tags: ["TouchDesigner", "GLSL"],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "A personal series of real-time studies: slow, organic systems in an autumn palette.",
      ],
    },
  ],
};
