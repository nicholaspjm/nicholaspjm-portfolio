import type { Metadata } from "next";
import { getListedProjects, getCategories } from "@/lib/projects";
import { performances, events } from "@/content/cv";
import { NoiseRule } from "@/components/ui/noise";
import { WorkIndex, type WorkItem } from "./work-index";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  const projects: WorkItem[] = getListedProjects().map((p) => ({
    slug: p.slug,
    title: p.title,
    year: p.year,
    summary: p.summary,
    categories: p.categories,
  }));
  return (
    <>
      <WorkIndex projects={projects} cats={getCategories()} />

      <NoiseRule char="/" />

      {/* PERFORMANCES & EXHIBITIONS ---------------------------------------- */}
      <p>
        <span className="extra">performances &amp; exhibitions</span>{" "}
        <span className="pathnote">
          ~/practice/live · {performances.length} items
        </span>
        <br />
        <i>Live sets, festival stages, and exhibited work.</i>
      </p>
      <ul>
        {performances.map((p, i) => (
          <li
            key={`perf-${i}`}
            data-prev={JSON.stringify({
              t: p.title,
              y: p.year,
              k: "performance",
              s: p.detail,
            })}
          >
            {p.year !== "—" && <em>{p.year}. </em>}
            <i>{p.title}</i>
            {p.detail && <> &mdash; {p.detail}</>}
          </li>
        ))}
      </ul>

      {/* PARTIES & EVENTS ---------------------------------------------------- */}
      <p style={{ marginTop: "1em" }}>
        <span className="extra">parties &amp; events</span>{" "}
        <span className="pathnote">
          ~/practice/dancefloors · {events.length}+
        </span>
        <br />
        <i>
          Visual work contributed across Naarm&rsquo;s dancefloors and
          festivals:
        </i>
        <br />
        {events.join(" · ")} &hellip;
      </p>
    </>
  );
}
