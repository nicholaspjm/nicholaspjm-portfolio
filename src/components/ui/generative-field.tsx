"use client";

import { useEffect, useRef } from "react";

/**
 * Physarum backdrops for /preview.
 *
 * All of these are the same simulation: thousands of agents that sense three
 * points ahead, steer toward the strongest trail, deposit behind themselves,
 * and let the map blur and decay. Nothing about the pattern is drawn; the
 * networks are what the feedback loop settles into. The presets below only
 * change how the agents sense and move, and that is enough to take it from a
 * fine mesh to a few thick channels to something that will not settle at all.
 *
 * It runs on a small offscreen buffer scaled up by CSS. That is the whole
 * performance story: every agent and every cell is touched each frame, so at
 * viewport resolution this would be hopeless in JS, while at a few hundred
 * pixels across it is cheap and the upscale reads as softness. Colour comes
 * from the palette variables, so a scheme change recolours the simulation.
 */
type Preset = {
  /** Agents as a fraction of cells. Density is the loudest control here. */
  density: number;
  /** Sensor half-angle: how wide apart the two side sensors sit. */
  sensorAngle: number;
  /** How hard an agent turns toward the side that smells strongest. */
  rotate: number;
  /** How far ahead it senses. Small reads texture, large reads structure. */
  sensorDist: number;
  /** Distance travelled per frame. */
  step: number;
  /** Trail left behind per step. Tuned against decay rather than chosen: the
   *  steady-state ink is roughly density * deposit / (1 - decay), so a preset
   *  that holds trails longer has to deposit proportionally less or the whole
   *  map saturates to a flat field. Every preset here lands near the same
   *  level as "network". */
  deposit: number;
  /** Trail retained per frame; the closer to 1, the longer paths persist. */
  decay: number;
  /** Random steer added every frame, in radians. */
  jitter: number;
  /** Constant turn added every frame, which curls the whole field. */
  bias: number;
  /** Where agents begin, which decides the large-scale shape. */
  spawn: "scatter" | "centre" | "ring" | "edge";
};

const PRESETS: Record<string, Preset> = {
  // The canonical parameters: an even mesh that keeps reorganising.
  network: {
    density: 0.12, sensorAngle: 0.5, rotate: 0.42, sensorDist: 7, step: 1.1,
    deposit: 0.55, decay: 0.96, jitter: 0.0, bias: 0.0, spawn: "scatter",
  },
  // Short senses and short steps: fine capillaries rather than roads.
  lattice: {
    density: 0.2, sensorAngle: 0.42, rotate: 0.55, sensorDist: 3.2, step: 0.7,
    deposit: 0.412, decay: 0.95, jitter: 0.02, bias: 0.0, spawn: "scatter",
  },
  // Sensing a long way ahead makes agents commit to existing paths, so the
  // mesh consolidates into a few wide channels.
  rivers: {
    density: 0.12, sensorAngle: 0.62, rotate: 0.28, sensorDist: 18, step: 1.6,
    deposit: 0.413, decay: 0.97, jitter: 0.0, bias: 0.0, spawn: "scatter",
  },
  // A constant turn on every agent; the network winds instead of branching.
  spiral: {
    density: 0.13, sensorAngle: 0.5, rotate: 0.4, sensorDist: 8, step: 1.2,
    deposit: 0.444, decay: 0.965, jitter: 0.0, bias: 0.03, spawn: "centre",
  },
  // Released from one point with narrow sensors, so growth reads outward.
  radial: {
    density: 0.14, sensorAngle: 0.3, rotate: 0.25, sensorDist: 10, step: 1.35,
    deposit: 0.412, decay: 0.965, jitter: 0.01, bias: 0.0, spawn: "centre",
  },
  // Sparse and persistent: single strands survive instead of a mesh.
  filament: {
    density: 0.07, sensorAngle: 0.55, rotate: 0.5, sensorDist: 12, step: 1.6,
    deposit: 0.589, decay: 0.975, jitter: 0.0, bias: 0.0, spawn: "ring",
  },
  // Enough random steer that trails never quite consolidate.
  turbulent: {
    density: 0.16, sensorAngle: 0.72, rotate: 0.62, sensorDist: 6, step: 1.3,
    deposit: 0.567, decay: 0.945, jitter: 0.25, bias: 0.0, spawn: "scatter",
  },
  // Wide sensors and a hard turn, with no noise: angular, almost drawn.
  crystal: {
    density: 0.11, sensorAngle: 1.0, rotate: 0.95, sensorDist: 9, step: 1.15,
    deposit: 0.525, decay: 0.965, jitter: 0.0, bias: 0.0, spawn: "edge",
  },
  // Growing in from the frame rather than out from the middle.
  bloom: {
    density: 0.12, sensorAngle: 0.46, rotate: 0.36, sensorDist: 10, step: 1.25,
    deposit: 0.413, decay: 0.97, jitter: 0.005, bias: -0.02, spawn: "edge",
  },
};


