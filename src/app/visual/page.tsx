import type { Metadata } from "next";
import { getListedProjects } from "@/lib/projects";
import { NavButton } from "@/components/ui/nav-button";
import { VisualField, type VisualItem } from "@/components/ui/visual-field";
import { Editable } from "@/components/ui/editable";

export const metadata: Metadata = {
  title: "Visual",
  description: "Every image, scattered. Click through to the work.",
};

export default function VisualPage() {
  const items: VisualItem[] = getListedProjects().flatMap((p) =>
    (p.images ?? [])
      .filter((img) => img.src) // skip video-embed items with no still to scatter
      .map((img) => ({
        src: img.src!,
        slug: p.slug,
        title: p.title,
        year: p.year,
      })),
  );

  return (
    <div style={{ padding: "0.4em 12px 0" }}>
      <p style={{ margin: "0 0 0.6em 0" }}>
        <NavButton href="/">← index</NavButton>
        <NavButton href="/work">index of work</NavButton>
      </p>
      <p style={{ margin: "0 0 0.2em 0" }}>
        <Editable id="label.visual" as="span" className="extra">
          visual
        </Editable>{" "}
        <span className="pathnote">~/practice/visuals</span>
        <br />
        <Editable id="visual.intro" as="span">
          Every image, scattered. Click any to open its work.
        </Editable>
      </p>
      <VisualField items={items} />
    </div>
  );
}
