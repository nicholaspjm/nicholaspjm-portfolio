"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

/** Rows/preview render small, so serve the generated thumbnail tier. */
const thumbOf = (src: string) =>
  src.startsWith("/images/projects/")
    ? src.replace("/images/projects/", "/images/thumbs/")
    : src;

export interface PreviewData {
  t: string; // title
  y?: string | number; // year
  k?: string; // kind/section
  s?: string; // summary
  img?: string;
  href?: string;
}

/**
 * The right side of the screen is a live preview zone, screenwalks-style:
 * hover anything carrying data-prev (JSON) and it renders there immediately;
 * move off it and the zone clears. While a preview is up, the <html>
 * element carries data-preview="1" so other furniture (the scatter field)
 * can get out of the way.
 */
export function PreviewZone() {
  const [pv, setPv] = useState<PreviewData | null>(null);

  useEffect(() => {
    let clearTimer: ReturnType<typeof setTimeout> | null = null;
    // Cross-highlight: hovering anything tagged data-work lights up every
    // element for that work (its entry text + its image) via .work-hover, so an
    // image hover highlights the linked text exactly like hovering the text.
    let lastWork: string | null = null;
    const syncWork = (slug: string | null) => {
      if (slug === lastWork) return;
      if (lastWork)
        document
          .querySelectorAll(`[data-work="${CSS.escape(lastWork)}"]`)
          .forEach((x) => x.classList.remove("work-hover"));
      if (slug)
        document
          .querySelectorAll(`[data-work="${CSS.escape(slug)}"]`)
          .forEach((x) => x.classList.add("work-hover"));
      lastWork = slug;
    };
    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.("[data-prev]");
      if (el) {
        if (clearTimer) {
          clearTimeout(clearTimer);
          clearTimer = null;
        }
        try {
          setPv(JSON.parse(el.getAttribute("data-prev") ?? ""));
        } catch {
          /* ignore malformed payloads */
        }
      } else if (!clearTimer) {
        // clear when the mouse leaves entries — small grace period so
        // crossing the gap between adjacent items doesn't flicker
        clearTimer = setTimeout(() => {
          clearTimer = null;
          setPv(null);
        }, 180);
      }
      const workEl = target?.closest?.("[data-work]");
      syncWork(workEl?.getAttribute("data-work") ?? null);
    };
    const custom = (e: Event) => {
      const d = (e as CustomEvent<PreviewData>).detail;
      if (d && d.t) {
        if (clearTimer) {
          clearTimeout(clearTimer);
          clearTimer = null;
        }
        setPv(d);
      }
    };
    document.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("npjm:preview", custom);
    return () => {
      if (clearTimer) clearTimeout(clearTimer);
      syncWork(null);
      document.removeEventListener("mouseover", over);
      window.removeEventListener("npjm:preview", custom);
    };
  }, []);

  useEffect(() => {
    if (pv) {
      document.documentElement.dataset.preview = "1";
    } else {
      delete document.documentElement.dataset.preview;
    }
  }, [pv]);

  if (!pv) return null;
  return (
    <aside className="preview-zone" aria-hidden>
      <p className="pv-meta">
        {[pv.y, pv.k, pv.href].filter(Boolean).join(" · ")}
      </p>
      <h2 className="pv-title">{pv.t}</h2>
      {pv.s && <p className="pv-sum">{pv.s}</p>}
      {pv.img && (
        // asset() applies the deploy basePath (raw <img src> doesn't get it
        // automatically), so the preview image loads on the live subpath too.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(thumbOf(pv.img))} alt={pv.t} loading="lazy" />
      )}
    </aside>
  );
}