const RES = 460; // long edge of the simulation grid

export function GenerativeField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const cv: HTMLCanvasElement = canvas;
    const c2d = cv.getContext("2d");
    if (!c2d) return;
    const ctx: CanvasRenderingContext2D = c2d;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let name = "network";
    let cfg = PRESETS.network;
    let W = 0, H = 0;
    let img: ImageData | null = null;
    let buf: Uint32Array | null = null;
    // Display normalisation. Trail values are unbounded and settle at a
    // different level for every preset, while shade() clamps at 1 — so a
    // fixed mapping saturated the whole map to flat ink and read as noise,
    // whatever the simulation was actually doing. Tracking the frame maximum
    // and exposing against it keeps contrast right for any parameters.
    let norm = 1;
    let agents = new Float32Array(0);
    let trail = new Float32Array(0);
    let scratch = new Float32Array(0);
    let active = false;

    const palette = () => {
      const cs = getComputedStyle(document.documentElement);
      const pt = (cs.getPropertyValue("--pt").trim() || "0,0,0")
        .split(",").map((v) => parseInt(v.trim(), 10) || 0);
      const bg = (cs.getPropertyValue("--bg").trim() || "#ffffff").replace("#", "");
      const h = (s: string, i: number) =>
        parseInt(s.length === 3 ? s[i].repeat(2) : s.slice(i * 2, i * 2 + 2), 16) || 0;
      return { ink: pt, bg: [h(bg, 0), h(bg, 1), h(bg, 2)] };
    };
    let col = palette();

    const shade = (v: number) => {
      const k = v < 0 ? 0 : v > 1 ? 1 : v;
      const r = col.bg[0] + (col.ink[0] - col.bg[0]) * k;
      const g = col.bg[1] + (col.ink[1] - col.bg[1]) * k;
      const b = col.bg[2] + (col.ink[2] - col.bg[2]) * k;
      return (255 << 24) | (b << 16) | (g << 8) | r;
    };

    function start() {
      const ar = window.innerHeight / Math.max(1, window.innerWidth);
      W = RES;
      H = Math.max(1, Math.round(RES * ar));
      cv.width = W;
      cv.height = H;
      img = ctx.createImageData(W, H);
      buf = new Uint32Array(img.data.buffer);
      const N = W * H;
      trail = new Float32Array(N);
      scratch = new Float32Array(N);
      norm = 1;

      const count = Math.min(26000, Math.max(600, Math.round(N * cfg.density)));
      agents = new Float32Array(count * 3);
      const cx = W / 2, cy = H / 2;
      for (let i = 0; i < count; i++) {
        let x: number, y: number, a: number;
        if (cfg.spawn === "centre") {
          a = Math.random() * Math.PI * 2;
          const r = Math.random() * Math.min(W, H) * 0.06;
          x = cx + Math.cos(a) * r; y = cy + Math.sin(a) * r;
        } else if (cfg.spawn === "ring") {
          a = Math.random() * Math.PI * 2;
          const r = Math.min(W, H) * (0.28 + Math.random() * 0.06);
          x = cx + Math.cos(a) * r; y = cy + Math.sin(a) * r;
          a += Math.PI / 2;
        } else if (cfg.spawn === "edge") {
          if (Math.random() < 0.5) { x = Math.random() * W; y = Math.random() < 0.5 ? 2 : H - 2; }
          else { y = Math.random() * H; x = Math.random() < 0.5 ? 2 : W - 2; }
          a = Math.atan2(cy - y, cx - x);
        } else {
          x = Math.random() * W; y = Math.random() * H; a = Math.random() * Math.PI * 2;
        }
        agents[i * 3] = x; agents[i * 3 + 1] = y; agents[i * 3 + 2] = a;
      }
    }

    function step() {
      const a = agents, tr = trail, nx = scratch;
      const { sensorAngle: SA, rotate: RA, sensorDist: SO, step: SS } = cfg;
      const sense = (x: number, y: number, ang: number) => {
        let sx = (x + Math.cos(ang) * SO) | 0;
        let sy = (y + Math.sin(ang) * SO) | 0;
        sx = ((sx % W) + W) % W;
        sy = ((sy % H) + H) % H;
        return tr[sy * W + sx];
      };
      for (let i = 0; i < a.length; i += 3) {
        const x = a[i], y = a[i + 1];
        let h = a[i + 2];
        const f = sense(x, y, h), l = sense(x, y, h - SA), r = sense(x, y, h + SA);
        if (f < l && f < r) h += (Math.random() - 0.5) * RA * 2;
        else if (l > r) h -= RA;
        else if (r > l) h += RA;
        if (cfg.jitter) h += (Math.random() - 0.5) * cfg.jitter;
        h += cfg.bias;
        let px = x + Math.cos(h) * SS, py = y + Math.sin(h) * SS;
        if (px < 0) px += W; else if (px >= W) px -= W;
        if (py < 0) py += H; else if (py >= H) py -= H;
        a[i] = px; a[i + 1] = py; a[i + 2] = h;
        tr[(py | 0) * W + (px | 0)] += cfg.deposit;
      }
      // Separable 3-tap blur, then decay. Diffusion is what turns individual
      // paths into a shared map the agents can all read.
      for (let y = 0; y < H; y++) {
        const row = y * W;
        for (let x = 0; x < W; x++) {
          nx[row + x] =
            (tr[row + (x === 0 ? W - 1 : x - 1)] +
              tr[row + x] +
              tr[row + (x === W - 1 ? 0 : x + 1)]) / 3;
        }
      }
      const d = cfg.decay;
      for (let x = 0; x < W; x++) {
        for (let y = 0; y < H; y++) {
          const v =
            (nx[(y === 0 ? H - 1 : y - 1) * W + x] +
              nx[y * W + x] +
              nx[(y === H - 1 ? 0 : y + 1) * W + x]) / 3;
          tr[y * W + x] = v * d;
        }
      }
      // Expose against the MEAN, not the maximum. Where agents happen to pile
      // up, a single cell can sit eight times above the network paths
      // themselves, so a max-based white point put the paths at a fifth of
      // the range and the whole map read as flat haze whatever the simulation
      // was doing. Measured: mean 1.6, p90 4.1, max 32.9. A white point at
      // ~3.2x mean lands just above p90, so paths render solid and the
      // background between them stays clear.
      let sum = 0;
      for (let i = 0; i < tr.length; i++) sum += tr[i];
      norm += (sum / tr.length - norm) * 0.06;
      const inv = 1 / Math.max(norm * 3.2, 1e-3);
      for (let i = 0; i < buf!.length; i++) buf![i] = shade(tr[i] * inv);
    }

    const sync = () => {
      col = palette();
      const raw = document.documentElement.dataset.backdrop ?? "";
      const next = raw.startsWith("gen-") ? raw.slice(4) : null;
      active = !!next && !!PRESETS[next];
      if (active && next && next !== name) {
        name = next;
        cfg = PRESETS[next];
        start();
      }
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-backdrop", "data-scheme", "data-theme"],
    });
    const onResize = () => { if (active) start(); };
    window.addEventListener("resize", onResize);

    start();
    sync();

    const draw = () => {
      if (active && buf && img && !reduced) {
        step();
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
