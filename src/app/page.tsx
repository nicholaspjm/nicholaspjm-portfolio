import { site } from "@/content/site";
import {
  getListedProjects,
  getProjectBySlug,
  imageSizeClass,
} from "@/lib/projects";
import { selectedWorks } from "@/content/selected";
import { performances, awards, press, education } from "@/content/cv";
import { tools } from "@/content/tools";
import type { Project } from "@/types/content";
import { NavButton } from "@/components/ui/nav-button";
import { NoiseRule } from "@/components/ui/noise";
import { InfoSheet } from "@/components/ui/info-sheet";
import { ImageRow, type RowImage } from "@/components/ui/image-row";
import { Editable } from "@/components/ui/editable";
import { ProjectEntry } from "@/components/ui/project-entry";
import { ToolEntry } from "@/components/ui/tool-entry";

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

/** A project entry — the whole block is a link to the project. */
function ProjectBlock({
  p,
  num,
  total,
  feature = false,
  showImages = true,
}: {
  p: Project;
  num: number;
  total: number;
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
        role={p.role}
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
          resizeId={p.slug}
          rowSlug={p.slug}
          rowPrev={prev(p)}
        />
      )}
    </>
  );
}

/** One representative image (or video embed) per work in a category, each
 *  linking to its work. */
function categoryImages(projects: Project[]): RowImage[] {
  return projects
    .filter((p) => p.images && p.images.length > 0)
    .map((p) => {
      const first = p.images![0];
      return {
        src: first.src,
        youtube: first.youtube,
        video: first.video,
        start: first.start,
        slug: p.slug,
        prev: prev(p),
        alt: p.title,
      };
    });
}

export default function Home() {
  const all = getListedProjects();
  const commissioned = all.filter(
    (p) => (p.section ?? "commissioned") === "commissioned",
  );
  const installations = all.filter((p) => p.section === "installation");

  // Curated highlight reel, hand-ordered in src/content/selected.ts.
  const selected = selectedWorks
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is Project => Boolean(p));

  const rich = (
    <div className="leftcol">
      {/* PROMINENT VIEWS: above the nav (the spot you liked) ------------- */}
      <p style={{ margin: "0.4em 0 1em 0" }}>
        <NavButton href="/work">list view</NavButton>
        <NavButton href="/visual">view all my visual work</NavButton>
      </p>

      {/* TOP NAV --------------------------------------------------------- */}
      <div style={{ margin: "0 0 1.4em 0" }}>
        <NavButton href="/cv">CV</NavButton>
        <NavButton href="#tools">tools</NavButton>{" "}
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
      {selected.map((p, i) => (
        <ProjectBlock
          key={`sel-${p.slug}`}
          p={p}
          num={i + 1}
          total={selected.length}
        />
      ))}

      <NoiseRule />

      {/* COMMISSIONED ---------------------------------------------------- */}
      <p style={{ marginTop: "1.4em" }}>
        <Editable id="label.commissions" as="span" className="extra">
          commissions
        </Editable>{" "}
        <span className="pathnote">~/practice/commissions</span>
      </p>
      {commissioned.map((p, i) => (
        <ProjectBlock
          key={p.slug}
          p={p}
          num={i + 1}
          total={commissioned.length}
          showImages={false}
        />
      ))}
      <ImageRow
        images={categoryImages(commissioned)}
        sizeClass=""
        title="commissions"
      />

      <NoiseRule />

      {/* INSTALLATION & PERFORMANCE -------------------------------------- */}
      <p>
        <Editable id="label.installation" as="span" className="extra">
          installation &amp; performance
        </Editable>{" "}
        <span className="pathnote">~/practice/rooms</span>
      </p>
      {installations.map((p, i) => (
        <ProjectBlock
          key={p.slug}
          p={p}
          num={i + 1}
          total={installations.length}
          showImages={false}
        />
      ))}
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
            {p.year && <em>{p.year}. </em>}
            <i>
              <Editable id={`perf.${i}.title`} as="span">
                {p.title}
              </Editable>
            </i>
            {p.detail && (
              <>
                {", "}
                <Editable id={`perf.${i}.detail`} as="span">
                  {p.detail}
                </Editable>
              </>
            )}
          </li>
        ))}
      </ul>
      <ImageRow
        images={categoryImages(installations)}
        sizeClass=""
        title="installation and performance"
      />

      <NoiseRule char="/" />

      {/* SKETCHES --------------------------------------------------------- */}
      <p>
        <Editable id="label.sketches" as="span" className="static-label">
          sketches
        </Editable>{" "}
        <span className="pathnote">~/practice/fun</span>
      </p>

      <NoiseRule />

      {/* TOOLS: each row clickable to its repo --------------------------- */}
      <p id="tools">
        <Editable id="label.tools" as="span" className="extra">
          tools
        </Editable>{" "}
        <span className="pathnote">~/practice/released</span>
      </p>
      <ul>
        {tools.map((t, i) => (
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
          </li>
        ))}
      </ul>

      <NoiseRule char="/" />

      {/* TEACHING ---------------------------------------------------------- */}
      <p>
        <Editable id="label.teaching" as="span" className="static-label">
          teaching
        </Editable>{" "}
        <span className="pathnote">~/practice/teaching</span>
        <NavButton href="https://youtube.com/@nicholaspjm" external>
          youtube
        </NavButton>
      </p>
      <ul>
        <li>
          <Editable id="teaching.b1" as="span">
            Co-founded Touch Collective, running TouchDesigner workshops, artist
            talks, and live visual events in Naarm / Melbourne.
          </Editable>
        </li>
        <li>
          <Editable id="teaching.b2" as="span">
            Technical tutorials published on YouTube.
          </Editable>
        </li>
        <li>
          <Editable id="teaching.b3" as="span">
            Recent speaking includes Creative Technology Melbourne.
          </Editable>
        </li>
        <li>
          <Editable id="teaching.b4" as="span">
            I try to keep this not-for-profit, and would love to speak and teach
            more.
          </Editable>
        </li>
        <li>
          <Editable id="teaching.b5" as="span">
            Private tutoring and consultation also available.
          </Editable>
        </li>
        <li>
          <Editable id="teaching.b6" as="span">
            Available for workshops and talks,
          </Editable>{" "}
          <a href={`mailto:${site.email}`}>get in touch</a>.
        </li>
      </ul>

      <NoiseRule />

      {/* AWARDS ------------------------------------------------------------ */}
      <p>
        <Editable id="label.awards" as="span" className="static-label">
          awards
        </Editable>
      </p>
      <ul>
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
      </ul>

      <p>
        <br />
      </p>

      {/* PRESS -------------------------------------------------------------- */}
      <p>
        <Editable id="label.press" as="span" className="static-label">
          selected press
        </Editable>
      </p>
      <ul>
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

      <p>
        <br />
      </p>

      {/* EDUCATION ----------------------------------------------------------- */}
      <p>
        <Editable id="label.education" as="span" className="static-label">
          education
        </Editable>
      </p>
      <ul>
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
