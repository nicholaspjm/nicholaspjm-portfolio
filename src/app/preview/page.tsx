import type { Metadata } from "next";
import { site } from "@/content/site";
import { getListedProjects, getProjectBySlug } from "@/lib/projects";
import { selectedWorks } from "@/content/selected";
import { editableText } from "@/content/editable-text";
import type { Project } from "@/types/content";
import { NavButton } from "@/components/ui/nav-button";
import { Editable } from "@/components/ui/editable";
import { Fold } from "@/components/ui/fold";
import {
  arrange,
  ProjectBlock,
  SectionFoot,
  SeeMore,
} from "@/components/home/blocks";
import {
  PerfList,
  ToolsList,
  TeachingList,
  AwardsPressList,
  EducationList,
} from "@/components/home/lists";

// Unlisted experiment: a calmer homepage. No point cloud behind the page
// (point-cloud.tsx skips this route) and every category folded to its label
// until clicked. Linked from nowhere; noindex keeps it out of search if the
// link leaks. Kept off the sitemap by not being registered there.
export const metadata: Metadata = {
  title: "visual test",
  robots: { index: false, follow: false },
};

/** A section label as saved in the studio, falling back to the default. */
const label = (id: string, fallback: string) => editableText[id] ?? fallback;

export default function PreviewPage() {
  const all = getListedProjects();
  const commissionedBase = all.filter(
    (p) => (p.section ?? "commissioned") === "commissioned",
  );
  const installationsBase = all.filter((p) => p.section === "installation");
  const explorationsBase = all.filter((p) => p.section === "sketch");
  const selectedBase = selectedWorks
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is Project => Boolean(p));

  const commissioned = arrange(commissionedBase, "commissioned");
  const installations = arrange(installationsBase, "installation");
  const explorations = arrange(explorationsBase, "sketch");
  const selected = arrange(selectedBase, "selected");

  return (
    <div className="leftcol preview-page">
      <h1 className="sr-only">visual test</h1>

      <div className="topnav">
        <NavButton href="/">index</NavButton>
        <NavButton href="/work">list view</NavButton>
        <NavButton href="/cv">CV</NavButton>
      </div>

      {/* Same intro as home — the experiment is below it. */}
      <Editable id="intro.line1" as="p">
        I&rsquo;m a designer and technologist working across audio-reactive
        visuals, interactive installation, and real-time systems, based in Naarm
        / Melbourne.
      </Editable>

      <p style={{ marginTop: "1.2em", lineHeight: 1.7 }}>
        <a href={`mailto:${site.email}`}>{site.email}</a>
        <br />
        <a href="https://instagram.com/nicholaspjm" target="_blank" rel="noreferrer">
          instagram
        </a>
        <br />
        <a href="https://youtube.com/@nicholaspjm" target="_blank" rel="noreferrer">
          youtube
        </a>
        <br />
        <a href="https://github.com/nicholaspjm" target="_blank" rel="noreferrer">
          github
        </a>
      </p>

      <div className="fold-stack">
        <Fold label={label("label.selected", "selected works")} defaultOpen>
          {selected.map((p) => (
            <ProjectBlock key={`sel-${p.slug}`} context="selected" p={p} />
          ))}
          <SeeMore />
        </Fold>

        <Fold label={label("label.commissions", "visual")}>
          {commissioned.map((p) => (
            <ProjectBlock key={p.slug} context="section" p={p} />
          ))}
          <SectionFoot id="foot.visual">
            Further commissions and collaborations include work with MTLA
            Studio, 1080p Studios, Phase 3 Concepts, and Lyrical Lemonade.
          </SectionFoot>
          <SeeMore />
        </Fold>

        <Fold
          label={label("label.installation", "installation & performance")}
        >
          {installations.map((p) => (
            <ProjectBlock key={p.slug} context="section" p={p} />
          ))}
          <PerfList />
          <SectionFoot id="foot.installation">
            Work has also been presented at Concordia, Pythia, Atmos, Thread,
            Step Count, Mach1, 1800Play, TOPIA, Ode, and Order Up.
          </SectionFoot>
          <SeeMore />
        </Fold>

        <Fold label={label("label.sketches", "personal explorations")}>
          {explorations.map((p) => (
            <ProjectBlock key={p.slug} context="section" p={p} />
          ))}
          <SeeMore />
        </Fold>

        <Fold label={label("label.tools", "public tools")}>
          <ToolsList />
        </Fold>

        <Fold label={label("label.teaching", "teaching and talks")}>
          <TeachingList />
          <SeeMore href="/cv" />
        </Fold>

        <Fold label={label("label.awards", "awards & press")}>
          <AwardsPressList />
        </Fold>

        <Fold label={label("label.education", "education")}>
          <EducationList />
        </Fold>
      </div>

      <p className="foot" style={{ marginTop: "2.4em" }}>
        Last updated{" "}
        {new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        . For commissions, collaborations, and press, contact{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. &copy;{" "}
        {new Date().getFullYear()} Nicholas Marriott, Naarm / Melbourne.
      </p>
    </div>
  );
}
