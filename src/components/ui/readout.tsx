"use client";

import { useEffect, useState } from "react";
import { BUILD_DATE } from "@/content/build-info";

/** Small hoist-triangle Palestine flag — inline SVG so it renders the same
 *  everywhere (Windows doesn't draw the 🇵🇸 emoji as a flag). */
function PalestineFlag() {
  return (
    <svg viewBox="0 0 22 14" role="img" aria-label="Palestinian flag">
      <rect width="22" height="14" fill="#fff" />
      <rect width="22" height="4.667" y="0" fill="#000" />
      <rect width="22" height="4.667" y="9.333" fill="#149954" />
      <path d="M0 0 L9 7 L0 14 Z" fill="#E4312b" />
    </svg>
  );
}

/**
 * Ikeda-style corner data readout: a few static site tidbits (status, last
 * updated, place) with a Palestine flag, above a live line of cursor
 * position, scroll depth, viewport, and UTC clock. Fixed bottom-right, tiny
 * mono, ignorable.
 */
export function Readout() {
  const [line, setLine] = useState("");

  useEffect(() => {
    let x = 0;
    let y = 0;

    const pad = (n: number, w = 4) => String(n).padStart(w, "0");

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      const t = new Date();
      const clock = [t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds()]
        .map((v) => String(v).padStart(2, "0"))
        .join(":");
      setLine(
        `x ${pad(x)}  y ${pad(y)}  scr ${String(pct).padStart(3, "0")}%  vp ${pad(window.innerWidth)}×${pad(window.innerHeight)}  utc ${clock}`,
      );
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      update();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const id = setInterval(update, 1000);
    update();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearInterval(id);
    };
  }, []);

  return (
    <div className="readout" aria-hidden>
      <div className="readout-info">
        <span className="rd-flag">
          <PalestineFlag />
        </span>
        <span>website under construction</span>
        {BUILD_DATE && <span>last updated {BUILD_DATE}</span>}
        <span>naarm / melbourne</span>
        <span>-37.81, 144.96</span>
      </div>
      <div className="readout-live">{line}</div>
    </div>
  );
}
