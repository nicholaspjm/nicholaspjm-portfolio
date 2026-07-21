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

/** The 23 raw project categories condensed into four filter groups. A project
 *  matches a group when any of its categories is in the group; everything is
 *  always reachable under "all". Old links with raw categories (from detail
 *  page tags) still work via the fallback below. */
const GROUPS: { label: string; cats: string[] }[] = [
  {
    label: "live",
    cats: [
      "Live Visuals",
      "Festival",
      "Performance",
      "Live Coding",
      "Touring",
      "Club",
      "Lighting",
      "Music",
    ],
  },
  {
    label: "music video & vfx",
    cats: ["Music Video", "VFX", "Commercial"],
  },
  {
    label: "installation",
    cats: ["Installation", "Interactive", "Projection Mapping", "Exhibition"],
  },
  {
    label: "personal & tools",
    cats: ["Personal", "Tool", "Real-time", "Design"],
  },
];

const yr = (p: WorkItem) => parseInt(p.year, 10) || 0;
const applySort = (list: WorkItem[], sort: Sort) =>
  [...list].sort((a, b) => {
    if (sort === "newest") return yr(b) - yr(a);
    if (sort === "oldest") return yr(a) - yr(b);
    return a.title.localeCompare(b.title);
  });

/** The rows themselves — also used as the Suspense fallback, so the full list
 *  is present in the prerendered HTML instead of popping in after hydration. */
function Rows({ items }: { items: WorkItem[] }) {
  return (
    <ul>
      {items.map((p) => (
        <li key={p.slug}>
          <em>{p.year}.</em>{" "}
          <Link className="ptitle" href={`/work/${p.slug}`}>
            {editableText[`work.${p.slug}.title`] ?? p.title}
          </Link>
          {". "}
          {editableText[`work.${p.slug}.summary`] ?? p.summary}{" "}
          <span className="foot">({p.categories.join(" / ")})</span>
        </li>
      ))}
    </ul>
  );
}

function SortRow({
  sort,
  onChange,
}: {
  sort: Sort;
  onChange: (s: Sort) => void;
}) {
  return (
    <p className="sort-row">
      <label>
        order by{" "}
        <select value={sort} onChange={(e) => onChange(e.target.value as Sort)}>
          <option value="newest">newest first</option>
          <option value="oldest">oldest first</option>
          <option value="a-z">a to z</option>
        </select>
      </label>
    </p>
  );
}

/** Interactive body: reads ?cat= (must sit under Suspense for static export)
 *  and owns the sort state. */
function ListBody({ projects }: { projects: WorkItem[] }) {
  const search = useSearchParams();
  const filter = search.get("cat") ?? undefined;
  const [sort, setSort] = useState<Sort>("newest");

  const group = filter ? GROUPS.find((g) => g.label === filter) : undefined;
  const filtered = !filter
    ? projects
    : group
      ? projects.filter((p) => p.categories.some((c) => group.cats.includes(c)))
      : projects.filter((p) => p.categories.includes(filter));

  return (
    <>
      <SortRow sort={sort} onChange={setSort} />
      <Rows items={applySort(filtered, sort)} />
      {filtered.length === 0 && (
        <p>
          Nothing here yet under <i>{filter}</i>.
        </p>
      )}
    </>
  );
}

export function WorkIndex({ projects }: { projects: WorkItem[] }) {
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
        {GROUPS.map((g) => (
          <NavButton
            key={g.label}
            href={`/work?cat=${encodeURIComponent(g.label)}`}
          >
            {g.label}
          </NavButton>
        ))}
      </p>

      {/* Prerender ships the complete newest-first list as the fallback; the
          interactive filter + sort takes over on hydration. */}
      <Suspense fallback={<Rows items={applySort(projects, "newest")} />}>
        <ListBody projects={projects} />
      </Suspense>
    </>
  );
}
