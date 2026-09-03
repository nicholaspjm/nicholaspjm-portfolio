import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProjectSlugs,
  getProjectBySlug,
  getProjectNeighbors,
} from "@/lib/projects";
import { Blocks } from "@/components/content/block-renderer";
import { SiteHeader } from "@/components/layout/site-header";
import { NavButton } from "@/components/ui/nav-button";
import { ProjectGallery } from "@/components/ui/project-gallery";
import { Editable } from "@/components/ui/editable";
import {
  ProjectSchema,
  BreadcrumbSchema,
} from "@/components/layout/structured-data";
import { pageMeta, projectOgImage, projectStill } from "@/lib/seo";

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  // Works that lead with a YouTube embed or a clip carry no still to crop,
  // so they fall back to the site card rather than shipping a broken image.
  const still = projectStill(project);
  return pageMeta({
    title: project.title,
    description: project.summary,
    path: `/work/${slug}/`,
    image: still ? projectOgImage(slug) : undefined,
  });
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
  // luciarebolino-style order: title + date + brief description/links up top,
  // then ALL the media, then the longer text at the bottom.
  const mediaBlocks = blocks.filter((b) => b.kind !== "text");
  const textBlocks = blocks.filter((b) => b.kind === "text");

  return (
    <div className="bluepage">
      <ProjectSchema project={project} />
      <BreadcrumbSchema title={project.title} slug={project.slug} />
      <SiteHeader />

      {/* Giant bordoclima-scale masthead */}
      <header>
        <Editable id={`work.${project.slug}.title`} as="h1" className="bigtitle">
          {project.title}
        </Editable>
      </header>

      {/* Credits, traditional portfolio style: date and place, then one
          labelled line per credit, then the tools. Body type, not mono, so it
          sits with the rest of the text. Each line edits in the studio. */}
      <div className="credits">
        <Editable id={`meta.${project.slug}.date`} as="p">
          {project.date ?? project.year}
        </Editable>
        {(project.credits ?? []).map((c, i) => (
          <Editable key={i} id={`meta.${project.slug}.credit${i}`} as="p">
            {c}
          </Editable>
        ))}
        {project.tags && project.tags.length > 0 && (
          <Editable id={`meta.${project.slug}.tools`} as="p">
            {project.tags.join(", ")}
          </Editable>
        )}
      </div>

      {/* Brief description + links */}
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
      </div>

      {/* All the media: page videos/embeds, then the full gallery. */}
      <Blocks blocks={mediaBlocks} />
      {project.images && project.images.length > 0 && (
        <ProjectGallery
          slug={project.slug}
          images={project.images}
          title={project.title}
        />
      )}

      {/* The longer read lives at the bottom. */}
      {textBlocks.length > 0 && (
        <div style={{ maxWidth: "72ch", marginTop: "1.2em" }}>
          <Blocks blocks={textBlocks} />
        </div>
      )}

      <p>
        <br />
      </p>

      <p>
        {prev && (
          <NavButton href={`/work/${prev.slug}`}>
            {prev.title.toLowerCase()}
          </NavButton>
        )}
        {next && (
          <NavButton href={`/work/${next.slug}`}>
            {next.title.toLowerCase()}
          </NavButton>
        )}
      </p>
    </div>
  );
}
