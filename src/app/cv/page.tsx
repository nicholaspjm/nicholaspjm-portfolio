import type { Metadata } from "next";
import { site } from "@/content/site";
import { getListedProjects } from "@/lib/projects";
import {
  performances,
  awards,
  press,
  teaching,
  education,
} from "@/content/cv";
import { NavButton } from "@/components/ui/nav-button";
import { CVSheet, type CVRow } from "@/components/ui/cv-sheet";
import { Editable } from "@/components/ui/editable";

export const metadata: Metadata = { title: "CV" };

export default function CVPage() {
  const projects = getListedProjects();

  const rows: CVRow[] = [
    ...projects.map((p) => ({
      year: p.year,
      type:
        p.section === "installation"
          ? "Installation"
          : p.section === "sketch"
            ? "Sketch"
            : "Project",
      title: p.title,
      detail: [p.summary, p.role].filter(Boolean).join(" "),
    })),
    ...performances.map((p) => ({
      year: p.year,
      type: "Performance",
      title: p.title,
      detail: p.detail ?? "",
    })),
    ...awards.map((a) => ({
      year: a.year,
      type: "Award",
      title: a.title,
      detail: a.detail ?? "",
    })),
    ...press.map((p) => ({
      year: p.year,
      type: "Press",
      title: p.title,
      detail: p.detail ?? "",
    })),
    ...teaching.map((t) => ({
      year: t.year,
      type: "Teaching",
      title: t.title,
      detail: t.detail ?? "",
    })),
    ...education.map((e) => ({
      year: e.year,
      type: "Education",
      title: e.title,
      detail: e.detail ?? "",
    })),
  ].sort((a, b) => {
    const ay = parseInt(a.year, 10) || 0;
    const by = parseInt(b.year, 10) || 0;
    return by - ay;
  });

  return (
    <>
      <p>
        <NavButton href="/">← index</NavButton>
        <NavButton href="/work">visual work</NavButton>
        <NavButton href={`mailto:${site.email}`}>{site.email}</NavButton>
      </p>

      <p>
        <Editable id="label.cv" as="span" className="extra">
          Nicholas Marriott CV
        </Editable>
      </p>

      {/* The CV sheet is held back from the live site for now; localhost
          still shows it so it can keep being worked on. */}
      {process.env.NODE_ENV === "development" ? (
        <>
          <p className="foot" style={{ color: "#c00" }}>
            [localhost only: the live site shows "coming soon" here]
          </p>
          <CVSheet rows={rows} />
        </>
      ) : (
        <p style={{ marginTop: "1.2em" }}>
          <Editable id="cv.comingSoon" as="span">
            Coming soon.
          </Editable>
        </p>
      )}

      <p className="foot">
        b. 1999, Aotearoa New Zealand · Naarm / Melbourne, Australia ·{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> · +61 480 748 953 ·
        nicholaspjm.com · @nicholaspjm
      </p>
    </>
  );
}
