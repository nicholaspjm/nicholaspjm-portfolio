import type { Project } from "@/types/content";

export const project: Project = {
  slug: "abstracted-organica",
  title: "Abstracted Organica",
  section: "installation",
  year: "2026",
  weight: 0.7,
  summary:
    "A recent series spanning multiple practices — Australian landscapes meeting real-time biomimicry (DLA, Physarum). A term coined by Gabriella Brown for It's Nice That.",
  role: "Featured artist",
  categories: ["Press", "Feature"],
  unlisted: true,
  links: [
    {
      href: "https://www.itsnicethat.com/articles/the-view-from-naarm-abstracted-organica-graphic-design-160326",
      label: "read the article",
    },
  ],
  // Mach1's mycelium renders as the featured example of the aesthetic.
  images: [
    { src: "/images/projects/mach1-festival/01.jpg", caption: "Mach1 Festival — mycelium system" },
    { src: "/images/projects/mach1-festival/02.jpg", caption: "Tent installation" },
    { src: "/images/projects/mach1-festival/03.jpg", caption: "Render variation" },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "“Abstracted Organica” — a term coined by Gabriella Brown — was a perfect way to encapsulate a recent series of work that spanned across multiple practices in early 2026. The culmination of inspiration from Australian landscapes and real-time biomimicry-style algorithms (DLA, Physarum, and others) resulted in this.",
      ],
    },
    {
      kind: "quote",
      text: "Nicholas shifts between the geometric and the organic, at times leaning into the grid-like, techier realm of TouchDesigner, and at others into hypnotising formations that reflect patterns in wind or cellular growth. He creates generative visualisers that feel alive, like roots spreading or spores dispersing, mimicking processes seen in nature. While it's easy in TouchDesigner to get lost in a sea of neon (trust me, I've been there), Nicholas grounds his pieces with earthy tones of ashy blues, browns, black and grey. These palettes make his visualisers immersive without being overwhelming. They enhance spaces rather than dominate them, resulting in genuinely beautiful works of art.",
      cite: "Gabriella Brown, It's Nice That",
    },
  ],
};
