"use client";

import { useState, type ReactNode } from "react";

/**
 * Non-modal about sheet: a native button toggles a panel that slides up
 * from the bottom edge. No overlay — the rest of the page stays fully
 * interactive while it's open.
 */
export function InfoSheet({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen((o) => !o)}>about</button>
      <div className={open ? "sheet-panel open" : "sheet-panel"}>
        <button className="sheet-close" onClick={() => setOpen(false)}>
          close
        </button>
        {children}
      </div>
    </>
  );
}
