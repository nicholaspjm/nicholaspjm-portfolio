/**
 * Shared "squish" preview state.
 *
 * Squish renders the whole site inside a real half-size window (an iframe), so
 * the site reflows to that smaller resolution and stays fully interactive, with
 * the rest of the screen left empty. The toggle writes this store (and
 * localStorage); the frame subscribes to decide whether to mount the iframe.
 */

let squish =
  typeof document !== "undefined" &&
  document.documentElement.dataset.squish === "1";

const listeners = new Set<() => void>();

/** True when THIS document is the copy rendered inside the preview iframe. */
export const isSquishFrame =
  typeof window !== "undefined" && window.self !== window.top;

export function getSquish() {
  return squish;
}

/** useSyncExternalStore needs a stable server snapshot (never squished on SSR). */
export function getServerSquish() {
  return false;
}

export function setSquish(next: boolean) {
  if (next === squish) return;
  squish = next;
  const el = document.documentElement;
  if (next) el.dataset.squish = "1";
  else delete el.dataset.squish;
  try {
    localStorage.setItem("npjm-squish", next ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function subscribeSquish(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
