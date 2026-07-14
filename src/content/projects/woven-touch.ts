import type { Project } from "@/types/content";

// Media auto-associates from content/personal explorations/woven-touch/.
export const project: Project = {
  slug: "woven-touch",
  title: "Woven Touch",
  section: "sketch",
  year: "2026",
  weight: 0.55,
  summary:
    "A TouchDesigner instrument that weaves text, images, and 3D geometry into drooping woven thread. Real time, with gravity and click-drag interaction.",
  role: "Personal work, released tool",
  categories: ["Personal", "Tool"],
  tags: ["TouchDesigner", "GLSL"],
  links: [
    {
      href: "https://github.com/nicholaspjm/weaving-type-touchdesigner",
      label: "github",
    },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Woven Touch is a TouchDesigner instrument that weaves text, images, and 3D geometry into drooping woven thread, in real time, with gravity and click-drag interaction. Released as an open tool.",
      ],
    },
  ],
};
