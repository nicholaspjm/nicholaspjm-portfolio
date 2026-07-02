"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { NavButton } from "@/components/ui/nav-button";

export interface WorkItem {
  slug: string;
  title: string;
  year: string;
  summary: string;
  categories: string[];
}

function List({ projects, cats }: { projects: WorkItem[]; cats: string[] }) {
  const search = useSearchParams();
  const filter = search.get("cat") ?? undefined;
  const shown = filter
    ? projects.filter((p) => p.categories.includes(filter))
    : projects;

  return (
    <>
      <p>
        <NavButton href="/">← index</NavButton>
        <NavButton href="/info">info</NavButton>
      </p>

      <p>
        <span className="extra">index of work</span>
        <br />A comprehensive list of selected projects. Filter by category
        below, or read each entry in context on the{" "}
        <Link href="/">index</Link>.
      </p>

      <p>
        <NavButton href="/work">all</NavButton>
        {cats.map((c) => (
          <NavButton key={c} href={`/work?cat=${encodeURIComponent(c)}`}>
            {c.toLowerCase()}
          </NavButton>
        ))}
      </p>

      <ul>
        {shown.map((p) => (
          <li key={p.slug}>
            <em>{p.year}.</em>{" "}
            <Link className="extra" href={`/work/${p.slug}`}>
              {p.title}
            </Link>{" "}
            &mdash; {p.summary}{" "}
            <span className="foot">({p.categories.join(" / ")})</span>
          </li>
        ))}
      </ul>

      {shown.length === 0 && (
        <p>
          Nothing here yet under <i>{filter}</i>.
        </p>
      )}
    </>
  );
}

export function WorkIndex(props: { projects: WorkItem[]; cats: string[] }) {
  // useSearchParams must sit under Suspense for static export.
  return (
    <Suspense fallback={null}>
      <List {...props} />
    </Suspense>
  );
}
