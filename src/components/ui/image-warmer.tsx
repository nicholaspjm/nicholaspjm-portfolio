"use client";

import { useEffect } from "react";

/**
 * Warms the page's lazy images into cache so they are already there by the
 * time you scroll to them.
 *
 * `loading="lazy"` only begins fetching once an image is nearly in view, and
 * on a quick scroll you outrun it: the row is laid out correctly, because the
 * dimensions reserve the space, but the picture arrives a beat late. The whole
 * homepage is under two megabytes across thirty-odd files, so there is no
 * reason not to have fetched them during the idle time after first paint.
 *
 * This changes nothing about the markup. It requests the same URLs separately,
 * the browser caches them, and the real lazy load is then served from cache
 * instantly. If any of it fails the page behaves exactly as it did before.
 */
export function ImageWarmer({ limit = 96 }: { limit?: number }) {
  useEffect(() => {
    // Never spend someone's metered or slow connection on images they may
    // never scroll to.
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return;

    let cancelled = false;
    const timers: number[] = [];

    const warm = () => {
      if (cancelled) return;
      const imgs = [...document.querySelectorAll<HTMLImageElement>("img[loading='lazy']")]
        .map((el) => el.currentSrc || el.src);
      // Video posters as well. The clips themselves are far too large to
      // prefetch (the homepage alone references 49, and the library is 205MB),
      // but their posters are what actually gets painted, and those are small.
      const postersOnPage = [...document.querySelectorAll<HTMLVideoElement>("video[poster]")]
        .map((el) => el.poster);
      const urls = [...imgs, ...postersOnPage].filter(Boolean).slice(0, limit);

      // A few at a time, in document order, so the ones just below the fold
      // land first and the fetches never crowd out anything the page still
      // needs. Each finished request pulls the next off the queue.
      let next = 0;
      const pump = () => {
        if (cancelled || next >= urls.length) return;
        const url = urls[next++];
        const img = new Image();
        img.decoding = "async";
        img.onload = img.onerror = pump;
        img.src = url;
      };
      for (let i = 0; i < 4; i++) pump();
    };

    // After first paint, and only once the browser is otherwise idle.
    const start = () => {
      const ric = (
        window as Window & {
          requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
        }
      ).requestIdleCallback;
      if (ric) ric(warm, { timeout: 2500 });
      else timers.push(window.setTimeout(warm, 900));
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      window.removeEventListener("load", start);
    };
  }, [limit]);

  return null;
}
