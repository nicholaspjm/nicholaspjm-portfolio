import type { Project } from "@/types/content";

export const project: Project = {
  slug: "cat-among-animals",
  title: "Cat Among Animals",
  section: "installation",
  year: "2025",
  weight: 0.65,
  summary:
    "Collaborative live-coded audiovisual performance with Steve Pan, curated by Chloé at Oddany Gallery.",
  role: "Live coding, visual performance",
  categories: ["Performance", "Live Coding", "Collaboration"],
  tags: ["TouchDesigner", "Live Coding"],
  links: [
    { href: "https://youtu.be/tdmt2EjIpME", label: "watch" },
  ],
  images: [
    { youtube: "tdmt2EjIpME", caption: "Cat Among Animals, full performance" },
    { src: "/images/projects/cat-among-animals/01.jpg", caption: "Oddany Gallery" },
    { src: "/images/projects/cat-among-animals/03.jpg", caption: "Live performance" },
    { src: "/images/projects/cat-among-animals/04.jpg", caption: "With Steve Pan" },
    { src: "/images/projects/cat-among-animals/05.jpg", caption: "Live coding" },
    { src: "/images/projects/cat-among-animals/06.jpg", caption: "Performance" },
    { src: "/images/projects/cat-among-animals/02.jpg", caption: "Documentation" },
  ],
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Cat Among Animals is a collaborative audiovisual performance with Steve Pan, curated by Chloé at Oddany Gallery, Naarm / Melbourne. It is the third collaboration between Steve and me, and a further step into live coding: letting the process and improvisation of live code guide the piece.",
      ],
    },
    {
      kind: "text",
      paragraphs: [
        "I've been increasingly drawn to narrative structure in new media, exploring how story can surface through live coding's inherent movement and shifting forms, rather than through technical display. The entire performance is edited and available to watch online.",
      ],
    },
    {
      kind: "embed",
      url: "https://www.youtube.com/embed/tdmt2EjIpME",
      caption: "Cat Among Animals, live TouchDesigner AV performance with Steve Pan",
    },
    {
      kind: "video",
      src: "/videos/projects/cat-among-animals/01.mov",
      ratio: "16/9",
      caption: "Live-coded visuals",
    },
    {
      kind: "video",
      src: "/videos/projects/cat-among-animals/03.mov",
      ratio: "16/9",
      autoplay: false,
      caption: "Performance capture",
    },
    {
      kind: "text",
      paragraphs: ["Photography by Kelly Li."],
    },
  ],
};
