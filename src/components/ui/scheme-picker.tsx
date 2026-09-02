"use client";

import { useEffect, useSyncExternalStore } from "react";

/** What sits behind the page. Everything prefixed "gen-" is a real-time
 *  simulation drawn by GenerativeField; the rest are the originals. */
export const BACKDROPS: { id: string; label: string }[] = [
  { id: "cloud", label: "point cloud" },
  // Every "gen-" option is the same physarum simulation released on a ring,
  // which is what gives them all the soft-circle character. See
  // generative-field.tsx for what each one varies.
  { id: "gen-halo", label: "halo" },
  { id: "gen-corona", label: "corona" },
  { id: "gen-wisp", label: "wisp" },
  { id: "gen-drift", label: "drift" },
  { id: "gen-aura", label: "aura" },
  { id: "blur", label: "gaussian blur" },
  { id: "plain", label: "plain" },
];

/** Backdrop colour ramp. */
export const TINTS: { id: string; label: string }[] = [
  { id: "ink", label: "ink" },
  { id: "graphite", label: "graphite" },
  { id: "yellow", label: "yellow" },
  { id: "blue", label: "blue" },
];

/** Steps per displayed frame, for fast-forwarding a slow preset. */
export const SPEEDS: { id: string; label: string }[] = [
  { id: "1", label: "1x" },
  { id: "2", label: "2x" },
  { id: "4", label: "4x" },
  { id: "8", label: "8x" },
  { id: "16", label: "16x" },
];

/** Surface treatment. Acts on the render, not the simulation. */
export const TEXTURES: { id: string; label: string }[] = [
  { id: "mist", label: "mist" },
  { id: "soft", label: "soft" },
  { id: "glow", label: "glow" },
  { id: "bloom", label: "bloom" },
  { id: "grain", label: "grain" },
  { id: "velvet", label: "velvet" },
];

const BACK_KEY = "npjm-backdrop";
const TEX_KEY = "npjm-texture";
const SPEED_KEY = "npjm-speed";
const TINT_KEY = "npjm-tint";

// A tiny external store rather than useState seeded in an effect. The saved
// choice only exists on the client, so reading it during render would
// disagree with the server's HTML; useSyncExternalStore is built for exactly
// that split: it renders the server snapshot, then swaps in the real one
// without a hydration mismatch and without setting state from an effect.
const cache: Record<string, string | null> = {
  [BACK_KEY]: null,
  [TINT_KEY]: null,
  [SPEED_KEY]: null,
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
/**
 * A stored choice is only honoured if it still exists. Renaming the presets
 * left anyone who had used the preview with "gen-rivers" in localStorage: no
 * crash, thanks to the fallback in generative-field, but the picker showed
 * nothing selected while the field quietly ran something else. Validating on
 * read means a removed option simply reverts to the default.
 */
const valid = (list: { id: string }[], v: string, fallback: string) =>
  list.some((o) => o.id === v) ? v : fallback;

const getBackdrop = () => valid(BACKDROPS, read(BACK_KEY, "cloud"), "cloud");
const getTint = () => valid(TINTS, read(TINT_KEY, "ink"), "ink");
const getTex = () => valid(TEXTURES, read(TEX_KEY, "mist"), "mist");
const getSpeed = () => valid(SPEEDS, read(SPEED_KEY, "2"), "2");
const serverBackdrop = () => "cloud";
const serverTint = () => "ink";
const serverTex = () => "mist";
const serverSpeed = () => "2";

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
  const tint = useSyncExternalStore(subscribe, getTint, serverTint);
  const texture = useSyncExternalStore(subscribe, getTex, serverTex);
  const speed = useSyncExternalStore(subscribe, getSpeed, serverSpeed);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.backdrop = backdrop;
    el.dataset.tint = tint;
    el.dataset.texture = texture;
    el.dataset.speed = speed;
  }, [backdrop, tint, texture, speed]);

  useEffect(() => {
    return () => {
      const el = document.documentElement;
      delete el.dataset.backdrop;
      delete el.dataset.tint;
      delete el.dataset.texture;
      delete el.dataset.speed;
      delete el.dataset.reset;
    };
  }, []);

  return (
    <>
      <div className="scheme-picker">
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
        <span className="scheme-label">speed</span>
        {SPEEDS.map((sp) => (
          <button
            key={sp.label}
            onClick={() => write(SPEED_KEY, sp.id)}
            aria-pressed={speed === sp.id}
            className={speed === sp.id ? "on" : undefined}
          >
            {sp.label}
          </button>
        ))}
        <button
          onClick={() => {
            // A changing token rather than a flag, so pressing it twice in a
            // row still restarts. Not stored: a reset is a moment, not a
            // setting to carry across reloads.
            document.documentElement.dataset.reset = String(Date.now());
          }}
        >
          reset
        </button>
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
