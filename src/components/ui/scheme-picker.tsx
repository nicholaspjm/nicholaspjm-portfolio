"use client";

import { useEffect, useSyncExternalStore } from "react";

/** Typefaces. "narrow" and "unified" are the mindyseu.com register: one
 *  condensed grotesque at a tight leading; unified drops the separate
 *  technical face entirely, as that site does. */
export const FONTS: { id: string; label: string }[] = [
  { id: "", label: "arial" },
  { id: "narrow", label: "narrow" },
  { id: "unified", label: "unified" },
  { id: "helvetica", label: "helvetica" },
  { id: "system", label: "system" },
  { id: "times", label: "times" },
  { id: "georgia", label: "georgia" },
  { id: "verdana", label: "verdana" },
  { id: "courier", label: "courier" },
];

/** What sits behind the page. Everything prefixed "gen-" is a real-time
 *  simulation drawn by GenerativeField; the rest are the originals. */
export const BACKDROPS: { id: string; label: string }[] = [
  { id: "cloud", label: "point cloud" },
  // Every "gen-" option is the same physarum simulation under different
  // sensing and movement parameters. See generative-field.tsx for what each
  // one changes.
  { id: "gen-network", label: "network" },
  { id: "gen-lattice", label: "lattice" },
  { id: "gen-rivers", label: "rivers" },
  { id: "gen-spiral", label: "spiral" },
  { id: "gen-radial", label: "radial" },
  { id: "gen-filament", label: "filament" },
  { id: "gen-turbulent", label: "turbulent" },
  { id: "gen-crystal", label: "crystal" },
  { id: "gen-bloom", label: "bloom" },
  { id: "blur", label: "gaussian blur" },
  { id: "plain", label: "plain" },
];

const BACK_KEY = "npjm-backdrop";
const FONT_KEY = "npjm-font";

// A tiny external store rather than useState seeded in an effect. The saved
// choice only exists on the client, so reading it during render would
// disagree with the server's HTML; useSyncExternalStore is built for exactly
// that split: it renders the server snapshot, then swaps in the real one
// without a hydration mismatch and without setting state from an effect.
const cache: Record<string, string | null> = { [BACK_KEY]: null, [FONT_KEY]: null };
const listeners = new Set<() => void>();

function read(key: string, fallback: string) {
  if (cache[key] === null) {
    try {
      cache[key] = localStorage.getItem(key) ?? fallback;
    } catch {
      cache[key] = fallback; // private mode
    }
  }
  return cache[key] as string;
}
function write(key: string, next: string) {
  cache[key] = next;
  try {
    localStorage.setItem(key, next);
  } catch {
    /* private mode: the choice just won't persist */
  }
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
const getBackdrop = () => read(BACK_KEY, "cloud");
const getFont = () => read(FONT_KEY, "");
const serverBackdrop = () => "cloud";
const serverFont = () => "";

/**
 * Preview controls: typeface and backdrop. Colour, button style and dot size
 * have been settled on the live site (paper, underline, 1px) and their pickers
 * are gone; the palettes themselves stay in globals.css, inert without the
 * data attribute, in case they are wanted again.
 *
 * Both choices are written to <html> as data attributes and cleared on
 * unmount, so nothing can leak onto the live pages.
 */
export function SchemePicker() {
  const backdrop = useSyncExternalStore(subscribe, getBackdrop, serverBackdrop);
  const font = useSyncExternalStore(subscribe, getFont, serverFont);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.backdrop = backdrop;
    if (font) el.dataset.font = font;
    else delete el.dataset.font;
  }, [backdrop, font]);

  useEffect(() => {
    return () => {
      const el = document.documentElement;
      delete el.dataset.backdrop;
      delete el.dataset.font;
    };
  }, []);

  return (
    <>
      <div className="scheme-picker">
        <span className="scheme-label">type</span>
        {FONTS.map((f) => (
          <button
            key={f.label}
            onClick={() => write(FONT_KEY, f.id)}
            aria-pressed={font === f.id}
            className={font === f.id ? "on" : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="scheme-picker dot-picker">
        <span className="scheme-label">behind</span>
        {BACKDROPS.map((b) => (
          <button
            key={b.label}
            onClick={() => write(BACK_KEY, b.id)}
            aria-pressed={backdrop === b.id}
            className={backdrop === b.id ? "on" : undefined}
          >
            {b.label}
          </button>
        ))}
      </div>
    </>
  );
}
