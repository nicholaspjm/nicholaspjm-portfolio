import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllProjectSlugs,
  getProjectBySlug,
  getProjectNeighbors,
} from "@/lib/projects";
import { Blocks } from "@/components/content/block-renderer";
import { Tag } from "@/components/ui/tag";
import { Hyperlink } from "@/components/ui/hyperlink";

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
    <article>
      <header className="mx-auto w-full max-w-[1400px] px-6 pb-8 pt-16 md:px-10">
        <p className="caption">
          <Link href="/work" className="link">
            ← Index
          </Link>
        </p>
        <h1 className="mt-4 font-serif text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] tracking-tight">
          {project.title}
        </h1>
        <p className="mt-4 max-w-[64ch] font-serif text-xl leading-snug text-ink-soft">
          {project.summary}
        </p>

        <dl className="mono mt-8 grid grid-cols-2 gap-y-2 border-y border-rule py-4 text-sm md:grid-cols-4">
          <div>
            <dt className="caption">Year</dt>
            <dd>{project.year}</dd>
          </div>
          {project.role && (
            <div>
              <dt className="caption">Role</dt>
              <dd>{project.role}</dd>
            </div>
          )}
          <div>
            <dt className="caption">Categories</dt>
            <dd>{project.categories.join(", ")}</dd>
          </div>
          {project.link && (
            <div>
              <dt className="caption">Link</dt>
              <dd>
                <Hyperlink href={project.link.href}>
                  {project.link.label}
                </Hyperlink>
              </dd>
            </div>
          )}
        </dl>

        {project.tags && project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {project.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        )}
      </header>

      <Blocks blocks={project.blocks} />

      {/* Prev / Next */}
      <nav className="mx-auto mt-16 flex w-full max-w-[1400px] items-stretch justify-between gap-3 border-t border-rule px-6 py-6 md:px-10">
        {prev ? (
          <Link href={`/work/${prev.slug}`} className="block flex-1">
            <p className="caption">← Previous</p>
            <p className="font-serif text-lg leading-snug hover:text-link">
              {prev.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/work/${next.slug}`} className="block flex-1 text-right">
            <p className="caption">Next →</p>
            <p className="font-serif text-lg leading-snug hover:text-link">
              {next.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
