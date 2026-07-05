"use client";

import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";

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

    // render at the device pixel ratio (capped for perf) so the scan stays
    // crisp on high-DPI / mobile screens instead of being upscaled from a
    // CSS-resolution canvas. Each point is drawn as a dpr-sized block below so
    // the dot reads at a consistent ~1 CSS-pixel size and stays solid, not grey.
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Every point is a single device pixel — the finest possible grain, so the
    // dots stay as tiny crisp rectangles on high-DPI / fractional-ratio screens
    // instead of thickening into larger blocks.
    const dot = 1;
    let img: ImageData | null = null;
    let buf: Uint32Array | null = null;
    const resize = () => {
      // re-read each resize so the correct device pixel ratio is used even if
      // the component mounted on a different screen / before rotation
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    let impulse = 0; // kick from page interactions

    const onMove = (e: MouseEvent) => {
      targetParX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      targetParY = (e.clientY / window.innerHeight - 0.5) * 0.38;
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
      // premultiplied ABGR words for the pixel buffer (little-endian)
      const a = Math.round(alpha * 255);
      const hex = (cs.getPropertyValue("--accent").trim() || "#00ff00")
        .replace("#", "");
      const ar = parseInt(hex.slice(0, 2), 16) || 0;
      const ag = parseInt(hex.slice(2, 4), 16) || 255;
      const ab = parseInt(hex.slice(4, 6), 16) || 0;
      return {
        px:
          (a << 24) | ((rgb[2] & 0xff) << 16) | ((rgb[1] & 0xff) << 8) | (rgb[0] & 0xff),
        accent: (230 << 24) | ((ab & 0xff) << 16) | ((ag & 0xff) << 8) | (ar & 0xff),
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

    let bornAt = 0; // set when points arrive — drives the assembly animation

    fetch(asset("/data/scan.bin"))
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (disposed) return;
        pts = new Float32Array(buf);
        bornAt = performance.now();
        raf = requestAnimationFrame(draw);
      })
      .catch(() => {});

    const draw = (now: number = performance.now()) => {
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
      const time = now * 0.001;

      // assembly: points fly in from scatter over the first ~1.8s
      const rawP = reduced ? 1 : Math.min(1, (now - bornAt) / 1800);
      const ease = 1 - (1 - rawP) ** 3;
      const settle = 1 - ease; // 1 → 0 as the cloud resolves

      if (!reduced) rotY += 0.0012 + impulse * 0.02;
      impulse *= 0.94;
      const scrollT = window.scrollY * 0.0011; // scrolling visibly spins it

      parX += (targetParX - parX) * 0.05;
      parY += (targetParY - parY) * 0.05;

      const ry = rotY + parX;
      const rx = rotX + parY + scrollT;

      const cy = Math.cos(ry), sy = Math.sin(ry);
      const cx = Math.cos(rx), sx = Math.sin(rx);

      // dead-centre and large — sized to the longest viewport edge so the
      // scan reads as an immersive room you're standing inside of; points
      // that fall past the edges are simply clipped
      const scale = Math.max(w, h) * 1.9 * (1 + impulse * 0.05);
      const cxp = w * 0.5;
      const cyp = h * 0.5;
      const fov = 2.2;
      const word = themeCol.px;
      const accentWord = themeCol.accent;

      // scan sweep: a plane travels through the room every ~6.5s;
      // points it touches flash in the accent colour
      const scanX = ((time * 0.37) % 2.6) - 1.3;

      buf.fill(0);

      const n = pts.length;
      for (let i = 0; i < n; i += 3) {
        let x0 = pts[i], y0 = pts[i + 1], z0 = pts[i + 2];
        // shimmer — a slow wave rolls through the scan like live sensor noise
        if (!reduced) {
          y0 += Math.sin(time * 1.3 + x0 * 5 + i * 0.11) * 0.008;
        }
        // assembly scatter — deterministic per point, collapses to zero
        if (settle > 0.001) {
          const s1 = Math.sin(i * 127.1) * 43758.5453;
          const s2 = Math.sin(i * 311.7) * 24634.6345;
          x0 += (s1 - Math.floor(s1) - 0.5) * 2.6 * settle;
          y0 += (s2 - Math.floor(s2) - 0.5) * 2.6 * settle;
        }
        const inScan = Math.abs(x0 - scanX) < 0.02;
        // rotate Y then X
        const x1 = x0 * cy + z0 * sy;
        const z1 = -x0 * sy + z0 * cy;
        const y1 = y0 * cx - z1 * sx;
        const z2 = y0 * sx + z1 * cx;
        const pz = fov / (fov + z2);
        const px = cxp + x1 * scale * pz * 0.5;
        const py = cyp + y1 * scale * pz * 0.5;
        const ix = px | 0;
        const iy = py | 0;
        if (ix < 0 || iy < 0 || ix > w - dot || iy > h - dot) continue;
        const wpx = inScan && !reduced ? accentWord : word;
        // a dpr-sized block keeps the dot ~1 CSS pixel and crisp on any screen
        for (let dy = 0; dy < dot; dy++) {
          const row = (iy + dy) * w + ix;
          for (let dx = 0; dx < dot; dx++) buf[row + dx] = wpx;
        }
      }

      ctx.putImageData(img, 0, 0);

      // the loop always runs: interaction-driven motion (parallax, repel,
      // scroll tilt) is user-initiated and exempt from reduced-motion;
      // ambient motion (spin, shimmer, scan, fly-in) is gated on `reduced`.
      raf = requestAnimationFrame(draw);
    };

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
