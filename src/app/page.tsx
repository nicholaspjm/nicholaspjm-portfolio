import Link from "next/link";
import { site } from "@/content/site";
import { getListedProjects } from "@/lib/projects";
import { performances, events, awards, press, education } from "@/content/cv";
import { tools } from "@/content/tools";
import type { Project } from "@/types/content";
import { NavButton } from "@/components/ui/nav-button";
import { NoiseRule, BinaryLine } from "@/components/ui/noise";
import { InfoSheet } from "@/components/ui/info-sheet";
import { ScatterField, type ScatterItem } from "@/components/ui/scatter-field";
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

  // every project image becomes a blob-tracker detection in the whitespace
  const scatter: ScatterItem[] = all.flatMap(
    (p) =>
      p.images?.map((img) => ({
        src: img.src,
        slug: p.slug,
        title: p.title,
        year: p.year,
      })) ?? [],
  );

  return (
    <>
      <ScatterField items={scatter} />
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
            <ul>
              <li>b. 1999, aotearoa new zealand. naarm/melbourne now.</li>
              <li>designer; technologist. the slash does real work.</li>
              <li>
                make: visuals that listen. rooms that watch back. type that
                moves. light that behaves like weather.
              </li>
              <li>
                trained: BCompSci + BA, university of auckland. industry
                software developer before stages — the rigour stayed.
              </li>
              <li>
                tools: touchdesigner. glsl. python. arduino. gaussian splats.
                depth cameras. whatever the room needs.
              </li>
              <li>
                co-founded <em>touch collective</em> — workshops, talks, live
                visual events.
              </li>
              <li>grammy on the shelf; still patching at 2am.</li>
            </ul>
            <p className="foot">
              full pseudoprose at <Link href="/info">/info</Link>. the
              background is a real room scan — it flinches from your cursor.
              the bars down the right edge are this page&rsquo;s structure.
            </p>
          </InfoSheet>
        </div>

        {/* INTRO — lucia format, no achievements ---------------------------- */}
        <p>
          Nicholas Marriott is a designer, technologist and computational
          artist. He is currently a live visual artist and co-founder of
          Touch Collective in Naarm / Melbourne.
        </p>

        <p style={{ marginTop: "0.8em" }}>
          Nicholas conceives his practice as a space where software
          engineering and live performance can conceptualize, visualize and
          provoke new vibrant aesthetics, drawing attention to complex and
          invisible systems.
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

        {/* ATM — current status ------------------------------------------- */}
        <p className="atm-mark">
          atm
          <br />↪
        </p>
        <p style={{ maxWidth: "52ch" }}>
          about to open the 2026 festival season — The xx (incl. Coachella
          Main Stage), Its Murph&rsquo;s Weightless Tour across North
          America, VFX for Nike&rsquo;s Air Liquid Max, and a festival tent
          installation at Mach1. Running TouchDesigner workshops with Touch
          Collective in Naarm throughout.
        </p>

        <p className="callout" style={{ marginTop: "1.2em" }}>
          <span className="bang">!!</span>{" "}
          looking for new opportunities to build interactive rooms, teach
          real-time systems, and talk to people interested in &ldquo;rooms
          that watch back&rdquo;
          <br />
          <span className="pinme">(pin me if interested)</span>
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
          <i>
            Interactive rooms and live improvised audiovisual sets. Rooms
            that watch back.
          </i>
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
          <i>Visual work contributed across Naarm&rsquo;s dancefloors and
          festivals:</i>
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
            Work made just for fun — instruments, ports, and studies that
            escaped the client folder. Being re-catalogued; new work lands
            here soon.
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
            Software I&rsquo;ve made and released — trackers, bridges, and
            note-taking for the TouchDesigner ecosystem.
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
          Co-founder of <i>Touch Collective</i> — regular TouchDesigner
          workshops, artist talks, and live visual events in Naarm /
          Melbourne. Technical TouchDesigner tutorials and creative-coding
          education on YouTube. Recent talks include{" "}
          <i>Creative Technology Melbourne</i>. For workshop bookings,{" "}
          <a href={`mailto:${site.email}`}>write to me</a>.
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
        <BinaryLine text="all things are nothing to us" />
        <p className="foot">
          This website was last updated on{" "}
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          . It is always rendering. The background is a point-cloud scan of a
          real room; the bars down the right edge are the page itself.
          Contact{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a> for commissions,
          talks, teaching, and press. Everything written by me on this page
          can be reused with credit. <span className="pagemark">0*</span>
        </p>
      </div>
    </>
  );
}
