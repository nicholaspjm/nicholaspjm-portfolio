"use client";

import { useEffect, useRef } from "react";

/**
 * Soft-focus backdrop for /preview: oversized blobs under a heavy Gaussian
 * blur. Interactive rather than merely animated — the field answers the
 * pointer, the scroll position, and the same preview event the point cloud
 * listens for.
 *
 * Everything is published as CSS custom properties on the container and read
 * by the blobs in their transforms, so a move costs one style write per frame
 * instead of four, and the blobs stay on the compositor. Only transform and
 * opacity ever change: re-rasterising a 110px blur per frame would not hold
 * a frame rate anywhere, least of all on a phone.
 */
export function BlurField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Target values, and the eased values actually written. The gap between
    // them is the whole feel: the field lags the cursor rather than snapping.
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let tScroll = 0, cScroll = 0;
    let pulse = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      tScroll = max > 0 ? window.scrollY / max : 0;
    };
    // Hovering an entry anywhere on the page kicks the field, the same signal
    // the point cloud uses.
    const onPreview = () => {
      pulse = Math.min(1, pulse + 0.6);
    };

    const frame = () => {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      cScroll += (tScroll - cScroll) * 0.08;
      pulse *= 0.94;
      el.style.setProperty("--bf-x", cx.toFixed(4));
      el.style.setProperty("--bf-y", cy.toFixed(4));
      el.style.setProperty("--bf-s", cScroll.toFixed(4));
      el.style.setProperty("--bf-p", pulse.toFixed(4));
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("npjm:preview", onPreview);
    onScroll();
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("npjm:preview", onPreview);
    };
  }, []);

  return (
    <div className="blurfield" ref={ref} aria-hidden>
      <span className="bf bf-1" />
      <span className="bf bf-2" />
      <span className="bf bf-3" />
      <span className="bf bf-4" />
    </div>
  );
}
