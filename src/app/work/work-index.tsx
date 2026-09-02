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
  /** No dedicated page: the row is listed but not a link. Performances and
   *  tools that never got written up still belong in the index. */
  unlinked?: boolean;
}

type Sort = "newest" | "oldest" | "a-z";

/** Sort options as buttons, matching every other control on the site. */
const SORTS: { id: Sort; label: string }[] = [
  { id: "newest", label: "newest first" },
  { id: "oldest", label: "oldest first" },
  { id: "a-z", label: "a to z" },
];

/** The 23 raw project categories condensed into four filter groups. A project
 *  matches a group when any of its categories is in the group; everything is
 *  always reachable under "all". Old links with raw categories (from detail
 *  page tags) still work via the fallback below. */
const GROUPS: { id: string; label: string; cats: string[] }[] = [
  {
    id: "live",
    label: "visual / live performance",
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
    id: "mv",
    label: "music video & vfx",
    cats: ["Music Video", "VFX", "Commercial"],
  },
  {
    id: "installation",
    label: "installation",
    cats: ["Installation", "Interactive", "Projection Mapping", "Exhibition"],
  },
  {
    id: "personal",
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
          {p.year && <em>{p.year}. </em>}
          {p.unlinked ? (
            <span className="ptitle unlinked">
              {editableText[`work.${p.slug}.title`] ?? p.title}
            </span>
          ) : (
            <Link className="ptitle" href={`/work/${p.slug}`}>
              {editableText[`work.${p.slug}.title`] ?? p.title}
            </Link>
          )}
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
      <span className="sort-label">order by</span>{" "}
      {SORTS.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          aria-pressed={sort === s.id}
          className={sort === s.id ? "on" : undefined}
        >
          {s.label}
        </button>
      ))}
    </p>
  );
}

/** Interactive body: reads ?cat= (must sit under Suspense for static export)
 *  and owns the sort state. */
function ListBody({ projects }: { projects: WorkItem[] }) {
  const search = useSearchParams();
  const filter = search.get("cat") ?? undefined;
  const [sort, setSort] = useState<Sort>("newest");

  const group = filter
    ? GROUPS.find((g) => g.id === filter || g.label === filter)
    : undefined;
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
        <NavButton href="/">index</NavButton>
        <NavButton href="/info">info</NavButton>
      </p>

      <h1 className="labelrow">
        <Editable id="label.indexOfWork" as="span" className="extra">
          index of work
        </Editable>
      </h1>

      <p>
        <NavButton href="/work">all</NavButton>
        {GROUPS.map((g) => (
          <NavButton
            key={g.label}
            href={`/work?cat=${encodeURIComponent(g.id)}`}
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
