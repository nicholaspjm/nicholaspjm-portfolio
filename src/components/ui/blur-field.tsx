"use client";

/**
 * Soft-focus backdrop for /preview: oversized blobs under a heavy Gaussian
 * blur, drifting on long offset CSS animations.
 *
 * Deliberately inert. It used to answer the pointer and the scroll position,
 * which on a phone meant the backdrop lurched every time the page moved under
 * a thumb, since scrolling is continuous there in a way it never is with a
 * mouse. Nothing here listens for input now; the drift is pure CSS, so it also
 * costs nothing per frame.
 */
export function BlurField() {
  return (
    <div className="blurfield" aria-hidden>
      <span className="bf bf-1" />
      <span className="bf bf-2" />
      <span className="bf bf-3" />
      <span className="bf bf-4" />
    </div>
  );
}
