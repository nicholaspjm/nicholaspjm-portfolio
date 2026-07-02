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
 * hover anything carrying data-prev (JSON) — or anything that dispatches a
 * `npjm:preview` CustomEvent (the data strip does) — and it renders there
 * immediately. The last preview persists until replaced.
 */
export function PreviewZone() {
  const [pv, setPv] = useState<PreviewData | null>(null);

  useEffect(() => {
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-prev]");
      if (!el) return;
      try {
        setPv(JSON.parse(el.getAttribute("data-prev") ?? ""));
      } catch {
        /* ignore malformed payloads */
      }
    };
    const custom = (e: Event) => {
      const d = (e as CustomEvent<PreviewData>).detail;
      if (d && d.t) setPv(d);
    };
    document.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("npjm:preview", custom);
    return () => {
      document.removeEventListener("mouseover", over);
      window.removeEventListener("npjm:preview", custom);
    };
  }, []);

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
