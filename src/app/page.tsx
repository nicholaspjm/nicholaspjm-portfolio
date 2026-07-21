import Link from "next/link";
import { site } from "@/content/site";
import {
  getListedProjects,
  getProjectBySlug,
  imageSizeClass,
} from "@/lib/projects";
import { selectedWorks } from "@/content/selected";
import { performances, awards, press, teaching, education } from "@/content/cv";
import { tools } from "@/content/tools";
import { editableText } from "@/content/editable-text";
import * as media from "@/content/project-images";

// Tolerant read: project-images.ts is generated, and during a git pull with
// the dev server running it can momentarily be an older version without this
// export. Degrade to "no tool photos" instead of crashing the page.
const toolImages: Record<string, string[]> =
  (media as { toolImages?: Record<string, string[]> }).toolImages ?? {};
import type { Project } from "@/types/content";
import { NavButton } from "@/components/ui/nav-button";
import { NoiseRule } from "@/components/ui/noise";
import { InfoSheet } from "@/components/ui/info-sheet";
import { ImageRow } from "@/components/ui/image-row";
import { Editable } from "@/components/ui/editable";
import { ProjectEntry } from "@/components/ui/project-entry";
import { SectionArrange } from "@/components/ui/section-arrange";
import { ToolEntry } from "@/components/ui/tool-entry";

/** Apply the saved arrangement for a homepage section: saved order first
 *  (unknown slugs keep their base order after it), then drop hidden ones.
 *  Saved by the edit-mode SectionArrange panel as secorder.* / sechide.*. */
