import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProjectSlugs,
  getProjectBySlug,
  getProjectNeighbors,
  imageSizeClass,
} from "@/lib/projects";
import { Blocks } from "@/components/content/block-renderer";
import { NavButton } from "@/components/ui/nav-button";
import { ImageRow } from "@/components/ui/image-row";
import { Editable } from "@/components/ui/editable";

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const { prev, next } = getProjectNeighbors(slug);

  return (
    <div className="bluepage">
      <p>
        <NavButton href="/">← index</NavButton>
        <NavButton href="/work">all work</NavButton>
      </p>

      {/* Giant bordoclima-scale masthead */}
      <header>
        <span className="bigyear">
          {project.year} · {project.section ?? "commissioned"} ·{" "}
          {project.categories.join(" / ").toLowerCase()}
        </span>
        <Editable id={`work.${project.slug}.title`} as="h1" className="bigtitle">
          {project.title}
        </Editable>
        {(project.link || (project.links && project.links.length > 0)) && (
          <p>
            {project.link && (
              <NavButton href={project.link.href} external>
                {project.link.label}
              </NavButton>
            )}
            {project.links?.map((l) => (
              <NavButton key={l.href} href={l.href} external>
                {l.label.toLowerCase()}
              </NavButton>
            ))}
          </p>
        )}
      </header>

      <div style={{ maxWidth: "72ch" }}>
        <p>
          <Editable id={`work.${project.slug}.summary`} as="span">
            {project.summary}
          </Editable>
          {project.role && (
            <>
              {" "}
              <Editable id={`work.${project.slug}.role`} as="span">
                {project.role}
              </Editable>
              .
            </>
          )}
        </p>
        <Blocks blocks={project.blocks} />
      </div>

      {/* Photo gallery only; video embeds live in the blocks flow above. */}
      {project.images && project.images.some((im) => !im.youtube) && (
        <ImageRow
          images={project.images.filter((im) => !im.youtube)}
          sizeClass={imageSizeClass(project.imageSize)}
          title={project.title}
          resizeId={project.slug}
        />
      )}

      <p>
        <br />
      </p>

      <p>
        {prev && (
          <NavButton href={`/work/${prev.slug}`}>
            ← {prev.title.toLowerCase()}
          </NavButton>
        )}
        {next && (
          <NavButton href={`/work/${next.slug}`}>
            {next.title.toLowerCase()} →
          </NavButton>
        )}
      </p>
    </div>
  );
}
