import type { Project } from "@/types/content";

/* ===========================================================================
   TEMPLATE: how to add a project's images, videos, and text.

   1. Drop media into this project's folders:
        public/images/projects/the-xx-festival-tour/   (jpg / png / webp)
        public/videos/projects/the-xx-festival-tour/   (mp4 / webm)

   2. Reference them below. The `blocks` array is the page body, top to
      bottom, mixing text, images, and video in any order. The `images` array
      (further down) renders as a simple gallery row under the entry.
      Video embeds use { youtube: "<id>", start?: <seconds> } in `images`.

   Block kinds you can use:
     { kind: "text", paragraphs: ["…", "…"], lead?: true }
     { kind: "image", src: "/images/projects/<slug>/01.jpg", alt: "…", caption?: "…", ratio?: "16/9" }
     { kind: "video", src: "/videos/projects/<slug>/clip.mp4", poster?: "/images/…/poster.jpg", caption?: "…" }
     { kind: "quote", text: "…", cite?: "…" }
     { kind: "divider" }
   =========================================================================== */

export const project: Project = {
  slug: "the-xx-festival-tour",
  title: "The xx Festival Tour",
  year: "2026",
  weight: 1,
  summary:
    "Audio-reactive TouchDesigner visual design for The xx's 2026 festival tour, including Coachella Main Stage.",
  role: "Visual design",
  categories: ["Live Visuals", "Touring"],
  tags: ["TouchDesigner", "Audio-reactive"],

  // Page body: write text and drop media here, in order.
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "Audio-reactive TouchDesigner visual design for The xx's 2026 festival run, including Coachella Main Stage. Built in collaboration with MTLA Studio, Axonbody and Forms.",
      ],
    },
    // Add media once files are in the folders, e.g.:
    // {
    //   kind: "video",
    //   src: "/videos/projects/the-xx-festival-tour/coachella.mp4",
    //   poster: "/images/projects/the-xx-festival-tour/poster.jpg",
    //   caption: "Coachella main stage, weekend 1",
    // },
    // {
    //   kind: "text",
    //   paragraphs: ["A second paragraph, after the clip."],
    // },
  ],

  // Gallery row shown under the entry. Add as many as you like:
  // images: [
  //   { src: "/images/projects/the-xx-festival-tour/01.jpg", caption: "…" },
  //   { src: "/images/projects/the-xx-festival-tour/02.jpg", caption: "…" },
  // ],
};
