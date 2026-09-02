import type { Metadata } from "next";
import Link from "next/link";
import { interleave } from "@/lib/interleave";
import { getListedProjects } from "@/lib/projects";
import { asset } from "@/lib/asset";
import { pageMeta } from "@/lib/seo";
import { performances } from "@/content/cv";
import { tools } from "@/content/tools";
import { NoiseRule } from "@/components/ui/noise";
import { WorkIndex, type WorkItem } from "./work-index";

export const metadata: Metadata = pageMeta({
  title: "Work in TouchDesigner, projection & live visuals",
  description:
    "Selected TouchDesigner and real-time projects from Naarm / Melbourne: projection design, audio-reactive visuals, interactive installation and live visuals for festivals, artists and brands.",
  path: "/work/",
});

/** Small thumbnails for the strip at the bottom (same tier the rows use). */
const thumbOf = (src: string) =>
  src.startsWith("/images/projects/")
    ? src.replace("/images/projects/", "/images/thumbs/")
    : src;

/** CV performances that a project page already covers, so the index does not
 *  list the same show twice. Kept explicit rather than fuzzy-matched on title:
 *  a near-miss here silently drops a real entry, which is the bug this whole
 *  addition exists to fix. */
const COVERED_PERFORMANCES = new Set([
  "Pitch Music & Arts: Far from God, Close to Heaven", // pitch-far-from-god
  "A3 Festival, Main Stage", // a3-festival
  "Platform Presents", // hybrid-1-0 was the work shown there
]);

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function WorkPage() {
  const all = getListedProjects();
  const projects: WorkItem[] = all.map((p) => ({
    slug: p.slug,
    title: p.title,
    year: p.year,
    summary: p.summary,
    categories: p.categories,
  }));

  // Everything else that belongs in the index but never got a page of its own:
  // performances from the CV and the public tools. Listed, not linked.
  const extraPerformances: WorkItem[] = performances
    .filter((e) => e.year && !COVERED_PERFORMANCES.has(e.title))
    .map((e) => ({
      slug: `perf-${slugify(e.title)}`,
      title: e.title,
      year: e.year,
      summary: e.detail ?? "",
      categories: ["Performance", "Live Visuals"],
      unlinked: true,
    }));

  const extraTools: WorkItem[] = tools
    .filter((t) => !all.some((p) => p.title.toLowerCase() === t.name.toLowerCase()))
    .map((t) => ({
      slug: `tool-${slugify(t.name)}`,
      title: t.name,
      year: "", // tools are ongoing; no single year to show
      summary: t.summary,
      categories: ["Tool", "Personal"],
      unlinked: true,
    }));

  const listed = [...projects, ...extraPerformances, ...extraTools];

  // Tiles for the mini visual strip: up to two stills per project, plenty to
  // fill the band (the CSS clips it to roughly the bottom fifth of the
  // screen, so extras simply never show).
  // Round-robined for the same reason as the visual index: taken in project
  // order the band showed three shots of one show, then three of the next.
  const strip = interleave(
    all.map((p) =>
      (p.images ?? [])
        .filter((i) => i.src)
        .slice(0, 3)
        .map((im) => ({ slug: p.slug, title: p.title, src: im.src! })),
    ),
  ).slice(0, 60);

  return (
    <>
      <WorkIndex projects={listed} />

      <NoiseRule char="/" />

      {/* MINI VISUAL: a condensed taste of the visual page ----------------- */}
      <p>
        <span className="extra">visual</span>{" "}
        <Link href="/visual">open the full visual view</Link>
      </p>
      <div className="mini-visual">
        {strip.map((x) => (
          <Link
            key={`${x.slug}-${x.src.split("/").pop()}`}
            href={`/work/${x.slug}`}
            className="mv-item"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(thumbOf(x.src))}
              alt={x.title}
              loading="lazy"
              decoding="async"
            />
          </Link>
        ))}
      </div>
      <p className="see-more">
        <Link href="/visual">see more</Link>
      </p>
    </>
  );
}
