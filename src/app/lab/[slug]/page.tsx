import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllExperimentSlugs,
  getExperimentBySlug,
} from "@/lib/experiments";
import { ExperimentMount } from "@/components/lab/registry";
import { CanvasFrame } from "@/components/lab/canvas-frame";
import { Blocks } from "@/components/content/block-renderer";
import { Tag } from "@/components/ui/tag";

export function generateStaticParams() {
  return getAllExperimentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/lab/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const e = getExperimentBySlug(slug);
  if (!e) return {};
  return { title: `Lab — ${e.title}`, description: e.summary };
}

export default async function ExperimentPage(
  props: PageProps<"/lab/[slug]">,
) {
  const { slug } = await props.params;
  const e = getExperimentBySlug(slug);
  if (!e) notFound();

  return (
    <article className="mx-auto w-full max-w-[1400px] px-6 py-12 md:px-10">
      <p className="caption">
        <Link href="/lab" className="link">
          ← Lab
        </Link>
      </p>
      <header className="mt-3 mb-6 flex flex-wrap items-baseline justify-between gap-4 border-b border-rule pb-4">
        <h1 className="font-serif text-[clamp(1.8rem,4vw,2.75rem)] leading-tight">
          {e.title}
        </h1>
        <p className="caption">
          {e.year}
          {e.tags && e.tags.length > 0 && <> · {e.tags.join(" / ")}</>}
        </p>
      </header>

      <CanvasFrame caption={`/lab/${e.slug}`}>
        <ExperimentMount component={e.component} />
      </CanvasFrame>

      <p className="mt-6 max-w-[64ch] font-serif text-lg leading-snug text-ink-soft">
        {e.summary}
      </p>

      {e.tags && (
        <div className="mt-3 flex flex-wrap gap-1">
          {e.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      )}

      {e.blocks && e.blocks.length > 0 && (
        <div className="mt-8">
          <Blocks blocks={e.blocks} />
        </div>
      )}
    </article>
  );
}
