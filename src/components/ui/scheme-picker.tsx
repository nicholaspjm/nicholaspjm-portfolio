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
  // Every "gen-" option is the same physarum simulation released on a ring,
  // which is what gives them all the soft-circle character. See
  // generative-field.tsx for what each one varies.
  { id: "gen-filament", label: "filament" },
  { id: "gen-halo", label: "halo" },
  { id: "gen-orbit", label: "orbit" },
  { id: "gen-corona", label: "corona" },
  { id: "gen-nest", label: "nest" },
  { id: "gen-wisp", label: "wisp" },
  { id: "gen-drift", label: "drift" },
  { id: "gen-coil", label: "coil" },
  { id: "gen-aura", label: "aura" },
  { id: "blur", label: "gaussian blur" },
  { id: "plain", label: "plain" },
];

/** Backdrop colour ramp. */
export const TINTS: { id: string; label: string }[] = [
  { id: "ink", label: "ink" },
  { id: "blue", label: "blue" },
  { id: "slate", label: "slate" },
  { id: "warm", label: "warm" },
  { id: "sage", label: "sage" },
  { id: "violet", label: "violet" },
  { id: "rose", label: "rose" },
];

/** Surface treatment. Acts on the render, not the simulation. */
export const TEXTURES: { id: string; label: string }[] = [
  { id: "crisp", label: "crisp" },
  { id: "soft", label: "soft" },
  { id: "mist", label: "mist" },
  { id: "glow", label: "glow" },
  { id: "bloom", label: "bloom" },
  { id: "grain", label: "grain" },
  { id: "velvet", label: "velvet" },
];

const BACK_KEY = "npjm-backdrop";
const TINT_KEY = "npjm-tint";
const TEX_KEY = "npjm-texture";
const FONT_KEY = "npjm-font";

// A tiny external store rather than useState seeded in an effect. The saved
// choice only exists on the client, so reading it during render would
// disagree with the server's HTML; useSyncExternalStore is built for exactly
// that split: it renders the server snapshot, then swaps in the real one
// without a hydration mismatch and without setting state from an effect.
const cache: Record<string, string | null> = {
  [BACK_KEY]: null,
  [FONT_KEY]: null,
  [TINT_KEY]: null,
  [TEX_KEY]: null,
};
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
const getTint = () => read(TINT_KEY, "ink");
const getTex = () => read(TEX_KEY, "crisp");
const serverBackdrop = () => "cloud";
const serverFont = () => "";
const serverTint = () => "ink";
const serverTex = () => "crisp";

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
  const tint = useSyncExternalStore(subscribe, getTint, serverTint);
  const texture = useSyncExternalStore(subscribe, getTex, serverTex);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.backdrop = backdrop;
    if (font) el.dataset.font = font;
    else delete el.dataset.font;
    el.dataset.tint = tint;
    el.dataset.texture = texture;
  }, [backdrop, font, tint, texture]);

  useEffect(() => {
    return () => {
      const el = document.documentElement;
      delete el.dataset.backdrop;
      delete el.dataset.font;
      delete el.dataset.tint;
      delete el.dataset.texture;
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
        <span className="scheme-label">colour</span>
        {TINTS.map((t) => (
          <button
            key={t.label}
            onClick={() => write(TINT_KEY, t.id)}
            aria-pressed={tint === t.id}
            className={tint === t.id ? "on" : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="scheme-picker dot-picker">
        <span className="scheme-label">texture</span>
        {TEXTURES.map((t) => (
          <button
            key={t.label}
            onClick={() => write(TEX_KEY, t.id)}
            aria-pressed={texture === t.id}
            className={texture === t.id ? "on" : undefined}
          >
            {t.label}
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
