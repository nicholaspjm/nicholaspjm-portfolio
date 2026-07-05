"use client";

import { useSyncExternalStore } from "react";
import {
  getSquish,
  getServerSquish,
  setSquish,
  subscribeSquish,
  isSquishFrame,
} from "@/lib/squish-store";

/**
 * Toggles the "squish" preview: the whole site renders inside a real half-size
 * window (an iframe), reflowed to that smaller resolution and fully
 * interactive, with the rest of the screen left empty. Choice persists.
 */
export function SquishToggle() {
  const squish = useSyncExternalStore(
    subscribeSquish,
    getSquish,
    getServerSquish,
  );

  // No toggle inside the preview iframe itself.
  if (isSquishFrame) return null;

  return (
    <button
      className="squish-toggle"
      onClick={() => setSquish(!squish)}
      aria-label={squish ? "Full-window layout" : "Half-window preview"}
    >
      {squish ? "wide" : "squish"}
    </button>
  );
}
