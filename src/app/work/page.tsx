import type { Metadata } from "next";
import Link from "next/link";
import { getListedProjects } from "@/lib/projects";
import { asset } from "@/lib/asset";
import { NoiseRule } from "@/components/ui/noise";
import { WorkIndex, type WorkItem } from "./work-index";

export const metadata: Metadata = { title: "Work" };

/** Small thumbnails for the strip at the bottom (same tier the rows use). */
const thumbOf = (src: string) =>
  src.startsWith("/images/projects/")
    ? src.replace("/images/projects/", "/images/thumbs/")
    : src;

export default function WorkPage() {
  const all = getListedProjects();
  const projects: WorkItem[] = all.map((p) => ({
    slug: p.slug,
    title: p.title,
    year: p.year,
    summary: p.summary,
    categories: p.categories,
  }));

  // Tiles for the mini visual strip: up to two stills per project, plenty to
  // fill the band (the CSS clips it to roughly the bottom fifth of the
  // screen, so extras simply never show).
  const strip: { slug: string; title: string; src: string }[] = [];
  for (const p of all) {
    for (const im of (p.images ?? []).filter((i) => i.src).slice(0, 3)) {
      strip.push({ slug: p.slug, title: p.title, src: im.src! });
    }
  }
  strip.splice(60);

  return (
    <>
      <WorkIndex projects={projects} />

      <NoiseRule char="/" />

      {/* MINI VISUAL: a condensed taste of the visual page ----------------- */}
      <p>
        <span className="extra">visual</span>{" "}
        <Link href="/visual">open the full visual view →</Link>
      </p>
      <div className="mini-visual">
        {strip.map((x) => (
          <Link key={x.slug} href={`/work/${x.slug}`} className="mv-item">
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
        <Link href="/visual">see more →</Link>
      </p>
    </>
  );
}
