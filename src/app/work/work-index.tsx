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

function List({ projects }: { projects: WorkItem[] }) {
  const search = useSearchParams();
  const filter = search.get("cat") ?? undefined;
  const [sort, setSort] = useState<Sort>("newest");

  const group = filter
    ? GROUPS.find((g) => g.label === filter)
    : undefined;
  const filtered = !filter
    ? projects
    : group
      ? projects.filter((p) => p.categories.some((c) => group.cats.includes(c)))
      : projects.filter((p) => p.categories.includes(filter));
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
        {GROUPS.map((g) => (
          <NavButton
            key={g.label}
            href={`/work?cat=${encodeURIComponent(g.label)}`}
          >
            {g.label}
          </NavButton>
        ))}
      </p>

      <p className="sort-row">
        <label>
          order by{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="newest">newest first</option>
            <option value="oldest">oldest first</option>
            <option value="a-z">a to z</option>
          </select>
        </label>
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

export function WorkIndex(props: { projects: WorkItem[] }) {
  // useSearchParams must sit under Suspense for static export.
  return (
    <Suspense fallback={null}>
      <List {...props} />
    </Suspense>
  );
}
