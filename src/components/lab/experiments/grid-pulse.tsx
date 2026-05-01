"use client";

import { useEffect, useRef } from "react";

/**
 * Grid Pulse — 2D canvas grid of small circles, each scaling/pulsing in
 * response to the cursor's distance, with a slow waveform travelling across
 * the grid. Reads like a print test pattern.
 */
export function GridPulseExperiment() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: 0.5, y: 0.5 };
    let t0 = performance.now();
    let raf = 0;

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
      const t = (performance.now() - t0) * 0.001;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, w, h);

      const cell = 28 * dpr;
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      const ox = (w - cols * cell) / 2 + cell / 2;
      const oy = (h - rows * cell) / 2 + cell / 2;
      const mx = mouse.x * w;
      const my = mouse.y * h;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const cx = ox + i * cell;
          const cy = oy + j * cell;
          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.hypot(dx, dy);
          const wave = Math.sin(dist * 0.012 - t * 2.5);
          const k = (wave + 1) * 0.5;
          const r = (cell * 0.42) * (0.15 + 0.85 * k);
          ctx.fillStyle = dist < cell * 2.4 ? link : ink;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
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

  return <canvas ref={ref} className="block h-full w-full" />;
}
