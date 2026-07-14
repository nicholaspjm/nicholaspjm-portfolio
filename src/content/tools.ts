/**
 * Public tools: released software and TouchDesigner components.
 * Ordered by release date, newest first (repo creation dates where public;
 * tools without a public repo follow, oldest-known last).
 */

export interface Tool {
  name: string;
  summary: string;
  stack: string;
  links: { href: string; label: string }[];
}

export const tools: Tool[] = [
  {
    // weaving-type-touchdesigner, July 2026
    name: "Woven Touch",
    summary:
      "A TouchDesigner instrument that weaves text, images, and 3D geometry into drooping woven thread. Real time, with gravity and click-drag interaction.",
    stack: "TouchDesigner · GLSL",
    links: [
      {
        href: "https://github.com/nicholaspjm/weaving-type-touchdesigner",
        label: "github",
      },
    ],
  },
  {
    // lumen-dmx-live-code, April 2026
    name: "lumen",
    summary:
      "Live-coding environment for DMX lighting rigs. Write patterns live and the lights follow on the next beat.",
    stack: "TypeScript · Art-Net · DMX",
    links: [
      {
        href: "https://github.com/nicholaspjm/lumen-dmx-live-code",
        label: "github",
      },
    ],
  },
  {
    // blobtracker, January 2026
    name: "blob tracker",
    summary:
      "TouchDesigner-native blob tracking component for interactive floors and walls.",
    stack: "TouchDesigner · OpenCV",
    links: [
      { href: "https://github.com/nicholaspjm/blobtracker", label: "github" },
    ],
  },
  {
    // web-blob-tracker, January 2026
    name: "web blob tracker",
    summary:
      "The blob-tracker detection look running natively in the browser, no TouchDesigner required.",
    stack: "JavaScript · Web",
    links: [
      {
        href: "https://github.com/nicholaspjm/web-blob-tracker",
        label: "github",
      },
    ],
  },
  {
    name: "wiki visualiser",
    summary:
      "Turns Wikipedia into real-time visual maps from articles, link graphs, and live edits. Co-developed with Steven Croker; download via their Patreon.",
    stack: "TypeScript · WebGL",
    links: [
      { href: "https://www.patreon.com/stevencokerfan", label: "patreon" },
    ],
  },
  {
    name: "datamosh",
    summary:
      "Datamoshing as an instrument. Compression-artifact glitching made controllable and performable.",
    stack: "TouchDesigner · GLSL",
    links: [
      {
        href: "https://www.patreon.com/PJCreations/posts/free-datamosh-150619699",
        label: "patreon",
      },
    ],
  },
  {
    name: "palette chooser",
    summary:
      "Real-time palette extraction using k-means colour analysis, turning any image or live feed into usable swatch palettes.",
    stack: "TouchDesigner · Python",
    links: [
      {
        href: "https://www.patreon.com/PJCreations/posts/touchdesigner-161131590",
        label: "patreon",
      },
    ],
  },
  {
    name: "TD-Notes-Tools",
    summary:
      "Two external .tox note panels for TouchDesigner: a notebook and a sticky canvas that link to and jump to nodes.",
    stack: "TouchDesigner · Python",
    links: [
      {
        href: "https://www.patreon.com/PJCreations/posts/free-notes-tool-160785727",
        label: "patreon",
      },
    ],
  },
];
