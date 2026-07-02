import type { Metadata } from "next";
import Link from "next/link";
import { getListedProjects } from "@/lib/projects";
import { NavButton } from "@/components/ui/nav-button";

export const metadata: Metadata = {
  title: "Sketches",
  description: "Work made just for fun.",
};

export default function SketchesPage() {
  const sketches = getListedProjects().filter((p) => p.section === "sketch");
  return (
    <>
      <p>
        <NavButton href="/">← index</NavButton>
        <NavButton href="/work">work</NavButton>
        <NavButton href="/cv">CV</NavButton>
      </p>

      <p>
        <span className="extra">sketches</span>
        <br />
        <i>
          Work made just for fun — instruments, ports, and studies that
          escaped the client folder. No brief, no deadline, all appetite.
        </i>
      </p>

      <ul>
        {sketches.map((p, i) => (
          <li
            key={p.slug}
            data-prev={JSON.stringify({
              t: p.title,
              y: p.year,
              k: "sketch",
              s: p.summary,
              href: `/work/${p.slug}`,
            })}
          >
            <span className="entry-num">
              {String(i + 1).padStart(2, "0")}/
              {String(sketches.length).padStart(2, "0")}
            </span>
            <em>{p.year}.</em>{" "}
            <Link className="extra" href={`/work/${p.slug}`}>
              {p.title}
            </Link>{" "}
            &mdash; {p.summary}{" "}
            <span className="foot">({p.categories.join(" / ")})</span>
          </li>
        ))}
      </ul>
    </>
  );
}
