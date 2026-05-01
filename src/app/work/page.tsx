import type { Metadata } from "next";
import Link from "next/link";
import { getListedProjects, getCategories } from "@/lib/projects";
import { Tag } from "@/components/ui/tag";

export const metadata: Metadata = { title: "Work" };

export default async function WorkPage(props: PageProps<"/work">) {
  const search = await props.searchParams;
  const filter = typeof search.cat === "string" ? search.cat : undefined;
  const all = getListedProjects();
  const projects = filter
    ? all.filter((p) => p.categories.includes(filter))
    : all;
  const cats = getCategories();
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-16 md:px-10">
      <header className="mb-10 border-b border-rule pb-6">
        <p className="caption">Index</p>
        <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-tight">
          Work, {new Date().getFullYear() - 6}–
          <span className="text-link">{new Date().getFullYear()}</span>
        </h1>
        <p className="mt-3 max-w-[60ch] font-serif text-lg text-ink-soft">
          A working index. Click a category to filter, click a row to read.
        </p>
        <nav className="mt-6 flex flex-wrap gap-2">
          <Tag label="All" href="/work" active={!filter} />
          {cats.map((c) => (
            <Tag
              key={c}
              label={c}
              href={`/work?cat=${encodeURIComponent(c)}`}
              active={filter === c}
            />
          ))}
        </nav>
      </header>

      <ul className="divide-y divide-rule border-t border-rule">
        <li className="caption grid grid-cols-12 gap-3 py-2 text-ink-soft">
          <span className="col-span-2 md:col-span-1">Yr</span>
          <span className="col-span-7 md:col-span-6">Title</span>
          <span className="col-span-3 hidden md:col-span-3 md:block">Summary</span>
          <span className="col-span-3 text-right md:col-span-2">Tags</span>
        </li>
        {projects.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/work/${p.slug}`}
              className="grid grid-cols-12 items-baseline gap-3 py-4 transition-colors hover:bg-paper-soft"
            >
              <span className="caption col-span-2 md:col-span-1">{p.year}</span>
              <span className="col-span-7 font-serif text-xl leading-snug md:col-span-6">
                {p.title}
                {p.role && (
                  <span className="caption ml-2 text-ink-soft">— {p.role}</span>
                )}
              </span>
              <span className="caption col-span-3 hidden text-ink-soft md:col-span-3 md:block">
                {p.summary}
              </span>
              <span className="caption col-span-3 text-right text-ink-soft md:col-span-2">
                {p.categories.join(" / ")}
              </span>
            </Link>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="py-12 text-center font-serif text-ink-soft">
            Nothing here yet under <em>{filter}</em>.
          </li>
        )}
      </ul>
    </div>
  );
}
