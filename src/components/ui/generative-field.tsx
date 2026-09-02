"use client";

import { useEffect, useRef } from "react";

/**
 * Real-time generative backdrops for /preview, in the register of the TD work
 * the site is about: agent systems, diffusion, feedback, interference.
 *
 * Every mode runs on a small offscreen buffer and is scaled up by CSS. That is
 * the whole performance story: physarum and reaction-diffusion touch every
 * cell every frame, so at viewport resolution they would be hopeless in JS,
 * while at a few hundred pixels across they are cheap and the upscale reads as
 * softness rather than as pixels. Colour is pulled from the palette variables,
 * so a scheme change recolours the simulation.
 */
type Mode =
  | "flow"
  | "physarum"
  | "dla"
  | "reaction"
  | "feedback"
  | "moire"
  | "contour";

/** Sim resolution per mode: how many cells each can afford per frame. */
const RES: Record<Mode, number> = {
  flow: 520,
  physarum: 480,
  dla: 420,
  reaction: 260, // heaviest per cell, so the smallest grid
  feedback: 480,
  moire: 520,
  contour: 300,
};

export function GenerativeField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const cv: HTMLCanvasElement = canvas;
    const c2d = cv.getContext("2d", { willReadFrequently: true });
    if (!c2d) return;
    const ctx: CanvasRenderingContext2D = c2d;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let mode: Mode = "flow";
    let W = 0, H = 0;
    let img: ImageData | null = null;
    let buf: Uint32Array | null = null;

    // Simulation state, allocated per mode on (re)start.
    let agents: Float32Array | null = null;   // physarum: x, y, heading
    let trail: Float32Array | null = null;    // physarum / dla deposit map
    let next: Float32Array | null = null;     // physarum blur target
    let gu: Float32Array | null = null;       // reaction: chemical U
    let gv: Float32Array | null = null;       // reaction: chemical V
    let walkers: Float32Array | null = null;  // dla: free particles
    let parts: Float32Array | null = null;    // flow: x, y
    let t = 0;

    const palette = () => {
      const cs = getComputedStyle(document.documentElement);
      const rgb = (cs.getPropertyValue("--pt").trim() || "0,0,0")
        .split(",")
        .map((v) => parseInt(v.trim(), 10) || 0);
      const bgHex = (cs.getPropertyValue("--bg").trim() || "#ffffff").replace("#", "");
      const acHex = (cs.getPropertyValue("--accent").trim() || "#0000ee").replace("#", "");
      const hex = (h: string, i: number) =>
        parseInt(h.length === 3 ? h[i].repeat(2) : h.slice(i * 2, i * 2 + 2), 16) || 0;
      return {
        ink: [rgb[0], rgb[1], rgb[2]] as [number, number, number],
        bg: [hex(bgHex, 0), hex(bgHex, 1), hex(bgHex, 2)] as [number, number, number],
        accent: [hex(acHex, 0), hex(acHex, 1), hex(acHex, 2)] as [number, number, number],
      };
    };
    let col = palette();

    /** Pack a 0..1 intensity into a pixel: background to ink, accent on top. */
    const shade = (v: number, accent = 0) => {
      const k = v < 0 ? 0 : v > 1 ? 1 : v;
      const a = accent < 0 ? 0 : accent > 1 ? 1 : accent;
      const r = col.bg[0] + (col.ink[0] - col.bg[0]) * k + (col.accent[0] - col.bg[0]) * a;
      const g = col.bg[1] + (col.ink[1] - col.bg[1]) * k + (col.accent[1] - col.bg[1]) * a;
      const b = col.bg[2] + (col.ink[2] - col.bg[2]) * k + (col.accent[2] - col.bg[2]) * a;
      return (
        (255 << 24) |
        ((b < 0 ? 0 : b > 255 ? 255 : b) << 16) |
        ((g < 0 ? 0 : g > 255 ? 255 : g) << 8) |
        (r < 0 ? 0 : r > 255 ? 255 : r)
      );
    };

    const rnd = () => Math.random();

    function start() {
      const long = RES[mode];
      const ar = window.innerHeight / Math.max(1, window.innerWidth);
      W = long;
      H = Math.max(1, Math.round(long * ar));
      cv.width = W;
      cv.height = H;
      img = ctx.createImageData(W, H);
      buf = new Uint32Array(img.data.buffer);
      const N = W * H;
      t = 0;
      agents = trail = next = gu = gv = walkers = parts = null;

      if (mode === "physarum") {
        const count = Math.min(24000, Math.round(N * 0.12));
        agents = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          agents[i * 3] = rnd() * W;
          agents[i * 3 + 1] = rnd() * H;
          agents[i * 3 + 2] = rnd() * Math.PI * 2;
        }
        trail = new Float32Array(N);
        next = new Float32Array(N);
      } else if (mode === "reaction") {
        gu = new Float32Array(N).fill(1);
        gv = new Float32Array(N);
        // A few seeded blots; the pattern grows out of them.
        for (let s = 0; s < 12; s++) {
          const cx = (rnd() * 0.8 + 0.1) * W, cy = (rnd() * 0.8 + 0.1) * H;
          for (let y = -4; y <= 4; y++)
            for (let x = -4; x <= 4; x++) {
              const px = ((cx + x) | 0), py = ((cy + y) | 0);
              if (px > 0 && py > 0 && px < W && py < H) gv[py * W + px] = 1;
            }
        }
      } else if (mode === "dla") {
        trail = new Float32Array(N);
        // Seed: a line along the bottom, so growth reads as something rising.
        for (let x = 0; x < W; x++) trail[(H - 1) * W + x] = 1;
        const count = 1400;
        walkers = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
          walkers[i * 2] = rnd() * W;
          walkers[i * 2 + 1] = rnd() * H * 0.6;
        }
      } else if (mode === "flow") {
        const count = 9000;
        parts = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
          parts[i * 2] = rnd() * W;
          parts[i * 2 + 1] = rnd() * H;
        }
        trail = new Float32Array(N);
      } else if (mode === "feedback") {
        trail = new Float32Array(N);
      }
    }

    // --- the simulations ----------------------------------------------------

    /** Physarum: agents sense three points ahead, steer toward the strongest
     *  trail, deposit behind them. The lattice is emergent, not authored. */
    function stepPhysarum() {
      const a = agents!, tr = trail!, nx = next!;
      const SA = 0.5, RA = 0.42, SO = 7, SS = 1.1;
      for (let i = 0; i < a.length; i += 3) {
        const x = a[i], y = a[i + 1], h = a[i + 2];
        const sample = (ang: number) => {
          const sx = ((x + Math.cos(ang) * SO) | 0 + W) % W;
          const sy = ((y + Math.sin(ang) * SO) | 0 + H) % H;
          return tr[(sy < 0 ? 0 : sy) * W + (sx < 0 ? 0 : sx)] || 0;
        };
        const f = sample(h), l = sample(h - SA), r = sample(h + SA);
        let nh = h;
        if (f < l && f < r) nh += (rnd() - 0.5) * RA * 2;
        else if (l > r) nh -= RA;
        else if (r > l) nh += RA;
        let nxp = x + Math.cos(nh) * SS, nyp = y + Math.sin(nh) * SS;
        if (nxp < 0) nxp += W; else if (nxp >= W) nxp -= W;
        if (nyp < 0) nyp += H; else if (nyp >= H) nyp -= H;
        a[i] = nxp; a[i + 1] = nyp; a[i + 2] = nh;
        tr[(nyp | 0) * W + (nxp | 0)] += 0.55;
      }
      // Diffuse and decay: a 3-tap blur each axis is enough at this size.
      for (let y = 0; y < H; y++) {
        const row = y * W;
        for (let x = 0; x < W; x++) {
          const l = tr[row + (x === 0 ? W - 1 : x - 1)];
          const c = tr[row + x];
          const r = tr[row + (x === W - 1 ? 0 : x + 1)];
          nx[row + x] = (l + c + r) / 3;
        }
      }
      for (let x = 0; x < W; x++)
        for (let y = 0; y < H; y++) {
          const u = nx[(y === 0 ? H - 1 : y - 1) * W + x];
          const c = nx[y * W + x];
          const d = nx[(y === H - 1 ? 0 : y + 1) * W + x];
          tr[y * W + x] = ((u + c + d) / 3) * 0.96;
        }
      for (let i = 0; i < buf!.length; i++) buf![i] = shade(tr[i] * 0.85);
    }

    /** Gray-Scott reaction-diffusion: two chemicals, one feeding the other. */
    function stepReaction() {
      const u = gu!, v = gv!;
      const DU = 0.16, DV = 0.08, F = 0.036, K = 0.062;
      const u2 = new Float32Array(u.length), v2 = new Float32Array(v.length);
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          const lu =
            u[i - 1] + u[i + 1] + u[i - W] + u[i + W] - 4 * u[i];
          const lv =
            v[i - 1] + v[i + 1] + v[i - W] + v[i + W] - 4 * v[i];
          const uvv = u[i] * v[i] * v[i];
          u2[i] = u[i] + DU * lu - uvv + F * (1 - u[i]);
          v2[i] = v[i] + DV * lv + uvv - (K + F) * v[i];
        }
      }
      gu = u2; gv = v2;
      for (let i = 0; i < buf!.length; i++) buf![i] = shade(v2[i] * 3.2);
    }

    /** DLA: walkers drift until they touch the aggregate, then freeze. */
    function stepDla() {
      const tr = trail!, w = walkers!;
      for (let k = 0; k < 6; k++) {
        for (let i = 0; i < w.length; i += 2) {
          let x = w[i], y = w[i + 1];
          x += (rnd() - 0.5) * 2.4;
          y += (rnd() - 0.5) * 2.4 + 0.45; // slight downward bias
          if (x < 1) x = 1; else if (x > W - 2) x = W - 2;
          if (y < 1) y = 1;
          if (y > H - 2) y = H - 2;
          const idx = (y | 0) * W + (x | 0);
          const touching =
            tr[idx + 1] > 0 || tr[idx - 1] > 0 || tr[idx + W] > 0 || tr[idx - W] > 0;
          if (touching) {
            tr[idx] = 1;
            w[i] = rnd() * W;
            w[i + 1] = rnd() * H * 0.35;
          } else {
            w[i] = x; w[i + 1] = y;
          }
        }
      }
      for (let i = 0; i < buf!.length; i++) buf![i] = shade(tr[i]);
      for (let i = 0; i < w.length; i += 2)
        buf![(w[i + 1] | 0) * W + (w[i] | 0)] = shade(0.15, 0.35);
    }

    /** Flow field: particles advected through a curl-ish noise field, leaving
     *  trails that decay. The closest of these to a plotter drawing. */
    function stepFlow() {
      const p = parts!, tr = trail!;
      for (let i = 0; i < tr.length; i++) tr[i] *= 0.975;
      const f = 0.008;
      for (let i = 0; i < p.length; i += 2) {
        const x = p[i], y = p[i + 1];
        const ang =
          Math.sin(y * f + t * 0.0016) * 2.2 +
          Math.cos(x * f * 0.8 - t * 0.0011) * 2.2;
        let nx2 = x + Math.cos(ang) * 1.4;
        let ny2 = y + Math.sin(ang) * 1.4;
        if (nx2 < 0) nx2 += W; else if (nx2 >= W) nx2 -= W;
        if (ny2 < 0) ny2 += H; else if (ny2 >= H) ny2 -= H;
        p[i] = nx2; p[i + 1] = ny2;
        tr[(ny2 | 0) * W + (nx2 | 0)] = 1;
      }
      for (let i = 0; i < buf!.length; i++) buf![i] = shade(tr[i] * 0.9);
    }

    /** Feedback: the frame resampled through a slow zoom and rotation, with a
     *  travelling source. The oldest trick in the TD book. */
    function stepFeedback() {
      const tr = trail!;
      const cx = W / 2, cy = H / 2;
      const zoom = 1.016, rot = 0.006;
      const cosr = Math.cos(rot), sinr = Math.sin(rot);
      const src = new Float32Array(tr);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const dx = (x - cx) / zoom, dy = (y - cy) / zoom;
          const sx = (cx + dx * cosr - dy * sinr) | 0;
          const sy = (cy + dx * sinr + dy * cosr) | 0;
          tr[y * W + x] =
            sx >= 0 && sy >= 0 && sx < W && sy < H ? src[sy * W + sx] * 0.982 : 0;
        }
      }
      const bx = cx + Math.cos(t * 0.011) * W * 0.26;
      const by = cy + Math.sin(t * 0.017) * H * 0.26;
      for (let y = -3; y <= 3; y++)
        for (let x = -3; x <= 3; x++) {
          const px = (bx + x) | 0, py = (by + y) | 0;
          if (px > 0 && py > 0 && px < W && py < H) tr[py * W + px] = 1;
        }
      for (let i = 0; i < buf!.length; i++) buf![i] = shade(tr[i]);
    }

    /** Moire: two rotating radial gratings beating against each other. */
    function stepMoire() {
      const cx1 = W * 0.42, cy1 = H * 0.45;
      const cx2 = W * 0.58 + Math.sin(t * 0.004) * W * 0.06;
      const cy2 = H * 0.55 + Math.cos(t * 0.005) * H * 0.06;
      const k = 0.42;
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const d1 = Math.hypot(x - cx1, y - cy1);
          const d2 = Math.hypot(x - cx2, y - cy2);
          const v = (Math.sin(d1 * k) * Math.sin(d2 * k) + 1) / 2;
          buf![y * W + x] = shade(v > 0.72 ? (v - 0.72) * 3.4 : 0);
        }
    }

    /** Contour: domain-warped fbm sliced into isobands, which is what the
     *  homepage hero used to be before the scan replaced it. */
    function stepContour() {
      const n = (x: number, y: number) =>
        Math.sin(x * 1.7 + Math.cos(y * 1.3)) * Math.cos(y * 1.1 - Math.sin(x * 0.9));
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const u = x / W * 3, v = y / H * 3;
          const wx = u + n(u * 0.7, v * 0.7) * 0.6 + t * 0.0009;
          const wy = v + n(u * 0.9 + 3.1, v * 0.9) * 0.6;
          let f = n(wx, wy) * 0.6 + n(wx * 2.1, wy * 2.1) * 0.3;
          f = (f + 1) / 2;
          const bands = 14;
          const band = Math.abs((f * bands) % 1 - 0.5);
          buf![y * W + x] = shade(band < 0.08 ? 1 - band / 0.08 : 0);
        }
    }

    const STEP: Record<Mode, () => void> = {
      flow: stepFlow,
      physarum: stepPhysarum,
      dla: stepDla,
      reaction: stepReaction,
      feedback: stepFeedback,
      moire: stepMoire,
      contour: stepContour,
    };

    const readMode = () => {
      const raw = document.documentElement.dataset.backdrop ?? "";
      const m = raw.startsWith("gen-") ? (raw.slice(4) as Mode) : null;
      if (m && m !== mode && STEP[m]) {
        mode = m;
        start();
      }
      return !!m;
    };

    let active = false;
    const sync = () => {
      col = palette();
      const was = mode;
      active = readMode();
      if (active && was === mode && !buf) start();
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-backdrop", "data-scheme", "data-theme"],
    });
    const onResize = () => {
      if (active) start();
    };
    window.addEventListener("resize", onResize);

    // Seed from the current attribute, then run.
    mode = "flow";
    start();
    sync();

    const draw = () => {
      if (active && buf && img) {
        if (!reduced) t++;
        STEP[mode]();
        ctx.putImageData(img, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="genfield" aria-hidden />;
}
