"use client";

import { useEffect, useState } from "react";

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
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-prev]");
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
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pv.img} alt={pv.t} />
      )}
    </aside>
  );
}
