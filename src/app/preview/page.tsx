import type { Metadata } from "next";
import { site } from "@/content/site";
import { getListedProjects, getProjectBySlug } from "@/lib/projects";
import { selectedWorks } from "@/content/selected";
import { editableText } from "@/content/editable-text";
import type { Project } from "@/types/content";
import { NavButton } from "@/components/ui/nav-button";
import { NoiseRule } from "@/components/ui/noise";
import { InfoSheet } from "@/components/ui/info-sheet";
import { Editable } from "@/components/ui/editable";
import { Fold } from "@/components/ui/fold";
import { ScrollLine } from "@/components/ui/scroll-line";
import { BlurField } from "@/components/ui/blur-field";
import { GenerativeField } from "@/components/ui/generative-field";
import { SchemePicker } from "@/components/ui/scheme-picker";
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

// Unlisted experiment: the homepage, calmer. Identical skeleton and spacing
// to the live page — same intro, spacers, now block, labels, dividers — but
// with the ideas under test: folded category bodies, a plain ground, the
// point cloud bent into abstract shapes (point-cloud.tsx morphs on this
// route), the work rail traded for a plain scroll line, and a palette picker.
// Linked from nowhere; noindex keeps it out of search if the link leaks; not
// registered in the sitemap.
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
      <ScrollLine />
      <BlurField />
      <GenerativeField />

      {/* TOP NAV — as on home ------------------------------------------- */}
      <div className="topnav">
        <NavButton href="/work">list view</NavButton>
        <NavButton href="/visual">visual view</NavButton>
        <NavButton href="/cv">CV</NavButton>
        <InfoSheet>
          <p>
            <Editable id="label.about" as="span" className="extra">
              about
            </Editable>
          </p>
          <Editable id="about.p1" as="p">
            I&rsquo;m a designer and technologist based in Naarm / Melbourne, b.
            1999 in Aotearoa New Zealand. I hold a Bachelor of Arts in Computer
            Science from the University of Auckland, and worked as a software
            developer before moving into visual design.
          </Editable>
          <Editable id="about.p2" as="p" style={{ marginTop: "0.6em" }}>
            My practice centres on real-time systems, spanning audio-reactive
            visuals, interactive installation, and motion for artists, brands,
            and cultural institutions. I work primarily in TouchDesigner, GLSL,
            Python, and depth-sensing hardware.
          </Editable>
          <Editable id="about.p3" as="p" style={{ marginTop: "0.6em" }}>
            I&rsquo;m available for commissions, art direction, teaching, and
            speaking.
          </Editable>
        </InfoSheet>
      </div>

      <SchemePicker />

      {/* INTRO — as on home --------------------------------------------- */}
      <Editable id="intro.line1" as="p">
        I&rsquo;m a designer and technologist working across audio-reactive
        visuals, interactive installation, and real-time systems, based in Naarm
        / Melbourne.
      </Editable>

      <Editable id="intro.line2" as="p" style={{ marginTop: "0.8em" }}>
        My practice sits between software engineering and live performance,
        building responsive systems for touring artists, brands, and cultural
        institutions. Recent work spans stage and festival visual design,
        music-video VFX, and interactive installation.
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

      <div className="spacer-v" aria-hidden />

      {/* NOW — as on home ------------------------------------------------ */}
      <p className="atm-mark">
        now
      </p>
      <Editable
        id="now.statement"
        as="p"
        style={{ marginTop: "0.4em", maxWidth: "52ch" }}
      >
        Seeking experimentation and collaborative artistic exploration through
        the use of real-time technology.
      </Editable>

      <p className="callout" style={{ marginTop: "1.2em" }}>
        <Editable id="availability" as="span">
          Available for commissions, collaborations, teaching, and speaking.
        </Editable>{" "}
        Enquiries: <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <div className="spacer-v" aria-hidden />

      {/* SECTIONS — home's order, labels and dividers; bodies folded ----- */}
      <Fold
        label={label("label.selected", "selected works")}
        headStyle={{ marginTop: "1.4em" }}
        defaultOpen
      >
        {selected.map((p, i) => (
          <ProjectBlock
            key={`sel-${p.slug}`}
            context="selected"
            p={p}
            eager={i === 0}
          />
        ))}
        <SeeMore />
      </Fold>

      <NoiseRule />

      <Fold
        label={label("label.commissions", "visual")}
        headStyle={{ marginTop: "1.4em" }}
      >
        {commissioned.map((p) => (
          <ProjectBlock key={p.slug} context="section" p={p} />
        ))}
        <SectionFoot id="foot.visual">
          Further commissions and collaborations include work with MTLA Studio,
          1080p Studios, Phase 3 Concepts, and Lyrical Lemonade.
        </SectionFoot>
        <SeeMore />
      </Fold>

      <NoiseRule />

      <Fold label={label("label.installation", "installation & performance")}>
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

      <NoiseRule char="/" />

      <Fold label={label("label.sketches", "personal explorations")}>
        {explorations.map((p) => (
          <ProjectBlock key={p.slug} context="section" p={p} />
        ))}
        <SeeMore />
      </Fold>

      <NoiseRule />

      <Fold label={label("label.tools", "public tools")}>
        <ToolsList />
      </Fold>

      <Fold
        label={label("label.teaching", "teaching and talks")}
        variant="static"
        headStyle={{ marginTop: "2.2em" }}
      >
        <TeachingList />
        <SeeMore href="/cv" />
        <p style={{ marginTop: "0.5em" }}>
          <NavButton href="https://youtube.com/@nicholaspjm" external>
            youtube
          </NavButton>
        </p>
      </Fold>

      <Fold
        label={label("label.awards", "awards & press")}
        variant="static"
        headStyle={{ marginTop: "2.2em" }}
      >
        <AwardsPressList />
        <SectionFoot id="foot.awards">
          Selected recognition and coverage shown here; further features and
          interviews are catalogued alongside the practice history.
        </SectionFoot>
      </Fold>

      <p>
        <br />
      </p>

      <Fold label={label("label.education", "education")} variant="static">
        <EducationList />
      </Fold>

      <p>
        <br />
      </p>

      {/* FOOTER — as on home --------------------------------------------- */}
      <p className="foot">
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
