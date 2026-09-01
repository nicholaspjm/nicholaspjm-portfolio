"use client";

import { useEffect, useSyncExternalStore } from "react";

/** The palettes on offer. The empty id is the site's own blue-yellow base. */
export const SCHEMES: { id: string; label: string }[] = [
  // Variations on the original blue-yellow first, then the departures.
  { id: "", label: "base" },
  { id: "ink", label: "ink" },
  { id: "red", label: "red" },
  { id: "green", label: "green" },
  { id: "violet", label: "violet" },
  { id: "orange", label: "orange" },
  { id: "cream", label: "cream" },
  { id: "cool", label: "cool" },
  { id: "mono", label: "mono" },
  { id: "noir", label: "noir" },
  { id: "amber", label: "amber" },
  { id: "blueprint", label: "blueprint" },
  { id: "sage", label: "sage" },
];

/** Dot sizes offered for the point cloud, in CSS pixels. */
export const DOTS: { id: string; label: string }[] = [
  { id: "0.5", label: "fine" },
  { id: "0.75", label: "small" },
  { id: "1", label: "default" },
  { id: "1.5", label: "bold" },
  { id: "2", label: "heavy" },
];

const KEY = "npjm-scheme";
const DOT_KEY = "npjm-dot";

// A tiny external store rather than useState seeded in an effect. The saved
// scheme only exists on the client, so reading it during render would
// disagree with the server's HTML; useSyncExternalStore is built for exactly
// that split — it renders the server snapshot, then swaps in the real one
// without a hydration mismatch and without setting state from an effect.
const cache: Record<string, string | null> = { [KEY]: null, [DOT_KEY]: null };
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
    /* private mode — the choice just won't persist */
  }
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
const getScheme = () => read(KEY, "");
const getDot = () => read(DOT_KEY, "1");
const serverScheme = () => "";
const serverDot = () => "1";

/**
 * Colour-scheme switcher, /preview only. Sets data-scheme on <html>, which
 * the palettes in globals.css key off. The choice is remembered so a scheme
 * survives a reload while it is being lived with, and is cleared on unmount
 * so it can never leak onto the live pages.
 */
export function SchemePicker() {
  const scheme = useSyncExternalStore(subscribe, getScheme, serverScheme);
  const dotSize = useSyncExternalStore(subscribe, getDot, serverDot);

  useEffect(() => {
    const el = document.documentElement;
    if (scheme) el.dataset.scheme = scheme;
    else delete el.dataset.scheme;
    el.dataset.dot = dotSize;
  }, [scheme, dotSize]);

  useEffect(() => {
    return () => {
      const el = document.documentElement;
      delete el.dataset.scheme;
      delete el.dataset.dot;
    };
  }, []);

  return (
    <>
      <div className="scheme-picker">
        <span className="scheme-label">colour</span>
        {SCHEMES.map((s) => (
          <button
            key={s.id || "base"}
            onClick={() => write(KEY, s.id)}
            aria-pressed={scheme === s.id}
            className={scheme === s.id ? "on" : undefined}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="scheme-picker dot-picker">
        <span className="scheme-label">dots</span>
        {DOTS.map((d) => (
          <button
            key={d.id}
            onClick={() => write(DOT_KEY, d.id)}
            aria-pressed={dotSize === d.id}
            className={dotSize === d.id ? "on" : undefined}
          >
            {d.label}
          </button>
        ))}
      </div>
    </>
  );
}
