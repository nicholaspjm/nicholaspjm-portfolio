"use client";

import { useSyncExternalStore } from "react";
import {
  getSquish,
  getServerSquish,
  subscribeSquish,
  isSquishFrame,
} from "@/lib/squish-store";

/**
 * In squish mode the real content (.app-root) is hidden and the whole site is
 * loaded fresh inside this iframe, sized to half the screen. Because an iframe
 * is a real viewport, the site reflows to the smaller resolution and is fully
 * interactive, exactly as if the site were opened in a half-size window.
 */
export function SquishFrame() {
  const squish = useSyncExternalStore(
    subscribeSquish,
    getSquish,
    getServerSquish,
  );

  // The document inside the iframe must never spawn another iframe.
  if (isSquishFrame || !squish) return null;

  const src = window.location.pathname + window.location.search;

  return <iframe className="squish-frame" src={src} title="Half-window preview" />;
}
