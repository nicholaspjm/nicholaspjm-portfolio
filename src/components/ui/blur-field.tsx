"use client";

/**
 * Soft-focus backdrop: a few oversized radial blobs under a heavy Gaussian
 * blur, drifting slowly. An alternative to the point cloud on /preview.
 *
 * The blobs are plain elements tinted from the palette variables, so a scheme
 * change recolours the backdrop for free. Only transform is animated, so the
 * whole thing stays on the compositor and never repaints — a blur this large
 * would be ruinous to re-rasterise every frame.
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
