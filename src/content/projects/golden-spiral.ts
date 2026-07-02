import type { Project } from "@/types/content";

export const project: Project = {
  slug: "golden-spiral",
  title: "Golden Spiral Overlay",
  section: "sketch",
  year: "2025",
  summary:
    "Real-time golden-ratio spiral that anchors itself to whatever the camera sees — corner detection and PCA find the composition, a GLSL spiral snaps to it.",
  role: "For fun",
  categories: ["Sketch", "Computer Vision"],
  tags: ["TouchDesigner", "OpenCV"],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "A live compositional critic: Shi-Tomasi corner detection and PCA estimate the dominant structure of an incoming image, and a GLSL Fibonacci spiral re-anchors itself to that structure in real time. Point it at anything and it tells you where the golden ratio thinks the subject should be.",
      ],
    },
  ],
};
