import type { Project } from "@/types/content";

export const project: Project = {
  slug: "smokedope2016-2016lyfe",
  title: "2016LYFE — smokedope2016",
  year: "2025",
  weight: 0.75,
  summary:
    "Official music video visual design for smokedope2016 via Lyrical Lemonade. 3D scan–based Gaussian splat environments.",
  role: "Visual design",
  categories: ["Music Video", "VFX"],
  tags: ["TouchDesigner", "Gaussian Splat", "3D Scan"],
  links: [
    { href: "https://www.youtube.com/watch?v=PXHm-sQCzko", label: "official video" },
  ],
  images: [
    {
      src: "/images/projects/smokedope2016-2016lyfe/video.jpg",
      caption: "2016LYFE — official music video",
    },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "For Lyrical Lemonade's premiere of smokedope2016's “2016LYFE”, I created a series of 3D scan–based Gaussian splat visuals in TouchDesigner. Working with 3D artists, we turned entire scenes into splats that grow, dissolve, and morph between moments.",
      ],
    },
    {
      kind: "text",
      paragraphs: [
        "The result is a visual language that feels alive — scenes reconstructed from real space, then made to breathe and come apart in ways only real-time tooling makes possible.",
      ],
    },
    {
      kind: "embed",
      url: "https://www.youtube.com/embed/PXHm-sQCzko",
      caption: "smokedope2016 — 2016LYFE (official music video, Lyrical Lemonade)",
    },
    {
      kind: "video",
      src: "/videos/projects/smokedope2016-2016lyfe/01.mov",
      ratio: "3/2",
      caption: "Gaussian splat environment",
    },
    {
      kind: "video",
      src: "/videos/projects/smokedope2016-2016lyfe/02.mov",
      ratio: "3/2",
      autoplay: false,
      caption: "Scene morph study",
    },
    {
      kind: "video",
      src: "/videos/projects/smokedope2016-2016lyfe/04.mov",
      ratio: "3/2",
      autoplay: false,
      caption: "Splat dissolve",
    },
    {
      kind: "video",
      src: "/videos/projects/smokedope2016-2016lyfe/05.mov",
      ratio: "3/2",
      autoplay: false,
      caption: "4K render pass",
    },
  ],
};
