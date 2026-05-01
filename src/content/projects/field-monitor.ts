import type { Project } from "@/types/content";

export const project: Project = {
  slug: "field-monitor",
  title: "Field Monitor",
  year: "2023",
  summary:
    "A quiet wall-mounted screen reading mmWave radar and turning the room's motion into typography.",
  role: "Direction · Hardware · Code",
  categories: ["Installation", "Hardware"],
  tags: ["mmWave", "Arduino", "TouchDesigner"],
  cover: {
    src: "/images/placeholder/halftone-04.svg",
    alt: "Concentric circles target with a blue centre.",
    ratio: "3/2",
  },
  blocks: [
    {
      kind: "text",
      lead: true,
      paragraphs: [
        "<em>Field Monitor</em> is a single screen, hung at eye height, that displays a constantly updating sentence describing the room — read out from a 24GHz mmWave radar mounted just below the bezel.",
      ],
    },
    {
      kind: "image",
      src: "/images/placeholder/halftone-04.svg",
      alt: "Target plate.",
      ratio: "1/1",
      layout: "inset",
    },
    {
      kind: "text",
      paragraphs: [
        "The radar reads up to four people at once, returning their distance, angle, and approximate speed at 30Hz. A small grammar engine assembles these into terse sentences: <em>three slow bodies near, one fast far</em>.",
      ],
    },
    {
      kind: "divider",
      label: "Build notes",
    },
    {
      kind: "text",
      paragraphs: [
        "The radar is a HiLink HLK-LD2410B mounted on a custom carrier. Sentences are typeset live in TouchDesigner using a custom CHOP that buffers radar frames over a five-second window before committing to a phrase.",
      ],
    },
  ],
};
