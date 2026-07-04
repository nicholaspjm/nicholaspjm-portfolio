"use client";

import { useState, useSyncExternalStore } from "react";
import {
  isEditorEnabled,
  getEditMode,
  setEditMode,
  subscribe,
} from "@/lib/edit-store";

const STUDIO = "http://127.0.0.1:4477";

/**
 * Dev-only control for the in-place content editor. Toggles edit mode, then
 * collects every editable region's current text from the DOM and POSTs it to
 * the local studio server, which writes it back and pushes to live. Renders
 * nothing in production.
 */
export function EditBar() {
  const editMode = useSyncExternalStore(subscribe, getEditMode, () => false);
  const [status, setStatus] = useState<string>("");

  if (!isEditorEnabled) return null;

  const save = async () => {
    const edits: Record<string, string> = {};
    document.querySelectorAll<HTMLElement>("[data-edit-id]").forEach((el) => {
      const key = el.getAttribute("data-edit-id");
      if (key) edits[key] = el.innerText.trim();
    });
    setStatus("saving…");
    try {
      const res = await fetch(`${STUDIO}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`error: ${data.error ?? res.status}`);
      } else if (data.changed === 0) {
        setStatus("no changes");
      } else {
        setStatus(`saved + pushed (${data.changed}) — deploying`);
      }
    } catch {
      setStatus("studio offline — run: npm run studio");
    }
  };

  return (
    <div className="editbar">
      <button
        onClick={() => {
          setStatus("");
          setEditMode(!editMode);
        }}
      >
        {editMode ? "done editing" : "✎ edit text"}
      </button>
      {editMode && <button onClick={save}>save &amp; push</button>}
      {status && <span className="editbar-status">{status}</span>}
    </div>
  );
}