function arrange(list: Project[], key: string): Project[] {
  const ord = (editableText[`secorder.${key}`] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const hid = new Set(
    (editableText[`sechide.${key}`] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const idx = new Map(ord.map((s, i) => [s, i]));
  const saved = list
    .filter((p) => idx.has(p.slug))
    .sort((a, b) => idx.get(a.slug)! - idx.get(b.slug)!);
  const rest = list.filter((p) => !idx.has(p.slug));
  return [...saved, ...rest].filter((p) => !hid.has(p.slug));
}

/** JSON payload for the right-hand preview zone. */
function prev(p: Project) {
  return JSON.stringify({
    t: p.title,
    y: p.year,
    k: p.section ?? "commissioned",
    s: p.summary,
    img: p.images?.find((im) => im.src)?.src,
    href: `/work/${p.slug}`,
  });
}

/** Quiet closing line under a section: an editable credit sentence (edit the
 *  names in the studio) followed by a pointer to the full CV. */
function SectionFoot({ id, children }: { id: string; children: string }) {
  return (
    <p className="section-foot">
      <Editable id={id} as="span">
        {children}
      </Editable>{" "}
      The complete list is available in the <Link href="/cv">CV</Link>.
    </p>
  );
}

/** "see more" pointer at the end of a section, to the full list view. */
function SeeMore({ href = "/work" }: { href?: string }) {
  return (
    <p className="see-more">
      <Link href={href}>see more →</Link>
    </p>
  );
}

/** A project entry — the whole block is a link to the project.
 *  `context` scopes the row's saved size/hide/order, so the same work can be
 *  large under selected works and small (or fully hidden) under its section;
 *  older un-contexted saves still apply as the shared base. */
function ProjectBlock({
  p,
  num,
  total,
  context,
  feature = false,
  showImages = true,
}: {
  p: Project;
  num: number;
  total: number;
  context: "selected" | "section";
  feature?: boolean;
  showImages?: boolean;
}) {
  return (
    <>
      <ProjectEntry
        slug={p.slug}
        title={p.title}
        year={p.year}
        summary={p.summary}
        num={num}
        total={total}
        feature={feature}
        prev={prev(p)}
      />
      {showImages && p.images && p.images.length > 0 && (
        <ImageRow
          images={p.images}
          sizeClass={imageSizeClass(p.imageSize)}
          title={p.title}
          oneOnMobile
          resizeId={`${context}.${p.slug}`}
          fallbackResizeId={p.slug}
          rowSlug={p.slug}
          rowPrev={prev(p)}
        />
      )}
    </>
  );
}

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
        <br />↪
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

      <p style={{ marginTop: "1.6em" }}>&hellip;</p>

      {/* SELECTED WORKS: curated, hand-ordered highlights ---------------- */}
      <p style={{ marginTop: "1.4em" }}>
        <Editable id="label.selected" as="span" className="extra">
          selected works
        </Editable>{" "}
        <span className="pathnote">~/practice/selected</span>
      </p>
      <SectionArrange sectionKey="selected" items={arrItems(selectedBase)} />
      {selected.map((p, i) => (
        <ProjectBlock
          key={`sel-${p.slug}`}
          context="selected"
          p={p}
          num={i + 1}
          total={selected.length}
        />
      ))}
      <SeeMore />

      <NoiseRule />

      {/* VISUAL (commissioned work) --------------------------------------- */}
      <p style={{ marginTop: "1.4em" }}>
        <Editable id="label.commissions" as="span" className="extra">
          visual
        </Editable>{" "}
        <span className="pathnote">~/practice/visual</span>
      </p>
      <SectionArrange
        sectionKey="commissioned"
        items={arrItems(commissionedBase)}
      />
      {commissioned.map((p, i) => (
        <ProjectBlock
          key={p.slug}
          context="section"
          p={p}
          num={i + 1}
          total={commissioned.length}
        />
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
        </Editable>{" "}
        <span className="pathnote">~/practice/rooms</span>
      </p>
      <SectionArrange
        sectionKey="installation"
        items={arrItems(installationsBase)}
      />
      {installations.map((p, i) => (
        <ProjectBlock
          key={p.slug}
          context="section"
          p={p}
          num={i + 1}
          total={installations.length}
        />
      ))}
      {/* Formatted like the project entries: title line, then year + detail. */}
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
            <i>
              <Editable id={`perf.${i}.title`} as="span">
                {p.title}
              </Editable>
            </i>
            <br />
            {p.year && <em>{p.year}. </em>}
            {p.detail && (
              <Editable id={`perf.${i}.detail`} as="span">
                {p.detail}
              </Editable>
            )}
          </li>
        ))}
      </ul>
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
        </Editable>{" "}
        <span className="pathnote">~/practice/fun</span>
      </p>
      <SectionArrange sectionKey="sketch" items={arrItems(explorationsBase)} />
      {explorations.map((p, i) => (
        <ProjectBlock
          key={p.slug}
          context="section"
          p={p}
          num={i + 1}
          total={explorations.length}
        />
      ))}
      <SeeMore />

      <NoiseRule />

      {/* TOOLS: each row clickable to its repo --------------------------- */}
      <p id="tools">
        <Editable id="label.tools" as="span" className="extra">
          public tools
        </Editable>{" "}
        <span className="pathnote">~/practice/released</span>
      </p>
      <ul className="tool-list">
        {tools.map((t, i) => {
          // Photos dropped into content/tools/<slug>/ show under the entry.
          const tSlug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const photos = toolImages[tSlug] ?? [];
          return (
            <li key={t.name}>
              <ToolEntry
                href={t.links[0]?.href ?? "#"}
                prev={JSON.stringify({
                  t: t.name,
                  k: "tool",
                  s: `${t.summary} (${t.stack})`,
                })}
                num={i + 1}
                total={tools.length}
                name={t.name}
                summary={t.summary}
                stack={t.stack}
                idx={i}
              />
              {photos.length > 0 && (
                <ImageRow
                  images={photos.map((src) => ({ src }))}
                  sizeClass=""
                  title={t.name}
                  oneOnMobile
                  resizeId={`tool-${tSlug}`}
                />
              )}
            </li>
          );
        })}
      </ul>

      {/* TEACHING (no dividers from here down; bold headings separate) ---- */}
      <p style={{ marginTop: "2.2em" }}>
        <Editable id="label.teaching" as="span" className="static-label">
          teaching and talks
        </Editable>{" "}
        <span className="pathnote">~/practice/teaching</span>
      </p>
      <p style={{ marginTop: "0.4em", maxWidth: "56ch" }}>
        <Editable id="teaching.intro" as="span">
          Sharing real-time techniques openly is part of the practice: I try to
          keep teaching accessible and not-for-profit, and I am always keen to
          speak and teach more.
        </Editable>{" "}
        <a href={`mailto:${site.email}`}>Get in touch</a>.
      </p>
      {/* Rows come from content/cv.csv (teaching section), shaped like the
          other listings: bold title line, then year + detail. */}
      <ul className="perf-list">
        {teaching.map((p, i) => (
          <li
            key={`teach-${i}`}
            data-prev={JSON.stringify({
              t: p.title,
              y: p.year,
              k: "teaching",
              s: p.detail,
            })}
          >
            <i>
              <Editable id={`teach.${i}.title`} as="span">
                {p.title}
              </Editable>
            </i>
            <br />
            {p.year && <em>{p.year}. </em>}
            {p.detail && (
              <Editable id={`teach.${i}.detail`} as="span">
                {p.detail}
              </Editable>
            )}
            {p.link && (
              <>
                {" "}
                <a href={p.link.href} target="_blank" rel="noreferrer">
                  {p.link.label} ↗
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
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
      <ul className="info-list">
        {awards.map((a, i) => (
          <li
            key={`award-${i}`}
            data-prev={JSON.stringify({
              t: a.title,
              y: a.year,
              k: "award",
              s: a.detail,
            })}
          >
            <em>{a.year}.</em>{" "}
            <span className="highlight">
              <Editable id={`award.${i}.title`} as="span">
                {a.title}
              </Editable>
            </span>
            {a.detail && (
              <>
                {", "}
                <Editable id={`award.${i}.detail`} as="span">
                  {a.detail}
                </Editable>
              </>
            )}
          </li>
        ))}
        {press.map((p, i) => (
          <li key={`press-${i}`}>
            {p.year && <em>{p.year}. </em>}
            <Editable id={`press.${i}.title`} as="span">
              {p.title}
            </Editable>
            {p.detail && (
              <>
                {", "}
                <i>
                  <Editable id={`press.${i}.detail`} as="span">
                    {p.detail}
                  </Editable>
                </i>
              </>
            )}
          </li>
        ))}
      </ul>
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
      <ul className="info-list">
        {education.map((e, i) => (
          <li key={`edu-${i}`}>
            <em>{e.year}.</em>{" "}
            <Editable id={`edu.${i}.title`} as="span">
              {e.title}
            </Editable>
            {e.detail && (
              <>
                {", "}
                <Editable id={`edu.${i}.detail`} as="span">
                  {e.detail}
                </Editable>
              </>
            )}
          </li>
        ))}
      </ul>

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
