import type { Project } from "@/types/content";

export const project: Project = {
  slug: "weaving-type",
  title: "Weaving Type",
  section: "sketch",
  year: "2025",
  summary:
    "Drooping woven-stitch typography — a mask becomes thousands of hanging threads. CPU topology bake plus a GPU compute deform for a ~5× speedup.",
  role: "For fun",
  categories: ["Sketch", "Typography"],
  tags: ["TouchDesigner", "GLSL"],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "A TouchDesigner port of airfan003's WeavingType: any mask or glyph becomes a woven stitch field that droops under gravity. Rebuilt GPU-native — topology baked once on CPU, then a GLSL compute deform keeps every look parameter live while running about five times faster.",
      ],
    },
  ],
};
