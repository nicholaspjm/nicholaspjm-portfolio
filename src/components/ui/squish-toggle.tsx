"use client";

import { useEffect, useState } from "react";

/**
 * Toggles a compact, narrow-column "squished" layout — the page content is
 * constrained to a centered narrow frame (like viewing in a slim window) while
 * the point-cloud background stays full-bleed. Choice persists in localStorage.
 */
export function SquishToggle() {
  const [squish, setSquish] = useState(false);

  useEffect(() => {
    setSquish(localStorage.getItem("npjm-squish") === "1");
  }, []);

  const toggle = () => {
    const next = !squish;
    setSquish(next);
    if (next) document.documentElement.dataset.squish = "1";
    else delete document.documentElement.dataset.squish;
    localStorage.setItem("npjm-squish", next ? "1" : "0");
  };

  return (
    <button
      className="squish-toggle"
      onClick={toggle}
      aria-label={squish ? "Full-width layout" : "Squished column layout"}
    >
      {squish ? "wide" : "squish"}
    </button>
  );
}
