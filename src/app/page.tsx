import Link from "next/link";
import { site } from "@/content/site";
import {
  getListedProjects,
  getProjectBySlug,
  imageSizeClass,
} from "@/lib/projects";
import { selectedWorks } from "@/content/selected";
import { performances, events, awards, press, education } from "@/content/cv";
import { tools } from "@/content/tools";
import type { Project } from "@/types/content";
import { NavButton } from "@/components/ui/nav-button";
import { NoiseRule } from "@/components/ui/noise";
import { InfoSheet } from "@/components/ui/info-sheet";
import { ImageRow, type RowImage } from "@/components/ui/image-row";
import { Editable } from "@/components/ui/editable";

/** JSON payload for the right-hand preview zone. */
function prev(p: Project) {
  return JSON.stringify({
    t: p.title,
    y: p.year,
    k: p.section ?? "commissioned",
    s: p.summary,
    img: p.images?.[0]?.src,
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
      <Link
        href={`/work/${p.slug}`}
        className={feature ? "entry feature" : "entry"}
        data-prev={prev(p)}
      >
        <span className="entry-num">
          {String(num).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <span className="ptitle">{p.title}</span>
        <br />
        <em>{p.year}.</em> {p.summary}
        {p.role && <> &mdash; {p.role}.</>}
      </Link>
      {showImages && p.images && p.images.length > 0 && (
        <ImageRow
          images={p.images}
          sizeClass={imageSizeClass(p.imageSize)}
          title={p.title}
          oneOnMobile
        />
      )}
    </>
  );
}

/** One representative image per work in a category, each linking to its work. */
function categoryImages(projects: Project[]): RowImage[] {
  return projects
    .filter((p) => p.images && p.images.length > 0)
    .map((p) => ({ src: p.images![0].src, slug: p.slug, alt: p.title }));
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
      {/* INDEX OF WORK — prominent, above the nav (the spot you liked) --- */}
      <p style={{ margin: "0.4em 0 1em 0" }}>
        <NavButton href="/work">index of work ↓</NavButton>
      </p>

      {/* TOP NAV --------------------------------------------------------- */}
      <div style={{ margin: "0 0 1.4em 0" }}>
        <NavButton href="/cv">CV</NavButton>
        <NavButton href="/visual">visual</NavButton>
        <NavButton href="#tools">tools</NavButton>{" "}
        <InfoSheet>
          <p>
            <span className="extra">about</span>
          </p>
          <p>
            I&rsquo;m a designer and technologist based in Naarm / Melbourne,
            b. 1999 in Aotearoa New Zealand. I hold a Bachelor of Arts in
            Computer Science from the University of Auckland, and worked as a
            software developer before moving into visual design.
          </p>
          <p style={{ marginTop: "0.6em" }}>
            My practice centres on real-time systems — audio-reactive visuals,
            interactive installation, and motion — for artists, brands, and
            cultural institutions. I work primarily in TouchDesigner, GLSL,
            Python, and depth-sensing hardware.
          </p>
          <p style={{ marginTop: "0.6em" }}>
            I&rsquo;m available for commissions, art direction, teaching, and
            speaking.
          </p>
          <p className="foot" style={{ marginTop: "0.6em" }}>
            Extended biography at <Link href="/info">/info</Link>. The
            background is a point-cloud scan; the rail at right maps the
            structure of the page.
          </p>
        </InfoSheet>
      </div>

      {/* INTRO — first person -------------------------------------------- */}
      <Editable id="intro.line1" as="p" />

      <Editable id="intro.line2" as="p" style={{ marginTop: "0.8em" }} />

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
      />

      <p className="callout" style={{ marginTop: "1.2em" }}>
        <Editable id="availability" as="span" /> Enquiries:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <p style={{ marginTop: "1.6em" }}>&hellip;</p>

      {/* SELECTED WORKS — curated, hand-ordered highlights --------------- */}
      <p style={{ marginTop: "1.4em" }}>
        <span className="extra">selected works</span>{" "}
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
        <span className="extra">commissions</span>{" "}
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
        <span className="extra">installation &amp; performance</span>{" "}
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
            {p.year !== "—" && <em>{p.year}. </em>}
            <i>{p.title}</i>
            {p.detail && <> &mdash; {p.detail}</>}
          </li>
        ))}
      </ul>
      <ImageRow
        images={categoryImages(installations)}
        sizeClass=""
        title="installation and performance"
      />

      {/* PARTIES & EVENTS ------------------------------------------------- */}
      <p style={{ marginTop: "1em" }}>
        <span className="extra">parties &amp; events</span>{" "}
        <span className="pathnote">~/practice/dancefloors</span>
        <br />
        {events.join(" · ")} &hellip;
      </p>

      <NoiseRule char="/" />

      {/* SKETCHES --------------------------------------------------------- */}
      <p>
        <span className="extra">sketches</span>{" "}
        <span className="pathnote">~/practice/fun</span>
      </p>

      <NoiseRule />

      {/* TOOLS — each row clickable to its repo -------------------------- */}
      <p id="tools">
        <span className="extra">tools</span>{" "}
        <span className="pathnote">~/practice/released</span>
      </p>
      <ul>
        {tools.map((t, i) => (
          <li key={t.name}>
            <a
              className="entry"
              href={t.links[0]?.href ?? "#"}
              target="_blank"
              rel="noreferrer"
              data-prev={JSON.stringify({
                t: t.name,
                k: "tool",
                s: `${t.summary} (${t.stack})`,
              })}
            >
              <span className="entry-num">
                {String(i + 1).padStart(2, "0")}/
                {String(tools.length).padStart(2, "0")}
              </span>
              <span className="data" style={{ fontSize: 14 }}>
                {t.name}
              </span>{" "}
              &mdash; {t.summary} <span className="foot">({t.stack}) ↗</span>
            </a>
          </li>
        ))}
      </ul>

      <NoiseRule char="/" />

      {/* TEACHING ---------------------------------------------------------- */}
      <p>
        <span className="extra">teaching</span>{" "}
        <span className="pathnote">~/practice/teaching</span>
        <NavButton href="https://youtube.com/@nicholaspjm" external>
          youtube
        </NavButton>
        <br />
        I co-founded <i>Touch Collective</i>, running TouchDesigner workshops,
        artist talks, and live visual events in Naarm / Melbourne, with
        technical tutorials published on YouTube. Recent speaking includes{" "}
        <i>Creative Technology Melbourne</i>. I&rsquo;m available for workshops
        and talks &mdash; <a href={`mailto:${site.email}`}>get in touch</a>.
      </p>

      <NoiseRule />

      {/* AWARDS ------------------------------------------------------------ */}
      <p>
        <span className="extra">awards</span>
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
            <em>{a.year}.</em> <span className="highlight">{a.title}</span>
            {a.detail && <> &mdash; {a.detail}</>}
          </li>
        ))}
      </ul>

      <p>
        <br />
      </p>

      {/* PRESS -------------------------------------------------------------- */}
      <p>
        <span className="extra">selected press</span>
      </p>
      <ul>
        {press.map((p, i) => (
          <li key={`press-${i}`}>
            {p.year !== "—" && <em>{p.year}. </em>}
            {p.title}
            {p.detail && (
              <>
                {" "}
                &mdash; <i>{p.detail}</i>
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
        <span className="extra">education</span>
      </p>
      <ul>
        {education.map((e, i) => (
          <li key={`edu-${i}`}>
            <em>{e.year}.</em> {e.title}
            {e.detail && <> &mdash; {e.detail}</>}
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
