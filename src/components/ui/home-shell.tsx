"use client";

import { useState, type ReactNode } from "react";

/**
 * Toggles the homepage between the full "rich" view and a flat,
 * chronological "list all" view (designforthe.net-style). The button sits
 * at the very top; both trees are server-rendered and passed in as props.
 */
export function HomeShell({
  rich,
  simple,
}: {
  rich: ReactNode;
  simple: ReactNode;
}) {
  const [simpleView, setSimpleView] = useState(false);
  return (
    <>
      <p style={{ margin: "0.4em 0 1em 0" }}>
        <button onClick={() => setSimpleView((v) => !v)}>
          {simpleView ? "← rich view" : "list all ↓"}
        </button>
      </p>
      {simpleView ? simple : rich}
    </>
  );
}
