import type { Metadata } from "next";
import { interleave } from "@/lib/interleave";
import { getListedProjects } from "@/lib/projects";
import { SiteHeader } from "@/components/layout/site-header";
import { VisualField, type VisualItem } from "@/components/ui/visual-field";
import { Editable } from "@/components/ui/editable";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Visual index of every image",
  description:
    "Every image from every project in one scattered field: projection, installation and live-visual work by Nicholas Marriott. Click through to the work.",
  path: "/visual/",
});

export default function VisualPage() {
  // Everything a work carries: photos, gifs, local clips, YouTube embeds.
  // One list per work, then round-robined, so a project's images are spread
  // through the field instead of sitting together in a block.
  const items: VisualItem[] = interleave(
    getListedProjects().map((p) =>
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
    ),
  );

  return (
    <div style={{ padding: "0.4em 12px 0" }}>
      <SiteHeader />
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
