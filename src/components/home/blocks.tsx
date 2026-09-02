import Link from "next/link";
import { editableText } from "@/content/editable-text";
import { imageSizeClass } from "@/lib/projects";
import type { Project } from "@/types/content";
import { Editable } from "@/components/ui/editable";
import { ImageRow } from "@/components/ui/image-row";
import { ProjectEntry } from "@/components/ui/project-entry";

/** Apply the saved arrangement for a homepage section: saved order first
 *  (unknown slugs keep their base order after it), then drop hidden ones.
 *  Saved by the edit-mode SectionArrange panel as secorder.* / sechide.*. */
export function arrange(list: Project[], key: string): Project[] {
  const ord = (editableText[`secorder.${key}`] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const hid = new Set(
    (editableText[`sechide.${key}`] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const idx = new Map(ord.map((s, i) => [s, i]));
  const saved = list
    .filter((p) => idx.has(p.slug))
    .sort((a, b) => idx.get(a.slug)! - idx.get(b.slug)!);
  const rest = list.filter((p) => !idx.has(p.slug));
  return [...saved, ...rest].filter((p) => !hid.has(p.slug));
}

/** JSON payload for the right-hand preview zone. */
export function prev(p: Project) {
  return JSON.stringify({
    t: p.title,
    y: p.year,
    k: p.section ?? "commissioned",
    s: p.summary,
    img: p.images?.find((im) => im.src)?.src,
    href: `/work/${p.slug}`,
  });
}

/** Quiet closing line under a section: an editable credit sentence (edit the
 *  names in the studio) followed by a pointer to the full CV. */
export function SectionFoot({
  id,
  children,
}: {
  id: string;
  children: string;
}) {
  return (
    <p className="section-foot">
      <Editable id={id} as="span">
        {children}
      </Editable>{" "}
      The complete list is available in the <Link href="/cv">CV</Link>.
    </p>
  );
}

/** "see more" pointer at the end of a section, to the full list view. */
export function SeeMore({ href = "/work" }: { href?: string }) {
  return (
    <p className="see-more">
      <Link href={href}>see more</Link>
    </p>
  );
}

/** A project entry — the whole block is a link to the project.
 *  `context` scopes the row's saved size/hide/order, so the same work can be
 *  large under selected works and small (or fully hidden) under its section;
 *  older un-contexted saves still apply as the shared base. */
export function ProjectBlock({
  p,
  context,
  feature = false,
  showImages = true,
  eager = false,
}: {
  p: Project;
  context: "selected" | "section";
  feature?: boolean;
  showImages?: boolean;
  /** First entry on the page: load its strip eagerly. */
  eager?: boolean;
}) {
  return (
    <>
      <ProjectEntry
        slug={p.slug}
        title={p.title}
        summary={p.summary}
        feature={feature}
        prev={prev(p)}
      />
      {showImages && p.images && p.images.length > 0 && (
        <ImageRow
          images={p.images}
          sizeClass={imageSizeClass(p.imageSize)}
          title={p.title}
          oneOnMobile
          resizeId={`${context}.${p.slug}`}
          fallbackResizeId={p.slug}
          rowSlug={p.slug}
          rowPrev={prev(p)}
          eager={eager}
        />
      )}
    </>
  );
}
