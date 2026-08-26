import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Project } from "@/types/content";

/** Absolute URL on the canonical domain, whichever host is serving. */
export const abs = (path: string) => new URL(path, site.url).href;

/** Share card used by any page without an image of its own. Committed, not
 *  generated, so CI never has to render text with fonts it may not have. */
export const DEFAULT_OG_IMAGE = "/og-default.png";

/** Where scripts/make-og-images.mjs writes a project's 1200x630 crop. */
export const projectOgImage = (slug: string) => `/og/${slug}.jpg`;

/** True when this build is the GitHub Pages mirror rather than the domain. */
export const isMirror = Boolean(process.env.NEXT_PUBLIC_BASE_PATH);

/** First still a project carries. Projects that lead with a YouTube embed or
 *  a clip have no still, and fall back to the default card. */
export function projectStill(project: Project): string | undefined {
  return project.images?.find((im) => im.src)?.src;
}

type PageMetaInput = {
  /** Page title without the site name — the layout template appends it. */
  title?: string;
  description: string;
  /** Path as actually served, trailing slash included (`trailingSlash: true`). */
  path: string;
  /** Share image path; defaults to the site card. */
  image?: string;
};

/**
 * Metadata for one page, carrying the three things Next does not add on its
 * own and that this site specifically needs:
 *
 * 1. a **canonical URL** — the same HTML is published to both Cloudflare and
 *    the GitHub Pages mirror, and the canonical is what stops the two copies
 *    competing with each other in search results;
 * 2. a **share image**, so links posted to Instagram, Bluesky or Discord
 *    preview as artwork rather than a blank rectangle;
 * 3. `summary_large_image`, which is what makes that preview full-bleed
 *    instead of a thumbnail beside the text.
 */
export function pageMeta({
  title,
  description,
  path,
  image,
}: PageMetaInput): Metadata {
  const url = abs(path);
  const img = abs(image ?? DEFAULT_OG_IMAGE);
  const ogTitle = title ? `${title} · ${site.name}` : site.name;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_AU",
      images: [{ url: img, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [img],
    },
  };
}
