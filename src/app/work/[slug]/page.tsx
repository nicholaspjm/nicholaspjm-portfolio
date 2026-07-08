import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProjectSlugs,
  getProjectBySlug,
  getProjectNeighbors,
} from "@/lib/projects";
import { Blocks } from "@/components/content/block-renderer";
import { NavButton } from "@/components/ui/nav-button";
import { ProjectGallery } from "@/components/ui/project-gallery";
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

  // YouTube videos render inside the gallery (resizable, reorderable, like any
  // image), so drop embed blocks that would show the same video twice.
  const galleryYt = (project.images ?? [])
    .map((im) => im.youtube)
    .filter((id): id is string => Boolean(id));
  const blocks = project.blocks.filter(
    (b) => !(b.kind === "embed" && galleryYt.some((id) => b.url.includes(id))),
  );

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
      </div>

      <Blocks blocks={blocks} />

      {/* Photos, clips, and YouTube embeds, all resizable in the editor. */}
      {project.images && project.images.length > 0 && (
        <ProjectGallery
          slug={project.slug}
          images={project.images}
          title={project.title}
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
