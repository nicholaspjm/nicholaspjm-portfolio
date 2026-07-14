"use client";

import { useState, useSyncExternalStore } from "react";
import { editableText } from "@/content/editable-text";
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
    const edits: Record<string, { value: string; default: string }> = {};
    document.querySelectorAll<HTMLElement>("[data-edit-id]").forEach((el) => {
      const key = el.getAttribute("data-edit-id");
      if (!key) return;
      // Text regions carry their value as innerText; non-text controls (e.g.
      // the image-size picker) expose it via data-edit-value.
      const raw = el.getAttribute("data-edit-value");
      const value = (raw !== null ? raw : el.innerText).trim();
      const dflt = el.getAttribute("data-edit-default") ?? "";
      // Some regions exist twice on a page (a project listed under selected
      // works AND its section carries twin editables/rows). When duplicates
      // disagree, keep the copy that CHANGED from the saved state, so editing
      // either twin wins over the untouched one.
      const current = (editableText[key] ?? dflt).trim();
      const prev = edits[key];
      if (!prev || value !== current) {
        edits[key] = { value, default: dflt };
      }
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
        setStatus("no changes to save");
      } else {
        setStatus(`saved locally (${data.changed}), pushes next update`);
      }
    } catch {
      setStatus("studio offline. run: npm run studio");
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
      {editMode && <button onClick={save}>save</button>}
      {status && <span className="editbar-status">{status}</span>}
    </div>
  );
}
