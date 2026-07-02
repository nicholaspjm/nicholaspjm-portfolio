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
    name: "zed-blob-tracker",
    summary:
      "Overhead depth people-tracker: ZED camera → stable blob tracks → OSC into TouchDesigner. Built for 24/7 installation duty on Jetson.",
    stack: "Python · ZED SDK · OSC",
    links: [
      { href: "https://github.com/nicholaspjm/zed-blob-tracker", label: "github" },
    ],
  },
  {
    name: "zed-ai-tracker",
    summary:
      "Human tracker running natively on the ZED Box Mini: local YOLO inference on Jetson, same OSC contract as the blob tracker.",
    stack: "Python · YOLO · Jetson",
    links: [
      { href: "https://github.com/nicholaspjm/zed-ai-tracker", label: "github" },
    ],
  },
  {
    name: "zed-ndi",
    summary:
      "Streams any ZED camera view — depth, RGB, confidence — over NDI to TouchDesigner or anything else on the network.",
    stack: "Python · NDI",
    links: [{ href: "https://github.com/nicholaspjm/zed-ndi", label: "github" }],
  },
  {
    name: "td-blob-tracker",
    summary:
      "TouchDesigner-native blob tracking component for interactive floors and walls.",
    stack: "TouchDesigner · .tox",
    links: [
      { href: "https://github.com/nicholaspjm/td-blob-tracker", label: "github" },
    ],
  },
  {
    name: "dmx-live-code",
    summary:
      "Live-coding environment for DMX lighting rigs — write patterns in the browser, lights follow on the next beat.",
    stack: "TypeScript · WebSocket · DMX",
    links: [
      { href: "https://github.com/nicholaspjm/dmx-live-code", label: "github" },
    ],
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
