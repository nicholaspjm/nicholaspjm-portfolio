import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { events } from "@/content/cv";
import { NavButton } from "@/components/ui/nav-button";
import { NoiseRule, BinaryLine } from "@/components/ui/noise";

export const metadata: Metadata = { title: "Info" };

export default function InfoPage() {
  return (
    <>
      <p>
        <NavButton href="/">← index</NavButton>
        <NavButton href="/work">work</NavButton>
        <NavButton href="/sketches">sketches</NavButton>
        <NavButton href="/cv">CV</NavButton>
        <NavButton href={`mailto:${site.email}`}>{site.email}</NavButton>
        {site.social.map((s) => (
          <NavButton key={s.href} href={s.href}>
            {s.label.toLowerCase()}
          </NavButton>
        ))}
      </p>

      <p>
        <span className="extra">about</span>
        <br />
        <i>written as pseudoprose. fragments are load-bearing.</i>
      </p>

      <ul>
        <li>b. 1999, aotearoa new zealand. naarm/melbourne now.</li>
        <li>designer; technologist. the slash does real work.</li>
        <li>
          make: visuals that listen. rooms that watch back. type that moves.
          light that behaves like weather.
        </li>
        <li>
          tools: touchdesigner. glsl. python. arduino. gaussian splats. depth
          cameras. whatever the room needs.
        </li>
        <li>
          method: patch fast; delete faster. real-time or nothing. the render
          queue is a waiting room.
        </li>
        <li>
          believe: attribution is a form of activism. show the wires. sites
          should read like source.
        </li>
        <li>
          co-founded <em>touch collective</em> — workshops, artist talks, live
          visual events. teaching is practice, not a side quest.
        </li>
        <li>
          worked with: the xx. nine inch nails. nike. odetari. ravyn lenae.
          its murph. smokedope2016. reptant. cheahdx / purespace. lyrical
          lemonade. mtla studio. 1080p studios. phase 3 concepts.
        </li>
        <li>
          played for: {events.map((e) => e.toLowerCase()).join(". ")}. more
          being remembered.
        </li>
        <li>grammy on the shelf; still patching at 2am.</li>
      </ul>

      <NoiseRule char="/" />

      <p>
        <span className="extra">contact</span>
        <br />
        commissions, talks, teaching, press:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> · +61 480 748 953 ·{" "}
        <span className="data" style={{ fontSize: 13 }}>
          @nicholaspjm
        </span>{" "}
        everywhere.
      </p>

      <p>
        <span className="extra">colophon</span>
        <br />
        built with next.js; reads like 1996 on purpose. arial, courier for
        the data, hyperlink blue <span className="highlight">#0000ff</span>,
        and <span style={{ background: "#00ff00" }}>#00ff00</span>. the bars
        down the right edge are the page&rsquo;s own structure; the
        background of the <Link href="/">index</Link> is a point-cloud scan
        of a real room — it flinches from your cursor. structure over
        decoration. this page is{" "}
        <a href="https://taylor.town/pseudoprose" target="_blank" rel="noreferrer">
          pseudoprose
        </a>
        . the noise is{" "}
        <i>
          corecore
        </i>{" "}
        — &ldquo;if there is a politics to it, it can be found in the effects
        of negativity.&rdquo;
      </p>

      <BinaryLine text="on my computer becoming" />
      <p className="foot">
        last updated{" "}
        {new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        . © nicholas marriott, naarm / melbourne.{" "}
        <span className="pagemark">∞*</span>
      </p>
    </>
  );
}
