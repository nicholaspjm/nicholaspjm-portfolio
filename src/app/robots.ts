import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// `output: "export"` builds these as files, and Next requires route handlers
// to say so explicitly rather than inferring it.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", site.url).href,
  };
}
