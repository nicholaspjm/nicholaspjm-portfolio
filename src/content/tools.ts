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
    // patchplot, August 2026
    name: "patchplot",
    summary:
      "A lighting plot planner for clubs and small venues, in one file. Drag fixtures onto a drafting-style plan, carry DMX patch data on every unit, draw the wire runs, and have address conflicts flagged per universe.",
    stack: "JavaScript · Web",
    links: [
      { href: "https://nicholaspjm.github.io/patchplot/", label: "open" },
      { href: "https://github.com/nicholaspjm/patchplot", label: "github" },
    ],
  },
  {
    // gobo-dmx-live-code, August 2026. Formerly lumen-dmx-live-code; the old
    // URL only still works because GitHub redirects a renamed repo.
    name: "gobo",
    summary:
      "Live-code DMX lighting in the browser. Pattern code drives Art-Net, sACN and OSC fixtures, with a fixture simulator and a 512-channel monitor beside the editor.",
    stack: "TypeScript · Art-Net · sACN · OSC",
    links: [
      {
        href: "https://nicholaspjm.github.io/gobo-dmx-live-code/",
        label: "open",
      },
      {
        href: "https://github.com/nicholaspjm/gobo-dmx-live-code",
        label: "github",
      },
    ],
  },
  {
    // nts-desktop, August 2026
    name: "nts desktop",
    summary:
      "Unofficial desktop player for NTS Radio: live channels, Infinite Mixtapes, and archive search and playback, with a watchdog that reconnects a dropped stream.",
    stack: "TypeScript · React · Electron",
    links: [
      { href: "https://github.com/nicholaspjm/nts-desktop", label: "github" },
    ],
  },
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
    // orbbec-astra-touchdesigner, May 2026
    name: "orbbec astra for touchdesigner",
    summary:
      "OpenNI2 callbacks for streaming depth, colour, IR and pointcloud off an Orbbec Astra into TouchDesigner Script TOPs, all at once.",
    stack: "Python · OpenNI2",
    links: [
      {
        href: "https://github.com/nicholaspjm/orbbec-astra-touchdesigner",
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
