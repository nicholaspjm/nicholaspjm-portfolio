/**
 * Tools — released software and TouchDesigner components.
 * Verify repo visibility before launch; links assume github.com/nicholaspjm.
 */

export interface Tool {
  name: string;
  summary: string;
  stack: string;
  links: { href: string; label: string }[];
}

export const tools: Tool[] = [
  {
    name: "blob tracker",
    summary:
      "TouchDesigner-native blob tracking component for interactive floors and walls.",
    stack: "TouchDesigner · .tox",
    links: [
      { href: "https://github.com/nicholaspjm/td-blob-tracker", label: "github" },
    ],
  },
  {
    name: "lumen",
    summary:
      "Live-coding environment for DMX lighting rigs — write patterns live, lights follow on the next beat.",
    stack: "TypeScript · WebSocket · DMX",
    links: [
      { href: "https://github.com/nicholaspjm/dmx-live-code", label: "github" },
    ],
  },
  {
    name: "live coding",
    summary:
      "Live-coding environment for real-time visuals — write, hear, and see the patch change while it runs.",
    stack: "TouchDesigner · Python",
    links: [{ href: "https://github.com/nicholaspjm", label: "github" }],
  },
  {
    name: "wiki visualiser",
    summary:
      "Turns Wikipedia — articles, link graphs, live edits — into real-time visual maps.",
    stack: "TypeScript · WebGL",
    links: [{ href: "https://github.com/nicholaspjm", label: "github" }],
  },
  {
    name: "datamosh",
    summary:
      "Datamoshing as an instrument — compression-artifact glitching made controllable and performable.",
    stack: "TouchDesigner · GLSL",
    links: [{ href: "https://github.com/nicholaspjm", label: "github" }],
  },
  {
    name: "palette chooser",
    summary:
      "Real-time palette extraction — k-means colour analysis of any image or live feed into usable swatch palettes.",
    stack: "TouchDesigner · Python",
    links: [{ href: "https://github.com/nicholaspjm", label: "github" }],
  },
  {
    name: "TD-Notes-Tools",
    summary:
      "Two external .tox note panels for TouchDesigner — a notebook and a sticky canvas that link to and jump to nodes.",
    stack: "TouchDesigner · Python",
    links: [
      { href: "https://github.com/nicholaspjm/TD-Notes-Tools", label: "github" },
    ],
  },
  {
    name: "td-ascii-patterns",
    summary: "ASCII pattern generators for TouchDesigner compositions.",
    stack: "TouchDesigner · GLSL",
    links: [
      { href: "https://github.com/nicholaspjm/td-ascii-patterns", label: "github" },
    ],
  },
  {
    name: "claude-ableton-visualizer",
    summary:
      "Ableton Live session data piped into AI-assisted real-time visuals.",
    stack: "Python · Max for Live",
    links: [
      {
        href: "https://github.com/nicholaspjm/claude-ableton-visualizer",
        label: "github",
      },
    ],
  },
];
