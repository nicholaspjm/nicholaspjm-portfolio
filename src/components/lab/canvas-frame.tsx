"use client";

import { type ReactNode, useEffect, useState } from "react";

/**
 * Standard frame for any lab experiment — a sized container with a hairline
 * border and a corner caption indicating the experiment is live.
 */
export function CanvasFrame({
  children,
  caption,
  height = "70dvh",
}: {
  children: ReactNode;
  caption?: string;
  height?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div
      className="relative w-full overflow-hidden border border-rule bg-paper-soft"
      style={{ height }}
    >
      {mounted ? (
        children
      ) : (
        <div className="grid h-full w-full place-items-center text-ink-soft">
          <span className="caption">[ booting ]</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-3">
        <span className="caption bg-paper px-1">
          <span className="text-link">●</span> Live
        </span>
        {caption && (
          <span className="caption bg-paper px-1">{caption}</span>
        )}
      </div>
    </div>
  );
}
