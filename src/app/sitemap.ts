import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getListedProjects } from "@/lib/projects";
import { BUILD_DATE } from "@/content/build-info";

// Every entry points at the canonical domain, never at the GitHub Pages
// mirror. The two hosts serve identical HTML, so naming nicholaspjm.com here
// (and in each page's canonical tag) is what tells Google which copy is real.
//
// next.config.ts sets `trailingSlash: true`, so paths below end in "/" to
// match the URLs actually served — a sitemap that disagrees with the live URL
// costs a redirect hop on every crawl.
const loc = (path: string) => new URL(path, site.url).href;

// `output: "export"` builds these as files, and Next requires route handlers
// to say so explicitly rather than inferring it.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = BUILD_DATE;

  const pages: MetadataRoute.Sitemap = [
    { url: loc("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    { url: loc("/work/"), lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: loc("/visual/"), lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: loc("/cv/"), lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: loc("/info/"), lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: loc("/sketches/"), lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Listed works only. An `unlisted` project still resolves at its URL — that
  // is the point of unlisted — but it stays out of the sitemap so it is not
  // actively pushed into the index.
  const projects: MetadataRoute.Sitemap = getListedProjects().map((p) => ({
    url: loc(`/work/${p.slug}/`),
    lastModified,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  return [...pages, ...projects];
}
