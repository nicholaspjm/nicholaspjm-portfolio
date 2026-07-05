import type { Project } from "@/types/content";

export const project: Project = {
  slug: "forgotten-once-remembered",
  title: "Forgotten, Once Remembered",
  section: "installation",
  year: "2025",
  summary:
    "Interactive audiovisual dance piece with Grace Kim (Nabii), interpreted by Carmen Y 易嘉敏. Pitch Music & Arts and Babie Club.",
  role: "Concept, code",
  categories: ["Installation", "Interactive", "Collaboration"],
  tags: ["TouchDesigner", "Interactive"],
  links: [
    { href: "https://www.youtube.com/watch?v=EnOhNIyQtSk", label: "watch" },
  ],
  images: [
    { src: "/images/projects/forgotten-once-remembered/01.jpg", caption: "Pitch Music & Arts" },
    { src: "/images/projects/forgotten-once-remembered/03.jpg", caption: "Interactive dance piece" },
    { src: "/images/projects/forgotten-once-remembered/02.jpg", caption: "Babie Club" },
    { src: "/images/projects/forgotten-once-remembered/04.jpg", caption: "Performance" },
    { src: "/images/projects/forgotten-once-remembered/05.jpg", caption: "Documentation" },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Forgotten, Once Remembered is an interactive audiovisual piece by Nick Marriott and Grace Kim (Nabii), interpreted and brought to life by Carmen Y 易嘉敏. Presented at Pitch Music & Arts Festival and Babie Club, Naarm / Melbourne.",
      ],
    },
    {
      kind: "embed",
      url: "https://www.youtube.com/embed/EnOhNIyQtSk",
      caption: "Forgotten, Once Remembered, an interactive TouchDesigner dance piece",
    },
    {
      kind: "video",
      src: "/videos/projects/forgotten-once-remembered/01.mov",
      ratio: "9/16",
      caption: "Live capture",
    },
  ],
};
