"use client";

import { useEffect, useRef } from "react";

/**
 * ASCII flow field — pure 2D canvas, no WebGL. A grid of glyphs, each chosen
 * by sampling a flow field at that cell. Cursor warps the field. Big nod to
 * 90s shell aesthetics; reads like a print job from a noisy fax machine.
 */
export function AsciiFlowExperiment() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: 0.5, y: 0.5 };
    let t0 = performance.now();

    const ramp = " .,:;ilxoXVYUO0#@".split("");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
    };
    canvas.addEventListener("pointermove", onMove);

    const root = getComputedStyle(document.documentElement);
    const ink = root.getPropertyValue("--color-ink").trim() || "#131313";
    const link = root.getPropertyValue("--color-link").trim() || "#1c39ff";
    const paper = root.getPropertyValue("--color-paper").trim() || "#f4f1e8";

    const draw = () => {
      const t = (performance.now() - t0) * 0.0008;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, w, h);

      const cell = 12 * dpr;
      ctx.font = `${Math.floor(cell * 0.95)}px ui-monospace, JetBrains Mono, Consolas, monospace`;
      ctx.textBaseline = "top";

      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      const mx = mouse.x;
      const my = mouse.y;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const u = i / cols - 0.5;
          const v = j / rows - 0.5;
          const dx = u - (mx - 0.5);
          const dy = v - (my - 0.5);
          const r = Math.hypot(dx, dy);
          const f =
            Math.sin((u * 6 + t) + Math.cos(v * 4 - t * 0.7)) +
            Math.cos((v * 5 - t * 0.5) + Math.sin(u * 3 + t)) +
            0.6 / (r + 0.18);
          const n = (Math.sin(f) + 1) * 0.5;
          const k = Math.min(ramp.length - 1, Math.floor(n * ramp.length));
          // Hot near cursor — ink gradient toward link blue
          ctx.fillStyle = r < 0.16 ? link : ink;
          ctx.fillText(ramp[k], i * cell, j * cell);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="block h-full w-full"
      aria-label="ASCII flow field"
    />
  );
}
