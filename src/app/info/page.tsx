import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { NavButton } from "@/components/ui/nav-button";
import { NoiseRule } from "@/components/ui/noise";
import { Editable } from "@/components/ui/editable";

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

      <p style={{ marginTop: "0.6em" }}>
        <Editable id="info.label.about" as="span" className="extra">
          about
        </Editable>
      </p>

      <div style={{ maxWidth: "64ch" }}>
        <Editable id="info.about.p1" as="p" style={{ marginTop: "0.6em" }}>
          I&rsquo;m a designer and technologist based in Naarm / Melbourne, b.
          1999 in Aotearoa New Zealand. My practice works across audio-reactive
          visuals, interactive installation, and motion, building real-time
          systems for touring artists, brands, and cultural institutions.
        </Editable>
        <Editable id="info.about.p2" as="p" style={{ marginTop: "0.6em" }}>
          I hold a Bachelor of Arts in Computer Science from the University of
          Auckland, and worked as a software developer before moving into visual
          design — an engineering background that shapes how I build shows:
          versioned, tested, and performed live. I work primarily in
          TouchDesigner, GLSL, Python, and depth-sensing hardware.
        </Editable>
        <p style={{ marginTop: "0.6em" }}>
          Recent work includes visual design for The xx, Nine Inch Nails, Nike,
          Odetari, Ravyn Lenae, Its Murph, and smokedope2016, in collaboration
          with studios including MTLA Studio, 1080p Studios, Phase 3 Concepts,
          and Lyrical Lemonade. I&rsquo;m a co-founder of{" "}
          <em>Touch Collective</em>, a creative-technology studio and workshop
          series, and I teach TouchDesigner through workshops, talks, and
          published tutorials.
        </p>
        <p style={{ marginTop: "0.6em" }}>
          I&rsquo;m available for commissions, art direction, teaching, and
          speaking. A full record of projects, performances, awards, and press
          is on the <Link href="/cv">CV</Link>.
        </p>
      </div>

      <NoiseRule char="/" />

      <p>
        <Editable id="info.label.contact" as="span" className="extra">
          contact
        </Editable>
        <br />
        For commissions, collaborations, teaching, and press:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> · +61 480 748 953 ·{" "}
        <span className="data" style={{ fontSize: 13 }}>
          @nicholaspjm
        </span>
      </p>

      <p style={{ marginTop: "0.8em" }}>
        <Editable id="info.label.colophon" as="span" className="extra">
          colophon
        </Editable>
        <br />
        Built with Next.js. Set in Arial with Courier for data. The background
        of the <Link href="/">index</Link> is a point-cloud scan; the rail at
        right is a live map of the page&rsquo;s structure. Design favours
        structure and legibility over ornament.
      </p>

      <p className="foot" style={{ marginTop: "0.8em" }}>
        Last updated{" "}
        {new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        . &copy; {new Date().getFullYear()} Nicholas Marriott, Naarm /
        Melbourne.
      </p>
    </>
  );
}
