"use client";

import { usePathname } from "next/navigation";
import { BUILD_DATE } from "@/content/build-info";

/** Small hoist-triangle Palestine flag — inline SVG so it renders the same
 *  everywhere (Windows doesn't draw the 🇵🇸 emoji as a flag). */
function PalestineFlag() {
  return (
    <svg viewBox="0 0 22 14" role="img" aria-label="Palestinian flag">
      <rect width="22" height="14" fill="#fff" />
      <rect width="22" height="4.667" y="0" fill="#000" />
      <rect width="22" height="4.667" y="9.333" fill="#149954" />
      <path d="M0 0 L9 7 L0 14 Z" fill="#E4312b" />
    </svg>
  );
}

/**
 * Corner note: a few static site tidbits (status, last updated, place) with a
 * Palestine flag. Fixed bottom-right, tiny mono, ignorable.
 */
export function Readout() {
  // Corner overlay belongs to the main page only.
  const pathname = usePathname();
  const home = pathname === "/" || pathname === "";

  if (!home) return null;
  return (
    <div className="readout" aria-hidden>
      <div className="readout-info">
        <span className="rd-flag">
          <PalestineFlag />
        </span>
        <span>site is always in progress</span>
        {BUILD_DATE && <span>last updated {BUILD_DATE}</span>}
        <span>naarm / melbourne</span>
      </div>
    </div>
  );
}
