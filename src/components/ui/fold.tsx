"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";

/**
 * One homepage category, folded to its label until clicked (the /preview
 * experiment). The head reproduces the exact label paragraph the live page
 * renders — same classes, same margins, passed in via headStyle/variant — so
 * the folded page keeps the live page's vertical rhythm. The body stays
 * mounted so the unfold can animate (grid-template-rows 0fr/1fr, see .fold in
 * globals.css) and is made inert while closed so its links can't be tabbed to.
 */
export function Fold({
  label,
  children,
  defaultOpen = false,
  headStyle,
  variant = "extra",
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Mirrors the inline style of the label <p> on the live homepage. */
  headStyle?: CSSProperties;
  /** "extra" = yellow highlight labels; "static" = the uppercase quiet ones. */
  variant?: "extra" | "static";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  return (
    <section className={open ? "fold open" : "fold"}>
      <h2 className="fold-head" style={headStyle}>
        <button
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={variant === "static" ? "static-label" : "extra"}>
            {label}
          </span>
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
