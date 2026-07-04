import type { Project } from "@/types/content";

// Stub built from CV facts — a press feature. Add the article URL (as a link)
// and the featured works when ready, then remove `unlisted` if you want it in
// the full lists too.
export const project: Project = {
  slug: "abstracted-organica",
  title: "Abstracted Organica",
  section: "installation",
  year: "2026",
  weight: 0.7,
  summary:
    "Featured in It's Nice That's “Abstracted organica: The design trend taking root in Naarm, and the designers doing it best”.",
  role: "Featured artist",
  categories: ["Press", "Feature"],
  unlisted: true,
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Featured in It's Nice That (The View From…) — “Abstracted organica: The design trend taking root in Naarm, and the designers doing it best”, by Gabriella Brown, 16 March 2026.",
      ],
    },
    {
      kind: "text",
      paragraphs: ["Article link and the featured works coming soon."],
    },
  ],
};
