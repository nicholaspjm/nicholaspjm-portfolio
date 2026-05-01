import type { SiteInfo } from "@/types/content";

export const site: SiteInfo = {
  name: "Nicholas PJM",
  shortName: "NPJM",
  tagline:
    "Designer, technologist, and image-maker working at the seam of code and physical media.",
  url: "https://nicholaspjm.com",
  email: "hello@nicholaspjm.com",
  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Vimeo", href: "https://vimeo.com/" },
    { label: "GitHub", href: "https://github.com/" },
    { label: "Are.na", href: "https://www.are.na/" },
  ],
  nav: [
    { label: "Index", href: "/" },
    { label: "Work", href: "/work" },
    { label: "Lab", href: "/lab" },
    { label: "Info", href: "/info" },
  ],
};
