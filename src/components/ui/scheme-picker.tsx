"use client";

import { useEffect, useSyncExternalStore } from "react";

/** The palettes on offer. The empty id is the site's own blue-yellow base. */
export const SCHEMES: { id: string; label: string }[] = [
  { id: "", label: "base" },
  { id: "mono", label: "mono" },
  { id: "amber", label: "amber" },
  { id: "blueprint", label: "blueprint" },
  { id: "sage", label: "sage" },
];

const KEY = "npjm-scheme";

// A tiny external store rather than useState seeded in an effect. The saved
// scheme only exists on the client, so reading it during render would
// disagree with the server's HTML; useSyncExternalStore is built for exactly
// that split — it renders the server snapshot, then swaps in the real one
// without a hydration mismatch and without setting state from an effect.
let cached: string | null = null;
const listeners = new Set<() => void>();

function getSnapshot() {
  if (cached === null) {
    try {
      cached = localStorage.getItem(KEY) ?? "";
    } catch {
      cached = ""; // private mode
    }
  }
  return cached;
}
const getServerSnapshot = () => "";
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function setScheme(next: string) {
  cached = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* private mode — the scheme just won't persist */
  }
  listeners.forEach((l) => l());
}

/**
 * Colour-scheme switcher, /preview only. Sets data-scheme on <html>, which
 * the palettes in globals.css key off. The choice is remembered so a scheme
 * survives a reload while it is being lived with, and is cleared on unmount
 * so it can never leak onto the live pages.
 */
export function SchemePicker() {
  const scheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const el = document.documentElement;
    if (scheme) el.dataset.scheme = scheme;
    else delete el.dataset.scheme;
  }, [scheme]);

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.scheme;
    };
  }, []);

  return (
    <div className="scheme-picker">
      <span className="scheme-label">colour</span>
      {SCHEMES.map((s) => (
        <button
          key={s.id || "base"}
          onClick={() => setScheme(s.id)}
          aria-pressed={scheme === s.id}
          className={scheme === s.id ? "on" : undefined}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
