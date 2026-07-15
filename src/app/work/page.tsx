import type { Metadata } from "next";
import { getListedProjects, getCategories } from "@/lib/projects";
import { performances } from "@/content/cv";
import { NoiseRule } from "@/components/ui/noise";
import { Editable } from "@/components/ui/editable";
import { editableText } from "@/content/editable-text";
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
        <Editable id="label.perfExhibitions" as="span" className="extra">
          performances &amp; exhibitions
        </Editable>{" "}
        <span className="pathnote">~/practice/live</span>
      </p>
      <ul className="perf-list">
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
            <i>{editableText[`perf.${i}.title`] ?? p.title}</i>
            <br />
            {p.year && <em>{p.year}. </em>}
            {p.detail && (editableText[`perf.${i}.detail`] ?? p.detail)}
          </li>
        ))}
      </ul>

    </>
  );
}
