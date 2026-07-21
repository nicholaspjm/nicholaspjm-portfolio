import type { SiteInfo } from "@/types/content";

export const site: SiteInfo = {
  name: "Nicholas Marriott",
  shortName: "NPJM",
  tagline:
    "Designer and technologist working across audio-reactive visuals, interactive installation, and real-time systems. Based in Naarm / Melbourne.",
  url: "https://nicholaspjm.com",
  email: "contact@nicholaspjm.com",
  social: [
    { label: "Instagram", href: "https://instagram.com/nicholaspjm" },
    { label: "YouTube", href: "https://youtube.com/@nicholaspjm" },
    { label: "GitHub", href: "https://github.com/nicholaspjm" },
  ],
  nav: [
    { label: "Index", href: "/" },
    { label: "Work", href: "/work" },
    { label: "Sketches", href: "/sketches" },
    { label: "CV", href: "/cv" },
    { label: "Info", href: "/info" },
  ],
  // Paste your Google Analytics 4 Measurement ID here (Admin -> Data streams ->
  // your web stream -> "Measurement ID", looks like "G-XXXXXXXXXX"). Leaving it
  // blank disables analytics. Only loads on the production build.
  gaId: "",
};
