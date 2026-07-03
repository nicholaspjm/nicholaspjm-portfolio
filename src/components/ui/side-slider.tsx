"use client";

import { useEffect, useRef } from "react";

/**
 * Vertical histogram rail — a live minimap of the document's structure.
 * Every bar marks a real element (titles, entries, rules); bars breathe
 * with a slow sine and read darker inside the viewport. Functional:
 * hover to read what's at that point, click to jump there, drag to scrub.
 */
export function SideSlider() {
  const ref = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const tip = tipRef.current;
    if (!canvas || !tip) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let dragging = false;
    let hoverIdx = -1;
    let marks: { y: number; kind: number; phase: number; label: string }[] =
      [];
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
      const found: typeof marks = [];
      document
        .querySelectorAll<HTMLElement>(".extra, [data-prev], hr, .noise")
        .forEach((el, i) => {
          const y = el.getBoundingClientRect().top + window.scrollY;
          const kind = el.classList.contains("extra")
            ? 2
            : el.matches("hr, .noise")
              ? 0
              : 1;
          const label =
            kind === 0
              ? ""
              : (el.textContent ?? "")
                  .trim()
                  .replace(/\s+/g, " ")
                  .slice(0, 44);
          found.push({ y, kind, phase: i * 0.7, label });
        });
      marks = found;
    };

    const ink = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ink")
        .trim() || "#000";
    const accent = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#00ff00";

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

      for (let i = 0; i < marks.length; i++) {
        const m = marks[i];
        const y = Math.floor((m.y / docH) * h);
        // slow smooth breathing, per-bar phase — movement without jumpiness
        const breathe = 1 + Math.sin(time * 0.6 + m.phase) * 0.14;
        const base =
          m.kind === 2 ? w - 2 * dpr : m.kind === 1 ? w * 0.55 : w * 0.3;
        const len = Math.max(2, base * breathe);
        const inView = y >= vTop && y <= vBot;
        if (i === hoverIdx) {
          ctx.fillStyle = accent();
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = col;
          ctx.globalAlpha =
            (m.kind === 2 ? 0.62 : m.kind === 1 ? 0.4 : 0.22) +
            (inView ? 0.3 : 0);
        }
        ctx.fillRect(w - len, y, len, Math.max(1, 1 * dpr));
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    /* interactions ------------------------------------------------------- */
    const maxScroll = () =>
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const railPct = (clientY: number) => {
      const r = canvas.getBoundingClientRect();
      return Math.min(1, Math.max(0, (clientY - r.top) / Math.max(1, r.height)));
    };

    const nearestMark = (clientY: number, radius = 9) => {
      const r = canvas.getBoundingClientRect();
      const yCanvas = ((clientY - r.top) / Math.max(1, r.height)) * canvas.height;
      let best = -1;
      let bestD = radius * dpr;
      for (let i = 0; i < marks.length; i++) {
        const my = (marks[i].y / docH) * canvas.height;
        const d = Math.abs(my - yCanvas);
        if (d < bestD && marks[i].label) {
          bestD = d;
          best = i;
        }
      }
      return best;
    };

    const scrub = (clientY: number) => {
      window.scrollTo({ top: railPct(clientY) * maxScroll() });
    };

    const down = (e: PointerEvent) => {
      dragging = true;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic pointers can't be captured */
      }
      // magnetic: land exactly on a nearby entry, else proportional
      const snap = nearestMark(e.clientY);
      if (snap >= 0) {
        window.scrollTo({ top: Math.max(0, marks[snap].y - 90) });
      } else {
        scrub(e.clientY);
      }
    };

    let lastJump = -1;
    const move = (e: PointerEvent) => {
      if (dragging) {
        scrub(e.clientY);
        tip.style.display = "none";
        return;
      }
      hoverIdx = nearestMark(e.clientY, 22); // generous — hover should bite
      if (hoverIdx >= 0) {
        const m = marks[hoverIdx];
        tip.textContent = `${Math.round((m.y / docH) * 100)}% · ${m.label}`;
        // hover-scrub: gliding over a bar takes the page straight there
        if (hoverIdx !== lastJump) {
          lastJump = hoverIdx;
          window.scrollTo({
            top: Math.max(0, m.y - 90),
            behavior: "smooth",
          });
        }
      } else {
        tip.textContent = `${Math.round(railPct(e.clientY) * 100)}% · drag to scrub`;
      }
      tip.style.display = "block";
      tip.style.top = `${e.clientY}px`;
    };

    const up = () => {
      dragging = false;
    };
    const leave = () => {
      hoverIdx = -1;
      lastJump = -1;
      tip.style.display = "none";
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);

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
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", remeasure);
      document.removeEventListener("visibilitychange", remeasure);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="side-slider" aria-hidden />
      <div ref={tipRef} className="rail-tip" aria-hidden />
    </>
  );
}
