"use client";

import { useEffect, useState } from "react";

/**
 * Ikeda-style corner data readout: cursor position, scroll depth,
 * viewport, UTC clock. Fixed bottom-right, tiny mono, ignorable.
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
      {line}
    </div>
  );
}
