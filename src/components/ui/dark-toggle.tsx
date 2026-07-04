"use client";

import { useEffect, useState } from "react";

/**
 * Light/dark toggle. Light is the blue-yellow base (:root); dark applies
 * html[data-theme="dark"] (blue-noir). Choice persists in localStorage.
 */
export function DarkToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem("npjm-theme") === "dark");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    localStorage.setItem("npjm-theme", next ? "dark" : "light");
  };

  return (
    <button
      className="dark-toggle"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? "☀ light" : "☾ dark"}
    </button>
  );
}
