"use client";

import { useRef, useSyncExternalStore, type CSSProperties } from "react";
import { editableText } from "@/content/editable-text";
import { isEditorEnabled, getEditMode, subscribe } from "@/lib/edit-store";

type Tag = "p" | "span" | "div" | "h1" | "h2" | "li";

/**
 * A piece of text that can be edited in place while the dev-only editor is on.
 * The default text is passed as children (the source of truth in code); an
 * override, if any, is read from editable-text.json by `id`. In edit mode the
 * element becomes contentEditable and carries data-edit-id / data-edit-default;
 * typing marks it data-edit-dirty, and <EditBar> saves ONLY dirty regions, so
 * untouched copies of a region can never overwrite an edit. While edit mode is
 * on the rendered text is frozen, so the refresh that follows a save can't
 * clobber in-progress typing. In production it renders plain text.
 */
export function Editable({
  id,
  as = "span",
  className,
  style,
  children,
}: {
  id: string;
  as?: Tag;
  className?: string;
  style?: CSSProperties;
  children: string;
}) {
  const editMode = useSyncExternalStore(subscribe, getEditMode, () => false);
  const value = editableText[id] ?? children;
  const frozen = useRef(value);
  if (!editMode) frozen.current = value;
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
      data-edit-default={children}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) =>
        (e.currentTarget as HTMLElement).setAttribute("data-edit-dirty", "1")
      }
    >
      {frozen.current}
    </Tag>
  );
}
