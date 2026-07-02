"use client";

import { useEffect, useRef } from "react";

/**
 * Vertical histogram rail — a passive minimap of the document's structure.
 * Every bar marks a real element in the page flow (titles, entries, rules);
 * bars breathe with a slow smooth sine, and the ones inside the current
 * viewport read darker. Not a scrollbar: no thumb, no interaction.
 */
export function SideSlider() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let marks: { y: number; kind: number; phase: number }[] = [];
    let docH = 1;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const measure = () => {
      resize();
      docH = Math.max(1, document.documentElement.scrollHeight);
      const found: { y: number; kind: number; phase: number }[] = [];
      document
        .querySelectorAll<HTMLElement>(".extra, [data-prev], hr, .noise")
        .forEach((el, i) => {
          const y = el.getBoundingClientRect().top + window.scrollY;
          const kind = el.classList.contains("extra")
            ? 2
            : el.matches("hr, .noise")
              ? 0
              : 1;
          found.push({ y, kind, phase: i * 0.7 });
        });
      marks = found;
    };

    const ink = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ink")
        .trim() || "#000";

    const draw = (t: number) => {
      if ((window as unknown as Record<string, unknown>).__NPJM_PAUSE) {
        raf = requestAnimationFrame(draw);
        return;
      }
      resize();
      const w = canvas.width;
      const h = canvas.height;
      const time = t * 0.001;
      ctx.clearRect(0, 0, w, h);

      const col = ink();
      ctx.fillStyle = col;

      // inner-edge hairline
      ctx.globalAlpha = 0.25;
      ctx.fillRect(0, 0, 1, h);

      // viewport window in rail space
      const vTop = (window.scrollY / docH) * h;
      const vBot = ((window.scrollY + window.innerHeight) / docH) * h;

      for (const m of marks) {
        const y = Math.floor((m.y / docH) * h);
        // slow smooth breathing, per-bar phase — movement without jumpiness
        const breathe = 1 + Math.sin(time * 0.6 + m.phase) * 0.14;
        const base =
          m.kind === 2 ? w - 2 * dpr : m.kind === 1 ? w * 0.55 : w * 0.3;
        const len = Math.max(2, base * breathe);
        const inView = y >= vTop && y <= vBot;
        ctx.globalAlpha =
          (m.kind === 2 ? 0.62 : m.kind === 1 ? 0.4 : 0.22) +
          (inView ? 0.3 : 0);
        ctx.fillRect(w - len, y, len, Math.max(1, 1 * dpr));
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    const remeasure = () => {
      measure();
    };
    window.addEventListener("resize", remeasure);
    document.addEventListener("visibilitychange", remeasure);

    // measure now, and again once images/fonts have settled the layout
    measure();
    const t1 = setTimeout(remeasure, 600);
    const t2 = setTimeout(remeasure, 2000);
    raf = requestAnimationFrame(draw);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", remeasure);
      document.removeEventListener("visibilitychange", remeasure);
    };
  }, []);

  return <canvas ref={ref} className="side-slider" aria-hidden />;
}
