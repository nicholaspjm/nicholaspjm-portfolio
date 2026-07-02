"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient point-cloud background — a real room scan (decimated to ~35k pts,
 * /public/data/scan.bin as raw Float32 xyz triplets). Drawn faint behind the
 * page; slow auto-rotation + mouse parallax + scroll-driven tilt.
 * Colour follows the active theme via the --pt / --pt-alpha CSS vars.
 */
export function PointCloud() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let disposed = false;
    let pts: Float32Array | null = null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let img: ImageData | null = null;
    let buf: Uint32Array | null = null;
    const resize = () => {
      const w = Math.max(1, Math.floor(window.innerWidth * dpr));
      const h = Math.max(1, Math.floor(window.innerHeight * dpr));
      if (canvas.width === w && canvas.height === h && img) return;
      canvas.width = w;
      canvas.height = h;
      img = ctx.createImageData(w, h);
      buf = new Uint32Array(img.data.buffer);
    };
    resize();
    window.addEventListener("resize", resize);
    // hidden tabs report 0×0 — re-measure when the tab becomes visible
    document.addEventListener("visibilitychange", resize);

    let rotY = 0.6;
    let rotX = -0.4;
    let targetParX = 0;
    let targetParY = 0;
    let parX = 0;
    let parY = 0;
    let mx = -9999;
    let my = -9999;
    let impulse = 0; // kick from page interactions

    const onMove = (e: MouseEvent) => {
      targetParX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      targetParY = (e.clientY / window.innerHeight - 0.5) * 0.38;
      mx = e.clientX * dpr;
      my = e.clientY * dpr;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    // the cloud kicks whenever a new entry is previewed anywhere on the page
    const onPreview = () => {
      impulse = Math.min(1.6, impulse + 0.9);
    };
    window.addEventListener("npjm:preview", onPreview);

    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      const rgb = (cs.getPropertyValue("--pt").trim() || "17, 17, 17")
        .split(",")
        .map((v) => parseInt(v.trim(), 10) || 0);
      const alpha = parseFloat(cs.getPropertyValue("--pt-alpha")) || 0.15;
      // premultiplied ABGR word for the pixel buffer (little-endian)
      const a = Math.round(alpha * 255);
      return {
        px:
          (a << 24) | ((rgb[2] & 0xff) << 16) | ((rgb[1] & 0xff) << 8) | (rgb[0] & 0xff),
      };
    };
    let themeCol = readTheme();
    const mo = new MutationObserver(() => {
      themeCol = readTheme();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    fetch("/data/scan.bin")
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (disposed) return;
        pts = new Float32Array(buf);
        raf = requestAnimationFrame(draw);
      })
      .catch(() => {});

    const draw = () => {
      if (!pts) return;
      // QA hook: freeze all canvas work when window.__NPJM_PAUSE is set
      if ((window as unknown as Record<string, unknown>).__NPJM_PAUSE) {
        raf = requestAnimationFrame(draw);
        return;
      }
      resize(); // no-op unless dimensions changed
      if (!img || !buf) return;
      const w = canvas.width;
      const h = canvas.height;

      if (!reduced) rotY += 0.0008 + impulse * 0.02;
      impulse *= 0.94;
      const scrollT = window.scrollY * 0.0011; // scrolling visibly spins it

      parX += (targetParX - parX) * 0.05;
      parY += (targetParY - parY) * 0.05;

      const ry = rotY + parX;
      const rx = rotX + parY + scrollT;

      const cy = Math.cos(ry), sy = Math.sin(ry);
      const cx = Math.cos(rx), sx = Math.sin(rx);

      // centre the cloud in the region right of the text column, and size
      // it to that region so it never drifts off-screen on wide displays
      const colEdge = Math.min(w * 0.5, 620 * dpr);
      const regionW = w - colEdge;
      const scale =
        Math.min(regionW * 0.85, h * 0.95) * (1 + impulse * 0.05);
      const cxp = colEdge + regionW * 0.5;
      const cyp = h * 0.48;
      const fov = 2.2;
      const repelR = 175 * dpr;
      const repelR2 = repelR * repelR;
      const word = themeCol.px;

      buf.fill(0);

      const n = pts.length;
      for (let i = 0; i < n; i += 3) {
        const x0 = pts[i], y0 = pts[i + 1], z0 = pts[i + 2];
        // rotate Y then X
        const x1 = x0 * cy + z0 * sy;
        const z1 = -x0 * sy + z0 * cy;
        const y1 = y0 * cx - z1 * sx;
        const z2 = y0 * sx + z1 * cx;
        const pz = fov / (fov + z2);
        let px = cxp + x1 * scale * pz * 0.5;
        let py = cyp + y1 * scale * pz * 0.5;
        // cursor repulsion — the scan flinches away from the pointer
        const dx = px - mx;
        const dy = py - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < repelR2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = ((repelR - d) / repelR) * 52 * dpr;
          px += (dx / d) * f;
          py += (dy / d) * f;
        }
        const ix = px | 0;
        const iy = py | 0;
        if (ix < 0 || ix >= w - 1 || iy < 0 || iy >= h - 1) continue;
        const o = iy * w + ix;
        buf[o] = word;
        if (pz > 1) {
          // near points draw 2×2
          buf[o + 1] = word;
          buf[o + w] = word;
          buf[o + w + 1] = word;
        }
      }

      ctx.putImageData(img, 0, 0);

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    // reduced motion: draw a single static frame once loaded
    if (reduced) {
      const tryStatic = setInterval(() => {
        if (pts) {
          draw();
          clearInterval(tryStatic);
        }
      }, 200);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("npjm:preview", onPreview);
      mo.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="ptcloud" aria-hidden />;
}
