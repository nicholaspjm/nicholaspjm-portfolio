import type { Project } from "@/types/content";

export const project: Project = {
  slug: "nin-as-alive-as-you-need-me-to-be",
  title: "Nine Inch Nails — As Alive As You Need Me To Be",
  year: "2025",
  weight: 1,
  summary:
    "Official music video visual design for Nine Inch Nails. Winner, Best Rock Song, 68th Grammy Awards (2026).",
  role: "Visual design",
  categories: ["Music Video", "Award"],
  tags: ["TouchDesigner", "GLSL", "Particles"],
  links: [
    { href: "https://www.youtube.com/watch?v=SnMyroAH0rg", label: "official video" },
    { href: "https://www.instagram.com/p/DJdm9BCypp7/", label: "instagram" },
  ],
  images: [
    { src: "/images/projects/nin-as-alive-as-you-need-me-to-be/01.jpg", caption: "Particle field render" },
    { src: "/images/projects/nin-as-alive-as-you-need-me-to-be/03.jpg", caption: "Depth-augmented footage" },
    { src: "/images/projects/nin-as-alive-as-you-need-me-to-be/04.jpg", caption: "Layered video feedback" },
    { src: "/images/projects/nin-as-alive-as-you-need-me-to-be/05.jpg", caption: "Grade session boards" },
    { src: "/images/projects/nin-as-alive-as-you-need-me-to-be/06.jpg", caption: "On set" },
    { src: "/images/projects/nin-as-alive-as-you-need-me-to-be/07.jpg", caption: "Frame study" },
    { src: "/images/projects/nin-as-alive-as-you-need-me-to-be/02.jpg", caption: "In progress" },
    { src: "/images/projects/nin-as-alive-as-you-need-me-to-be/08.jpg", caption: "Behind the scenes" },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Commissioned by 1080p Studios to design visuals for Nine Inch Nails' official music video “As Alive As You Need Me To Be”. The work was developed entirely in TouchDesigner using custom shaders, lidar / 3D footage, real-time particle systems, and layered video processing.",
      ],
    },
    {
      kind: "text",
      paragraphs: [
        "The system combined GPU-driven particle fields, custom GLSL shaders, depth-augmented footage, and layered video feedback to translate the track's intensity into evolving visual structures. Live iteration on set let me adjust turbulence, distortion, and palette in real time against different edits of the song, keeping the motion language aligned with the band's vision.",
      ],
    },
    {
      kind: "embed",
      url: "https://www.youtube.com/embed/SnMyroAH0rg",
      caption: "Nine Inch Nails — As Alive As You Need Me To Be (official music video)",
    },
    {
      kind: "video",
      src: "/videos/projects/nin-as-alive-as-you-need-me-to-be/01.mp4",
      ratio: "16/12",
      caption: "Particle system pass",
    },
    {
      kind: "text",
      paragraphs: [
        "The single was awarded Best Rock Song at the 68th Annual Grammy Awards, 1 February 2026.",
      ],
    },
  ],
};
