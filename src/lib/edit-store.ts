/**
 * Tiny cross-tree store for the dev-only content editor's "edit mode" flag.
 * Shared between <EditBar> (the toggle/save control) and every <Editable>
 * region via useSyncExternalStore. No effect in production builds.
 */
export const isEditorEnabled = process.env.NODE_ENV === "development";

let editMode = false;
const listeners = new Set<() => void>();

export function getEditMode(): boolean {
  return editMode;
}

export function setEditMode(v: boolean): void {
  if (v !== editMode) {
    editMode = v;
    listeners.forEach((l) => l());
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
