"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * One homepage category, folded to its label until clicked (the /preview
 * experiment). The body stays mounted so the unfold can animate — the CSS
 * grid-template-rows 0fr/1fr transition, see .fold in globals.css — and is
 * made inert while closed so links inside it can't be tabbed to.
 */
export function Fold({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  return (
    <section className={open ? "fold open" : "fold"}>
      <h2 className="fold-head">
        <button
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="extra">{label}</span>
        </button>
      </h2>
      <div id={bodyId} className="fold-body">
        <div className="fold-inner" inert={open ? undefined : true}>
          {children}
        </div>
      </div>
    </section>
  );
}
