import Link from "next/link";
import { site } from "@/content/site";
import { getListedProjects } from "@/lib/projects";
import { performances, events, awards, press, education } from "@/content/cv";
import { tools } from "@/content/tools";
import type { Project } from "@/types/content";
import { NavButton } from "@/components/ui/nav-button";
import { NoiseRule } from "@/components/ui/noise";
import { InfoSheet } from "@/components/ui/info-sheet";
// Blob scatter field parked for now — re-enable by restoring this import
// and the <ScatterField items={scatter} /> mount below.
// import { ScatterField, type ScatterItem } from "@/components/ui/scatter-field";
import { asset } from "@/lib/asset";

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

function ProjectBlock({
  p,
  num,
  total,
}: {
  p: Project;
  num: number;
  total: number;
}) {
  return (
    <>
      <p data-prev={prev(p)}>
        <span className="entry-num">
          {String(num).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <Link className="extra" href={`/work/${p.slug}`}>
          {p.title}
        </Link>
        {p.links?.map((l) => (
          <NavButton key={l.href} href={l.href} external>
            {l.label.toLowerCase()}
          </NavButton>
        ))}
        <br />
        <em>{p.year}.</em> {p.summary}
        {p.role && <> &mdash; {p.role}.</>}
      </p>
      {p.images && p.images.length > 0 && (
        <div className="image-row">
          {p.images.map((img) => (
            <figure key={img.src} className="image-module">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(img.src)} alt={img.alt ?? img.caption ?? p.title} />
              <figcaption>{img.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}

export default function Home() {
  const all = getListedProjects();
  const commissioned = all.filter(
    (p) => (p.section ?? "commissioned") === "commissioned",
  );
  const installations = all.filter((p) => p.section === "installation");

  return (
    <>
      <div className="leftcol">
        {/* TOP NAV ---------------------------------------------------------- */}
        <div style={{ margin: "0.6em 0 1.4em 0" }}>
          <NavButton href="/cv">CV</NavButton>
          <NavButton href="/work">visual work</NavButton>
          <NavButton href="#tools">tools</NavButton>{" "}
          <InfoSheet>
            <p>
              <span className="extra">about</span>
            </p>
            <p>
              Nicholas Marriott (b. 1999, Aotearoa New Zealand) is a designer
              and technologist based in Naarm / Melbourne. He holds a Bachelor
              of Computer Science and a Bachelor of Arts from the University of
              Auckland, and worked as a software developer before moving into
              visual design.
            </p>
            <p style={{ marginTop: "0.6em" }}>
              His practice centres on real-time systems — audio-reactive
              visuals, interactive installation, and motion — for artists,
              brands, and cultural institutions. He is a co-founder of{" "}
              <em>Touch Collective</em>, a creative-technology studio and
              workshop series in Naarm / Melbourne. Working tools include
              TouchDesigner, GLSL, Python, and depth-sensing hardware.
            </p>
            <p style={{ marginTop: "0.6em" }}>
              Available for commissions, art direction, teaching, and speaking.
            </p>
            <p className="foot" style={{ marginTop: "0.6em" }}>
              Extended biography at <Link href="/info">/info</Link>. The
              background is a point-cloud scan; the rail at right maps the
              structure of the page.
            </p>
          </InfoSheet>
        </div>

        {/* INTRO ------------------------------------------------------------ */}
        <p>
          Nicholas Marriott is a designer and technologist working across
          audio-reactive visuals, interactive installation, and real-time
          systems. He is a co-founder of Touch Collective, a
          creative-technology studio and workshop series based in Naarm /
          Melbourne.
        </p>

        <p style={{ marginTop: "0.8em" }}>
          His practice sits between software engineering and live performance,
          building responsive systems for touring artists, brands, and
          cultural institutions. Recent work spans stage and festival visual
          design, music-video VFX, and interactive installation.
        </p>

        <p style={{ marginTop: "1.2em" }}>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <br />
          IG{" "}
          <a
            href="https://instagram.com/nicholaspjm"
            target="_blank"
            rel="noreferrer"
          >
            @nicholaspjm
          </a>
          <br />
          YT{" "}
          <a
            href="https://youtube.com/@nicholaspjm"
            target="_blank"
            rel="noreferrer"
          >
            @nicholaspjm
          </a>
          <br />
          GH{" "}
          <a
            href="https://github.com/nicholaspjm"
            target="_blank"
            rel="noreferrer"
          >
            nicholaspjm
          </a>
        </p>

        <div className="spacer-v" aria-hidden />

        {/* NOW — current status ------------------------------------------- */}
        <p className="atm-mark">
          now
          <br />↪
        </p>
        <p style={{ maxWidth: "58ch" }}>
          Current and upcoming work for the 2026 season includes visual design
          for The xx&rsquo;s festival tour (including Coachella main stage),
          Its Murph&rsquo;s Weightless Tour across North America, VFX for
          Nike&rsquo;s Air Liquid Max, and a festival installation at Mach1,
          alongside ongoing TouchDesigner workshops with Touch Collective.
        </p>

        <p className="callout" style={{ marginTop: "1.2em" }}>
          Available for commissions, collaborations, teaching, and speaking.
          Enquiries:{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>

        <p style={{ marginTop: "1.6em" }}>&hellip;</p>

        {/* COMMISSIONED ---------------------------------------------------- */}
        <p style={{ marginTop: "1.4em" }}>
          <span className="extra">commissioned</span>{" "}
          <span className="pathnote">
            ~/practice/commissioned · {commissioned.length} items
          </span>
          <br />
          <i>
            Tour visuals, stage design, and music-video VFX for artists and
            brands.
          </i>
        </p>
        {commissioned.map((p, i) => (
          <ProjectBlock
            key={p.slug}
            p={p}
            num={i + 1}
            total={commissioned.length}
          />
        ))}

        <NoiseRule />

        {/* INSTALLATION & PERFORMANCE -------------------------------------- */}
        <p>
          <span className="extra">installation &amp; performance</span>{" "}
          <span className="pathnote">
            ~/practice/rooms · {installations.length + performances.length}{" "}
            items
          </span>
          <br />
          <i>Interactive installations and live audiovisual performance.</i>
        </p>
        {installations.map((p, i) => (
          <ProjectBlock
            key={p.slug}
            p={p}
            num={i + 1}
            total={installations.length}
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

        {/* PARTIES & EVENTS ------------------------------------------------- */}
        <p style={{ marginTop: "1em" }}>
          <span className="extra">parties &amp; events</span>{" "}
          <span className="pathnote">
            ~/practice/dancefloors · {events.length}+
          </span>
          <br />
          <i>
            Visual work contributed across Naarm&rsquo;s club nights and
            festivals:
          </i>
          <br />
          {events.join(" · ")} &hellip;
        </p>

        <NoiseRule char="/" />

        {/* SKETCHES --------------------------------------------------------- */}
        <p>
          <span className="extra">sketches</span>{" "}
          <span className="pathnote">~/practice/fun</span>
          <br />
          <i>
            Self-directed experiments and studies in real-time graphics.
            Currently being catalogued.
          </i>
        </p>

        <NoiseRule />

        {/* TOOLS -------------------------------------------------------------- */}
        <p id="tools">
          <span className="extra">tools</span>{" "}
          <span className="pathnote">
            ~/practice/released · {tools.length} items
          </span>
          <br />
          <i>
            Open-source software and components for the TouchDesigner
            ecosystem — trackers, bridges, and utilities.
          </i>
        </p>
        <ul>
          {tools.map((t, i) => (
            <li
              key={t.name}
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
              &mdash; {t.summary} <span className="foot">({t.stack})</span>{" "}
              {t.links.map((l) => (
                <NavButton key={l.href} href={l.href} external>
                  {l.label}
                </NavButton>
              ))}
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
          Co-founder of <i>Touch Collective</i>, running TouchDesigner
          workshops, artist talks, and live visual events in Naarm /
          Melbourne, with technical tutorials published on YouTube. Recent
          speaking includes <i>Creative Technology Melbourne</i>. Available
          for workshops and talks &mdash;{" "}
          <a href={`mailto:${site.email}`}>get in touch</a>.
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
          <br />
          <i>
            Full press list in the <Link href="/cv">CV spreadsheet</Link>.
          </i>
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
    </>
  );
}
