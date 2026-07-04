/**
 * Portfolio content schema.
 *
 * Each project / experiment is a typed TS module under src/content/. Pages
 * read from these modules at build time. The schema below is the contract.
 */

export type Tag = string;

/** Block — a single unit in a project's content flow. */
export type Block =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | GalleryBlock
  | EmbedBlock
  | QuoteBlock
  | DividerBlock;

export interface TextBlock {
  kind: "text";
  /** Paragraphs. Each string becomes a <p>. Inline html allowed sparingly. */
  paragraphs: string[];
  /** Optional eyebrow heading shown above the text. */
  heading?: string;
  /** Lead paragraph styling — bigger, looser. */
  lead?: boolean;
}

export interface ImageBlock {
  kind: "image";
  /** Path under /public, e.g. /images/projects/foo/01.jpg */
  src: string;
  alt: string;
  /** Aspect ratio as "w/h", e.g. "16/9". Used for layout reservation. */
  ratio?: string;
  caption?: string;
  /** Layout: full-bleed, centered (default), or inset. */
  layout?: "bleed" | "center" | "inset";
}

export interface VideoBlock {
  kind: "video";
  src: string;
  poster?: string;
  ratio?: string;
  caption?: string;
  /** Default true. Auto-played videos are muted + looped. */
  autoplay?: boolean;
  layout?: "bleed" | "center" | "inset";
}

export interface GalleryBlock {
  kind: "gallery";
  items: { src: string; alt: string; ratio?: string }[];
  /** Columns at desktop width. Default 2. */
  columns?: 2 | 3 | 4;
  caption?: string;
}

export interface EmbedBlock {
  kind: "embed";
  /** Full URL — Vimeo, YouTube, etc. We render in an iframe. */
  url: string;
  ratio?: string;
  caption?: string;
}

export interface QuoteBlock {
  kind: "quote";
  text: string;
  cite?: string;
}

export interface DividerBlock {
  kind: "divider";
  label?: string;
}

/** Which index group a project belongs to. */
export type ProjectSection =
  | "commissioned"
  | "installation"
  | "sketch"
  | "teaching";

/** A portfolio project. */
export interface Project {
  slug: string;
  title: string;
  /** Index group. Defaults to "commissioned" when omitted. */
  section?: ProjectSection;
  /** Year string. e.g. "2024" or "2023–24". */
  year: string;
  /** One-liner shown in the index list. */
  summary: string;
  /** Free-form role / credit. */
  role?: string;
  /** Categories used for filtering on /work. */
  categories: Tag[];
  /** Optional tools / tech tags. */
  tags?: Tag[];
  /** External link, if the project lives elsewhere (Vimeo, etc.). */
  link?: { href: string; label: string };
  /** Cluster of related external links — rendered as pill buttons on the index. */
  links?: { href: string; label: string }[];
  /** Images shown as an image-row under the project entry on the index. */
  images?: { src: string; caption?: string; alt?: string }[];
  /** Image-row thumbnail size on the index. Defaults to "S" (small). */
  imageSize?: "S" | "M" | "L";
  /** Relative scale of the work (0–1), used to weight the timeline rail.
   *  Higher = a bigger, bolder point. Defaults to a per-section value. */
  weight?: number;
  /** Hero image, used as preview thumb on the index. */
  cover?: { src: string; alt: string; ratio?: string };
  /** Ordered content blocks. */
  blocks: Block[];
  /** Hidden from the index but reachable by URL. */
  unlisted?: boolean;
}

export interface SiteInfo {
  name: string;
  shortName: string;
  tagline: string;
  url: string;
  email: string;
  social: { label: string; href: string }[];
  nav: { label: string; href: string }[];
}
