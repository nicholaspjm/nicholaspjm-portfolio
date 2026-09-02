import type { Metadata } from "next";
import { site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import { getListedProjects, getProjectBySlug } from "@/lib/projects";
import { selectedWorks } from "@/content/selected";
import { editableText } from "@/content/editable-text";
import type { Project } from "@/types/content";
import { NavButton } from "@/components/ui/nav-button";
import { NoiseRule } from "@/components/ui/noise";
import { InfoSheet } from "@/components/ui/info-sheet";
import { Editable } from "@/components/ui/editable";
import { SectionArrange } from "@/components/ui/section-arrange";
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

export const metadata: Metadata = {
  ...pageMeta({ description: site.tagline, path: "/" }),
  title: {
    // "creative technologist" is what the practice is called; "TouchDesigner"
    // is what people type. 23 of 25 works here are TouchDesigner pieces, so
    // leading with it is the honest description as well as the findable one.
    absolute: "Nicholas Marriott — TouchDesigner & new media artist, Melbourne",
  },
};

export default function Home() {
  const all = getListedProjects();
  // Base lists keep every project (the arrange panel needs hidden ones too);
  // the rendered lists apply the saved order and drop the hidden.
  const commissionedBase = all.filter(
    (p) => (p.section ?? "commissioned") === "commissioned",
  );
  const installationsBase = all.filter((p) => p.section === "installation");
  const explorationsBase = all.filter((p) => p.section === "sketch");
  // Curated highlight reel, hand-ordered in src/content/selected.ts.
  const selectedBase = selectedWorks
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is Project => Boolean(p));

  const commissioned = arrange(commissionedBase, "commissioned");
  const installations = arrange(installationsBase, "installation");
  const explorations = arrange(explorationsBase, "sketch");
  const selected = arrange(selectedBase, "selected");

  const arrItems = (l: Project[]) =>
    l.map((p) => ({
      slug: p.slug,
      title: editableText[`work.${p.slug}.title`] ?? p.title,
    }));

  const rich = (
    <div className="leftcol">
      {/* The index has no visible title — the work is the title. Search
          engines still need one, so it is here for them and for screen
          readers, carrying the terms the practice should be found by. */}
      <h1 className="sr-only">
        Nicholas Marriott (nicholaspjm) — TouchDesigner, projection and new
        media artist in Naarm / Melbourne
      </h1>
      {/* TOP NAV: evenly spread row of plain buttons --------------------- */}
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

      {/* INTRO: first person --------------------------------------------- */}
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

      {/* NOW ------------------------------------------------------------- */}
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

      {/* SELECTED WORKS: curated, hand-ordered highlights ---------------- */}
      <p style={{ marginTop: "1.4em" }}>
        <Editable id="label.selected" as="span" className="extra">
          selected works
        </Editable>
      </p>
      <SectionArrange sectionKey="selected" items={arrItems(selectedBase)} />
      {selected.map((p, i) => (
        <ProjectBlock
          key={`sel-${p.slug}`}
          context="selected"
          p={p}
          eager={i === 0}
        />
      ))}
      <SeeMore />

      <NoiseRule />

      {/* VISUAL (commissioned work) --------------------------------------- */}
      <p style={{ marginTop: "1.4em" }}>
        <Editable id="label.commissions" as="span" className="extra">
          visual
        </Editable>
      </p>
      <SectionArrange
        sectionKey="commissioned"
        items={arrItems(commissionedBase)}
      />
      {commissioned.map((p) => (
        <ProjectBlock key={p.slug} context="section" p={p} />
      ))}
      <SectionFoot id="foot.visual">
        Further commissions and collaborations include work with MTLA Studio,
        1080p Studios, Phase 3 Concepts, and Lyrical Lemonade.
      </SectionFoot>
      <SeeMore />

      <NoiseRule />

      {/* INSTALLATION & PERFORMANCE -------------------------------------- */}
      <p>
        <Editable id="label.installation" as="span" className="extra">
          installation &amp; performance
        </Editable>
      </p>
      <SectionArrange
        sectionKey="installation"
        items={arrItems(installationsBase)}
      />
      {installations.map((p) => (
        <ProjectBlock key={p.slug} context="section" p={p} />
      ))}
      <PerfList />
      <SectionFoot id="foot.installation">
        Work has also been presented at Concordia, Pythia, Atmos, Thread, Step
        Count, Mach1, 1800Play, TOPIA, Ode, and Order Up.
      </SectionFoot>
      <SeeMore />

      <NoiseRule char="/" />

      {/* PERSONAL EXPLORATIONS -------------------------------------------- */}
      <p>
        <Editable id="label.sketches" as="span" className="extra">
          personal explorations
        </Editable>
      </p>
      <SectionArrange sectionKey="sketch" items={arrItems(explorationsBase)} />
      {explorations.map((p) => (
        <ProjectBlock key={p.slug} context="section" p={p} />
      ))}
      <SeeMore />

      <NoiseRule />

      {/* TOOLS: each row clickable to its repo --------------------------- */}
      <p id="tools">
        <Editable id="label.tools" as="span" className="extra">
          public tools
        </Editable>
      </p>
      <ToolsList />

      {/* TEACHING (no dividers from here down; bold headings separate) ---- */}
      <p style={{ marginTop: "2.2em" }}>
        <Editable id="label.teaching" as="span" className="static-label">
          teaching and talks
        </Editable>
      </p>
      <TeachingList />
      <SeeMore href="/cv" />
      <p style={{ marginTop: "0.5em" }}>
        <NavButton href="https://youtube.com/@nicholaspjm" external>
          youtube
        </NavButton>
      </p>

      {/* AWARDS & PRESS ---------------------------------------------------- */}
      <p style={{ marginTop: "2.2em" }}>
        <Editable id="label.awards" as="span" className="static-label">
          awards &amp; press
        </Editable>
      </p>
      <AwardsPressList />
      <SectionFoot id="foot.awards">
        Selected recognition and coverage shown here; further features and
        interviews are catalogued alongside the practice history.
      </SectionFoot>

      <p>
        <br />
      </p>

      {/* EDUCATION ----------------------------------------------------------- */}
      <p>
        <Editable id="label.education" as="span" className="static-label">
          education
        </Editable>
      </p>
      <EducationList />

      <p>
        <br />
      </p>

      {/* FOOTER ---------------------------------------------------------------- */}
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

  return rich;
}
