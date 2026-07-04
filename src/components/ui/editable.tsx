"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { editableText } from "@/content/editable-text";
import {
  isEditorEnabled,
  getEditMode,
  subscribe,
} from "@/lib/edit-store";

type Tag = "p" | "span" | "div";

/**
 * A piece of prose that can be edited in place while the dev-only editor is in
 * edit mode. Reads its text from editable-text.json (keyed by `id`); in edit
 * mode it becomes contentEditable and is tagged with data-edit-id so <EditBar>
 * can collect it on save. In production it renders as plain text.
 */
export function Editable({
  id,
  as = "span",
  className,
  style,
}: {
  id: string;
  as?: Tag;
  className?: string;
  style?: CSSProperties;
}) {
  const editMode = useSyncExternalStore(subscribe, getEditMode, () => false);
  const value = editableText[id] ?? "";
  const Tag = as;

  if (!isEditorEnabled || !editMode) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      className={className ? `${className} editable-on` : "editable-on"}
      style={style}
      data-edit-id={id}
      contentEditable
      suppressContentEditableWarning
    >
      {value}
    </Tag>
  );
}
