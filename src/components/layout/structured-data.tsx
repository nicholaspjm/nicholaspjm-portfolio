import { site } from "@/content/site";
import type { Project } from "@/types/content";
import { abs, projectOgImage, projectStill } from "@/lib/seo";

/**
 * JSON-LD. This is what lets Google treat the site as *a person* rather than
 * a loose pile of pages: it ties the name, the alternate names people
 * actually search ("nicholaspjm"), the discipline and the social profiles
 * into one entity, which is the prerequisite for a knowledge panel on a name
 * search.
 *
 * Rendered from server components, so it lands in the static HTML and needs
 * no JavaScript to be seen by a crawler.
 */
function Ld({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Content is authored here, not user input — nothing to escape beyond
      // what JSON.stringify already does.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** The person behind the site. Referenced by @id from every work. */
export function PersonSchema() {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${site.url}/#person`,
        name: site.name,
        alternateName: site.alsoKnownAs,
        url: site.url,
        email: `mailto:${site.email}`,
        jobTitle: "Creative technologist and new media artist",
        description: site.tagline,
        knowsAbout: site.keywords,
        sameAs: site.social.map((s) => s.href),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Melbourne",
          addressRegion: "VIC",
          addressCountry: "AU",
        },
        // "Based in Melbourne" stated as data rather than only as prose. A
        // bare PostalAddress says where the person is; occupationLocation and
        // workLocation say where the *practice* operates, which is what a
        // "<discipline> in Melbourne" search is actually asking about.
        hasOccupation: {
          "@type": "Occupation",
          name: "Creative technologist and new media artist",
          occupationLocation: {
            "@type": "City",
            name: "Melbourne",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Melbourne",
              addressRegion: "VIC",
              addressCountry: "AU",
            },
          },
          skills: site.keywords?.join(", "),
        },
        workLocation: {
          "@type": "Place",
          name: "Naarm / Melbourne, Australia",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Melbourne",
            addressRegion: "VIC",
            addressCountry: "AU",
          },
        },
      }}
    />
  );
}

/**
 * The practice as a service, so a commission-intent search ("touchdesigner
 * melbourne", "projection mapping melbourne") has something to match beyond a
 * biography. Deliberately a `Service` and not a `LocalBusiness`: there is no
 * shopfront or public street address to give, and claiming one would be false.
 */
export function ServiceSchema() {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${site.url}/#practice`,
        name: "Real-time visuals, projection and interactive installation",
        description:
          "Commissioned real-time visual work from Naarm / Melbourne: TouchDesigner systems, projection design and mapping, audio-reactive visuals for live shows and touring, interactive installation, and teaching.",
        provider: { "@id": `${site.url}/#person` },
        url: site.url,
        serviceType: [
          "TouchDesigner development",
          "Projection design and mapping",
          "Audio-reactive visuals",
          "Live and touring visuals",
          "Interactive installation",
          "Real-time graphics systems",
          "Workshops and teaching",
        ],
        areaServed: [
          { "@type": "City", name: "Melbourne" },
          { "@type": "State", name: "Victoria" },
          { "@type": "Country", name: "Australia" },
        ],
      }}
    />
  );
}

/** Trail for a project page, so results can show index > work > title. */
export function BreadcrumbSchema({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: site.name, item: abs("/") },
          { "@type": "ListItem", position: 2, name: "Work", item: abs("/work/") },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: abs(`/work/${slug}/`),
          },
        ],
      }}
    />
  );
}

/** The site itself, so search results can carry a site name. */
export function WebSiteSchema() {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.tagline,
        inLanguage: "en-AU",
        publisher: { "@id": `${site.url}/#person` },
      }}
    />
  );
}

/** One project, credited back to the person entity. */
export function ProjectSchema({ project }: { project: Project }) {
  const url = abs(`/work/${project.slug}/`);
  const still = projectStill(project);
  // Categories and tags overlap on some works ("Live Coding" is often both),
  // and a repeated keyword in JSON-LD reads as padding.
  const keywords = [
    ...new Set([...(project.categories ?? []), ...(project.tags ?? [])]),
  ];

  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: project.title,
        description: project.summary,
        url,
        dateCreated: project.year,
        creator: { "@id": `${site.url}/#person` },
        isPartOf: { "@id": `${site.url}/#website` },
        inLanguage: "en-AU",
        ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
        ...(still ? { image: abs(projectOgImage(project.slug)) } : {}),
        ...(project.role ? { creditText: project.role } : {}),
      }}
    />
  );
}
