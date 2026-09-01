"use client";

import { useEffect, useState } from "react";

/**
 * The plain replacement for the Ikeda-style work rail on /preview: a single
 * hairline across the top that fills as you scroll. No timeline, no hover
 * labels, no ambient reveals — it answers "how far down am I" and nothing
 * else. Reads position on scroll only, so it costs nothing when still.
 */
export function ScrollLine() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="scrollline" aria-hidden>
      <div className="scrollline-fill" style={{ transform: `scaleX(${pct})` }} />
    </div>
  );
}
