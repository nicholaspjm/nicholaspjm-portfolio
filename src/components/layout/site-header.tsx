"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { NavButton } from "@/components/ui/nav-button";
import { InfoSheet } from "@/components/ui/info-sheet";
import { Editable } from "@/components/ui/editable";

/**
 * The site header, identical on every page.
 *
 * Each page used to roll its own: the homepage offered list view, visual view,
 * CV and the about sheet; /cv offered index, visual work and an email address;
 * /visual offered index and "index of work"; /sketches something else again.
 * Seven pages, seven different sets of links under seven different labels, so
 * where you could go depended on where you happened to be.
 *
 * The set is now fixed. The entry for the page you are on renders as plain
 * text rather than a control, so the row never changes shape as you move
 * around and nothing links to itself. Page-specific controls (the work
 * filters, the sort row, a project's prev/next) stay where they were, below.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const here = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const items = [
    { href: "/", label: "index" },
    { href: "/work", label: "list view" },
    { href: "/visual", label: "visual view" },
    { href: "/cv", label: "CV" },
  ];

  return (
    <div className="topnav">
      {items.map((it) =>
        here(it.href) ? (
          <span key={it.href} className="navhere" aria-current="page">
            {it.label}
          </span>
        ) : (
          <NavButton key={it.href} href={it.href}>
            {it.label}
          </NavButton>
        ),
      )}
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
        {/* /info was reachable from exactly one link, in the old /work header.
            Folding that header into this one would have orphaned the page, so
            the route to it lives here now. */}
        <p style={{ marginTop: "0.8em" }}>
          <Link href="/info">full info, contact and colophon</Link>
        </p>
      </InfoSheet>
    </div>
  );
}
