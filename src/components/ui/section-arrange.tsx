"use client";

import { useState, useSyncExternalStore } from "react";
import { editableText } from "@/content/editable-text";
import { isEditorEnabled, getEditMode, subscribe } from "@/lib/edit-store";

/**
 * Edit-mode panel for arranging a homepage section: move projects up/down and
 * hide them from the main page (they stay on /work and keep their pages).
 * Saves as secorder.<section> / sechide.<section>; the page itself re-renders
 * in the new order after "save" (the listing is server-rendered, so the panel
 * is the live preview of the arrangement).
 */
export function SectionArrange({
  sectionKey,
  items,
}: {
  sectionKey: string;
  /** The section's projects in their base (code/folder) order. */
  items: { slug: string; title: string }[];
}) {
  const editMode = useSyncExternalStore(subscribe, getEditMode, () => false);

  const naturalOrder = items.map((i) => i.slug).join(",");
  const [order, setOrder] = useState<string[]>(() => {
    const saved = (editableText[`secorder.${sectionKey}`] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const known = new Set(items.map((i) => i.slug));
    const out = saved.filter((s) => known.has(s));
    for (const i of items) if (!out.includes(i.slug)) out.push(i.slug);
    return out;
  });
  const [hidden, setHidden] = useState<Set<string>>(
    () =>
      new Set(
        (editableText[`sechide.${sectionKey}`] ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
  );
  const [dirty, setDirty] = useState(false);

  if (!isEditorEnabled || !editMode) return null;

  const byOrder = order
    .map((s) => items.find((i) => i.slug === s))
    .filter((i): i is { slug: string; title: string } => Boolean(i));

  const move = (slug: string, d: number) => {
    setDirty(true);
    setOrder((prev) => {
      const i = prev.indexOf(slug);
      const j = i + d;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const toggle = (slug: string) => {
    setDirty(true);
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="sec-arrange">
      <p className="sec-arrange-head">
        arrange this section (order + hide apply after save)
      </p>
      {byOrder.map((it, i) => (
        <div
          key={it.slug}
          className={hidden.has(it.slug) ? "sa-row sa-hidden" : "sa-row"}
        >
          <button onClick={() => move(it.slug, -1)} disabled={i === 0}>
            ▲
          </button>
          <button
            onClick={() => move(it.slug, 1)}
            disabled={i === byOrder.length - 1}
          >
            ▼
          </button>
          <button onClick={() => toggle(it.slug)}>
            {hidden.has(it.slug) ? "show" : "hide"}
          </button>
          <span className="sa-title">
            {it.title}
            {hidden.has(it.slug) ? " (hidden from main page)" : ""}
          </span>
        </div>
      ))}
      <span
        data-edit-id={`secorder.${sectionKey}`}
        data-edit-default={naturalOrder}
        data-edit-value={order.join(",")}
        data-edit-dirty={dirty ? "1" : undefined}
        hidden
      />
      <span
        data-edit-id={`sechide.${sectionKey}`}
        data-edit-default=""
        data-edit-value={[...hidden].sort().join(",")}
        data-edit-dirty={dirty ? "1" : undefined}
        hidden
      />
    </div>
  );
}
