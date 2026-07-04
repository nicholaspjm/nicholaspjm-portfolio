import data from "./editable-text.json";

/**
 * Editable prose, keyed by a stable id. Values are edited in place via the
 * local content editor (dev only) and written back to editable-text.json by
 * the studio server (`npm run studio`), which commits and pushes them to live.
 *
 * To make a new piece of text editable: add a key here (in the JSON) and
 * render it with <Editable id="that.key" />.
 */
export const editableText: Record<string, string> = data;
