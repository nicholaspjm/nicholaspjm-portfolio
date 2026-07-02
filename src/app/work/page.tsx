import type { Metadata } from "next";
import Link from "next/link";
import { getListedProjects, getCategories } from "@/lib/projects";
import { NavButton } from "@/components/ui/nav-button";

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
        {projects.map((p) => (
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

      {projects.length === 0 && (
        <p>
          Nothing here yet under <i>{filter}</i>.
        </p>
      )}
    </>
  );
}
