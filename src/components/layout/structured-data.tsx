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
        ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
        ...(still ? { image: abs(projectOgImage(project.slug)) } : {}),
        ...(project.role ? { creditText: project.role } : {}),
      }}
    />
  );
}
