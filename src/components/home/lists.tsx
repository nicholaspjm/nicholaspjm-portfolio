import { site } from "@/content/site";
import { performances, awards, press, teaching, education } from "@/content/cv";
import { tools } from "@/content/tools";
import * as media from "@/content/project-images";
import { Editable } from "@/components/ui/editable";
import { ImageRow } from "@/components/ui/image-row";
import { ToolEntry } from "@/components/ui/tool-entry";

// Tolerant read: project-images.ts is generated, and during a git pull with
// the dev server running it can momentarily be an older version without this
// export. Degrade to "no tool photos" instead of crashing the page.
const toolImages: Record<string, string[]> =
  (media as { toolImages?: Record<string, string[]> }).toolImages ?? {};

/** Live-performance rows, shaped like the project entries: bold title line,
 *  then year + detail. */
export function PerfList() {
  return (
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
  );
}

/** Public tools, each row clickable to its repo, with any photos dropped into
 *  content/tools/<slug>/ shown under the entry. */
export function ToolsList() {
  return (
    <ul className="tool-list">
      {tools.map((t, i) => {
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
  );
}

/** Teaching intro + rows from content/cv.csv (teaching section). */
export function TeachingList() {
  return (
    <>
      <p style={{ marginTop: "0.4em", maxWidth: "56ch" }}>
        <Editable id="teaching.intro" as="span">
          Sharing real-time techniques openly is part of the practice: I try to
          keep teaching accessible and not-for-profit, and I am always keen to
          speak and teach more.
        </Editable>{" "}
        <a href={`mailto:${site.email}`}>Get in touch</a>.
      </p>
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
                  {p.link.label}
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

/** Awards then press, one roomy list. */
export function AwardsPressList() {
  return (
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
  );
}

export function EducationList() {
  return (
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
  );
}
