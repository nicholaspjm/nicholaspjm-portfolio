import type { Metadata } from "next";
import { getListedProjects } from "@/lib/projects";
import { NavButton } from "@/components/ui/nav-button";
import { VisualField, type VisualItem } from "@/components/ui/visual-field";
import { Editable } from "@/components/ui/editable";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Visual index: every image",
  description:
    "Every image from every project in one scattered field: projection, installation and live-visual work by Nicholas Marriott. Click through to the work.",
  path: "/visual/",
});

export default function VisualPage() {
  // Everything a work carries: photos, gifs, local clips, YouTube embeds.
  const items: VisualItem[] = getListedProjects().flatMap((p) =>
    (p.images ?? [])
      .filter((img) => img.src || img.video || img.youtube)
      .map((img) => ({
        src: img.src,
        video: img.video,
        youtube: img.youtube,
        start: img.start,
        slug: p.slug,
        title: p.title,
        year: p.year,
      })),
  );

  return (
    <div style={{ padding: "0.4em 12px 0" }}>
      <p style={{ margin: "0 0 0.6em 0" }}>
        <NavButton href="/">index</NavButton>
        <NavButton href="/work">index of work</NavButton>
      </p>
      <h1 className="labelrow tight">
        <Editable id="label.visual" as="span" className="extra">
          visual
        </Editable>{" "}
        <span className="pathnote">~/practice/visuals</span>
      </h1>
      <p style={{ margin: "0 0 0.2em 0" }}>
        <Editable id="visual.intro" as="span">
          Every image, scattered. Click any to open its work.
        </Editable>
      </p>
      <VisualField items={items} />
    </div>
  );
}
