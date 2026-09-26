/**
 * Runs the physarum backdrop off the page's main thread. The component
 * transfers its canvas here once ("init") and then posts plain settings
 * ("update") whenever the palette, viewport or /preview controls change.
 */
import { createField, type FieldSettings } from "./generative-field-sim";

type Message =
  | { type: "init"; canvas: OffscreenCanvas }
  | { type: "update"; settings: FieldSettings };

// requestAnimationFrame exists in dedicated workers wherever OffscreenCanvas
// does in practice, but fall back to a 60Hz timer rather than trust that.
const schedule =
  typeof self.requestAnimationFrame === "function"
    ? {
        request: (cb: () => void) => self.requestAnimationFrame(cb),
        cancel: (id: number) => self.cancelAnimationFrame(id),
      }
    : {
        request: (cb: () => void) => self.setTimeout(cb, 1000 / 60),
        cancel: (id: number) => self.clearTimeout(id),
      };

let field: ReturnType<typeof createField> = null;

self.onmessage = (e: MessageEvent<Message>) => {
  const msg = e.data;
  if (msg.type === "init") field = createField(msg.canvas, schedule);
  else field?.update(msg.settings);
};

// Tell the page this worker is actually running. A worker that fails to
// start can do so silently, and the page falls back if this never arrives.
// (Cast because the project's DOM typings give `self` Window's two-argument
// postMessage; a worker's takes one.)
(self as unknown as { postMessage(m: unknown): void }).postMessage({ type: "ready" });
