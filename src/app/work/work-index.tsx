"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { NavButton } from "@/components/ui/nav-button";
import { Editable } from "@/components/ui/editable";
import { editableText } from "@/content/editable-text";

export interface WorkItem {
  slug: string;
  title: string;
  year: string;
  summary: string;
  categories: string[];
}

type Sort = "newest" | "oldest" | "a-z";
const SORTS: Sort[] = ["newest", "oldest", "a-z"];

function List({ projects, cats }: { projects: WorkItem[]; cats: string[] }) {
  const search = useSearchParams();
  const filter = search.get("cat") ?? undefined;
  const [sort, setSort] = useState<Sort>("newest");

  const filtered = filter
    ? projects.filter((p) => p.categories.includes(filter))
    : projects;
  const yr = (p: WorkItem) => parseInt(p.year, 10) || 0;
  const shown = [...filtered].sort((a, b) => {
    if (sort === "newest") return yr(b) - yr(a);
    if (sort === "oldest") return yr(a) - yr(b);
    return a.title.localeCompare(b.title);
  });

  return (
    <>
      <p>
        <NavButton href="/">← index</NavButton>
        <NavButton href="/info">info</NavButton>
      </p>

      <p>
        <Editable id="label.indexOfWork" as="span" className="extra">
          index of work
        </Editable>
      </p>

      <p>
        <NavButton href="/work">all</NavButton>
        {cats.map((c) => (
          <NavButton key={c} href={`/work?cat=${encodeURIComponent(c)}`}>
            {c.toLowerCase()}
          </NavButton>
        ))}{" "}
        <button
          onClick={() =>
            setSort(SORTS[(SORTS.indexOf(sort) + 1) % SORTS.length])
          }
          title="Change sort order"
        >
          sort: {sort}
        </button>
      </p>

      <ul>
        {shown.map((p) => (
          <li key={p.slug}>
            <em>{p.year}.</em>{" "}
            <Link className="ptitle" href={`/work/${p.slug}`}>
              {editableText[`work.${p.slug}.title`] ?? p.title}
            </Link>{". "}
            {editableText[`work.${p.slug}.summary`] ?? p.summary}{" "}
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
