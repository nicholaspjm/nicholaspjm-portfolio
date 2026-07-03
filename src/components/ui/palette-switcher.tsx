"use client";

import { useEffect, useState } from "react";

/** Early-web palettes — keys match html[data-theme] blocks in globals.css. */
/* "blue" is the base (:root, no data-theme); the rest are variations. */
const PALETTES = [
  "blue",
  "blue-cyan",
  "blue-yellow",
  "blue-red",
  "blue-electric",
  "blue-navy",
  "blue-paper",
  "blue-invert",
  "blue-mono",
  "blue-noir",
] as const;

/**
 * A collapsible early-web palette picker pinned bottom-left. Applies a theme
 * by setting html[data-theme] and remembers the choice in localStorage.
 */
export function PaletteSwitcher() {
  const [theme, setTheme] = useState<string>("blue");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("npjm-theme");
    if (saved) setTheme(saved);
  }, []);

  const apply = (t: string) => {
    setTheme(t);
    if (t === "blue") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    localStorage.setItem("npjm-theme", t);
  };

  return (
    <div className="palette">
      {open && (
        <div className="palette-list">
          {PALETTES.map((p) => (
            <button
              key={p}
              className={p === theme ? "pal on" : "pal"}
              onClick={() => apply(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <button className="palette-toggle" onClick={() => setOpen((o) => !o)}>
        ◧ palette: {theme}
      </button>
    </div>
  );
}
