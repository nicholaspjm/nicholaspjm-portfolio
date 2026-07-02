import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProjectSlugs,
  getProjectBySlug,
  getProjectNeighbors,
} from "@/lib/projects";
import { Blocks } from "@/components/content/block-renderer";
import { NavButton } from "@/components/ui/nav-button";

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
        <h1 className="bigtitle">{project.title}</h1>
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
          {project.summary}
          {project.role && <> &mdash; {project.role}.</>}
        </p>
        <Blocks blocks={project.blocks} />
      </div>

      {project.images && project.images.length > 0 && (
        <div className="image-row">
          {project.images.map((img) => (
            <figure key={img.src} className="image-module">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt ?? img.caption ?? project.title} />
              <figcaption>{img.caption}</figcaption>
            </figure>
          ))}
        </div>
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
