import type { SiteInfo } from "@/types/content";

export const site: SiteInfo = {
  name: "Nicholas Marriott",
  shortName: "NPJM",
  // Never rendered on screen — this is the meta description and OG blurb, so
  // it is written for a search result: name first, discipline, then place.
  // Kept under ~160 characters so Google shows it whole.
  tagline:
    "Nicholas Marriott (nicholaspjm), TouchDesigner artist and creative technologist in Naarm / Melbourne. Projection mapping, audio-reactive visuals, installation.",
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
  alsoKnownAs: ["nicholaspjm", "Nick Marriott", "NPJM"],
  // The vocabulary the site should be findable by. Used for JSON-LD
  // `knowsAbout` and as the source for page descriptions — not stuffed into
  // body copy, which search engines discount and readers notice.
  keywords: [
    "projection mapping",
    "projection design",
    "new media art",
    "creative technology",
    "creative technologist",
    "audio-reactive visuals",
    "interactive installation",
    "real-time graphics",
    "live visuals",
    "TouchDesigner",
    "GLSL",
    "generative art",
    "stage and festival visuals",
    "VJ",
    "Melbourne",
    "Naarm",
    "Australia",
  ],
  // Paste your Google Analytics 4 Measurement ID here (Admin -> Data streams ->
  // your web stream -> "Measurement ID", looks like "G-XXXXXXXXXX"). Leaving it
  // blank disables analytics. Only loads on the production build.
  gaId: "",
};
