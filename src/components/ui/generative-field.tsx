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
  /** Ring radius as a fraction of the smaller viewport edge. Every preset
   *  here is a variation on the same circular release, which is what gives
   *  them all the soft-circle character. */
  ringRadius: number;
  /** How much the radius varies between agents; 0 is a hairline ring. */
  ringSpread: number;
  /** Launch along the ring (true) or straight out from the centre (false). */
  tangential: boolean;
};

const PRESETS: Record<string, Preset> = {
  // Wide, sparse ring. Steps further and turns harder than it did, so the
  // ring splits within seconds instead of a minute.
  halo: {
    density: 0.05, sensorAngle: 0.6, rotate: 0.52, sensorDist: 15, step: 2.3,
    deposit: 0.858, decay: 0.974, jitter: 0.0, bias: 0.0,
    ringRadius: 0.4, ringSpread: 0.03, tangential: true,
  },
  // Launched outward rather than along the ring: rays, not a rim. Slowed
  // to roughly half the step it had, with a longer memory to match.
  corona: {
    density: 0.06, sensorAngle: 0.48, rotate: 0.34, sensorDist: 14, step: 1.05,
    deposit: 0.385, decay: 0.986, jitter: 0.01, bias: 0.0,
    ringRadius: 0.22, ringSpread: 0.04, tangential: false,
  },
  // The sparsest and most persistent. Almost nothing, drawn slowly.
  wisp: {
    density: 0.03, sensorAngle: 0.62, rotate: 0.46, sensorDist: 17, step: 2.0,
    deposit: 0.66, decay: 0.988, jitter: 0.0, bias: 0.0,
    ringRadius: 0.34, ringSpread: 0.1, tangential: true,
  },
  // A little noise in the steering, so the circle never quite closes.
  drift: {
    density: 0.06, sensorAngle: 0.55, rotate: 0.42, sensorDist: 12, step: 1.5,
    deposit: 0.55, decay: 0.98, jitter: 0.06, bias: 0.0,
    ringRadius: 0.36, ringSpread: 0.12, tangential: true,
  },
  // Widest and faintest: a ring at the edge of the frame.
  aura: {
    density: 0.045, sensorAngle: 0.66, rotate: 0.3, sensorDist: 18, step: 1.9,
    deposit: 0.55, decay: 0.985, jitter: 0.0, bias: 0.006,
    ringRadius: 0.44, ringSpread: 0.02, tangential: true,
  },
};




/**
 * Backdrop colour. `lo` is where faint trails sit and `hi` where the strongest
 * paths land, so a pair gives a duotone ramp rather than one colour fading to
 * the page. `null` follows the palette's own --pt, which is what the rest of
 * the site uses.
 */
const TINTS: Record<string, { lo: [number, number, number] | null; hi: [number, number, number] | null }> = {
  // Follows the palette's own --pt, like the rest of the site.
  ink: { lo: null, hi: null },
  // Grey at full strength, closest to the live point cloud.
  graphite: { lo: [210, 210, 210], hi: [43, 43, 43] },
  // The site's own highlighter yellow.
  yellow: { lo: [255, 244, 184], hi: [255, 224, 0] },
  // The site's own link blue.
  blue: { lo: [206, 215, 245], hi: [0, 0, 238] },
};



/**
 * Texture. These act on the rendered field, never on the simulation, so the
 * network underneath is identical and only its surface changes.
 *  blur  extra separable passes, which soften the strands
 *  glow  a heavily blurred copy added back, so bright paths bleed light
 *  grain a little static, which stops large soft areas looking like a gradient
 */
/**
 * The surface treatment, applied always. This was a row of options; mist was
 * the one worth keeping, so it is simply how the field is rendered now.
 * Acts on the render and never on the simulation.
 */
const TEXTURE = { blur: 5, glow: 0, grain: 0, gamma: 0.85 };


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
    // Default must name a preset that exists. This previously said "network",
    // left behind when the presets were replaced, so cfg was undefined and
    // start() threw on cfg.density — which took the whole page down, not just
    // the backdrop. The fallbacks below make an unknown key impossible to
    // crash on again, whether it comes from a stale localStorage value or a
    // future rename.
    const DEFAULT = "halo";
    let name = DEFAULT;
    let cfg = PRESETS[DEFAULT];
    let W = 0, H = 0;
    let img: ImageData | null = null;
    let buf: Uint32Array | null = null;
    // Display normalisation. Trail values are unbounded and settle at a
    // different level for every preset, while shade() clamps at 1 — so a
    // fixed mapping saturated the whole map to flat ink and read as noise,
    // whatever the simulation was actually doing. Tracking the frame maximum
    // and exposing against it keeps contrast right for any parameters.
    let norm = 1;
    // --- settle detection --------------------------------------------------
    // These networks reach an arrangement they will not leave, and then the
    // page is showing a still image. Rather than watch for that by eye, sample
    // a scattering of cells every so often and compare with the previous
    // sample; once successive samples stop differing, the pattern has locked
    // and the preset restarts from its ring.
    const PROBE_CELLS = 1500;
    const PROBE_EVERY = 45; // frames between samples
    const STILL_ENOUGH = 0.015; // relative change below which nothing is moving
    const STILL_REPEATS = 3; // consecutive quiet samples before restarting
    let probe = new Float32Array(0);
    let sinceProbe = 0;
    let stillCount = 0;
    let needsRestart = false;

    let speed = 1;
    let lastReset = "";
    let tint = TINTS.ink;
    let disp = new Float32Array(0);
    let dtmp = new Float32Array(0);
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
      // With a tint the ramp runs bg -> lo -> hi, so faint trails carry their
      // own colour instead of just fading out.
      const lo = tint.lo ?? col.bg;
      const hi = tint.hi ?? col.ink;
      const a = k < 0.5 ? k * 2 : 1;
      const b2 = k < 0.5 ? 0 : (k - 0.5) * 2;
      const mix = (i: number) => {
        const base = col.bg[i] + (lo[i] - col.bg[i]) * a;
        return base + (hi[i] - base) * b2;
      };
      const r = mix(0) | 0, g = mix(1) | 0, b = mix(2) | 0;
      return (255 << 24) | (b << 16) | (g << 8) | r;
    };

    function start() {
      if (!cfg) cfg = PRESETS[DEFAULT];
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
      disp = new Float32Array(N);
      dtmp = new Float32Array(N);
      probe = new Float32Array(PROBE_CELLS + 8);
      sinceProbe = 0;
      stillCount = 0;
      needsRestart = false;
      norm = 1;

      const count = Math.min(26000, Math.max(600, Math.round(N * cfg.density)));
      agents = new Float32Array(count * 3);
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * cfg.ringRadius;
      const spread = Math.min(W, H) * cfg.ringSpread;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = R + (Math.random() - 0.5) * 2 * spread;
        agents[i * 3] = cx + Math.cos(a) * r;
        agents[i * 3 + 1] = cy + Math.sin(a) * r;
        // Tangential launch keeps the ring reading as a circle; radial throws
        // the strands outward into rays instead.
        agents[i * 3 + 2] = cfg.tangential
          ? a + Math.PI / 2 + (Math.random() < 0.5 ? Math.PI : 0)
          : a;
      }
    }

    function step(render: boolean) {
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
      // Sample on the rendered frame only, so a fast-forward does not trip the
      // detector simply by taking more steps between checks.
      if (render && ++sinceProbe >= PROBE_EVERY) {
        sinceProbe = 0;
        const stride = Math.max(1, (tr.length / PROBE_CELLS) | 0);
        let diff = 0, mag = 0, k = 0;
        for (let i = 0; i < tr.length && k < probe.length; i += stride, k++) {
          diff += Math.abs(tr[i] - probe[k]);
          mag += tr[i];
          probe[k] = tr[i];
        }
        // Relative, so it does not depend on how much ink a preset carries.
        const moved = mag > 1e-6 ? diff / mag : 1;
        stillCount = moved < STILL_ENOUGH ? stillCount + 1 : 0;
        // Restart from draw() rather than here: start() reallocates the very
        // arrays this function is reading.
        if (stillCount >= STILL_REPEATS) needsRestart = true;
      }
      if (!render) return;
      // Expose against the MEAN, not the maximum. Where agents happen to pile
      // up, a single cell can sit eight times above the network paths
      // themselves, so a max-based white point put the paths at a fifth of
      // the range and the whole map read as flat haze whatever the simulation
      // was doing. Measured: mean 1.6, p90 4.1, max 32.9. A white point at
      // ~3.2x mean lands just above p90, so paths render solid and the
      // background between them stays clear.
      // Sample on the rendered frame only, so a fast-forward does not trip the
      // detector simply by taking more steps between checks.
      if (render && ++sinceProbe >= PROBE_EVERY) {
        sinceProbe = 0;
        const stride = Math.max(1, (tr.length / PROBE_CELLS) | 0);
        let diff = 0, mag = 0, k = 0;
        for (let i = 0; i < tr.length && k < probe.length; i += stride, k++) {
          diff += Math.abs(tr[i] - probe[k]);
          mag += tr[i];
          probe[k] = tr[i];
        }
        // Relative, so it does not depend on how much ink a preset carries.
        const moved = mag > 1e-6 ? diff / mag : 1;
        stillCount = moved < STILL_ENOUGH ? stillCount + 1 : 0;
        // Restart from draw() rather than here: start() reallocates the very
        // arrays this function is reading.
        if (stillCount >= STILL_REPEATS) needsRestart = true;
      }
      if (!render) return;
      // Expose against the MEAN, not the maximum. Where agents pile up a single
      // cell can sit eight times above the network paths themselves (measured:
      // mean 1.6, p90 4.1, max 32.9), so a max-based white point put the real
      // structure at a fifth of the range and the map read as flat haze
      // whatever the simulation was doing. ~3.2x mean lands just above p90.
      let sum = 0;
      for (let i = 0; i < tr.length; i++) sum += tr[i];
      norm += (sum / tr.length - norm) * 0.06;
      const inv = 1 / Math.max(norm * 3.2, 1e-3);
      const n = tr.length;
      for (let i = 0; i < n; i++) disp[i] = tr[i] * inv;

      // --- texture: acts on the rendered field, never on the simulation ----
      for (let pss = 0; pss < TEXTURE.blur; pss++) {
        for (let y = 0; y < H; y++) {
          const row = y * W;
          for (let x = 0; x < W; x++) {
            dtmp[row + x] =
              (disp[row + (x === 0 ? W - 1 : x - 1)] +
                disp[row + x] +
                disp[row + (x === W - 1 ? 0 : x + 1)]) / 3;
          }
        }
        for (let x = 0; x < W; x++) {
          for (let y = 0; y < H; y++) {
            disp[y * W + x] =
              (dtmp[(y === 0 ? H - 1 : y - 1) * W + x] +
                dtmp[y * W + x] +
                dtmp[(y === H - 1 ? 0 : y + 1) * W + x]) / 3;
          }
        }
      }
      if (TEXTURE.glow > 0) {
        // A heavily blurred copy added back, so the strongest paths bleed.
        dtmp.set(disp);
        for (let pss = 0; pss < 4; pss++) {
          for (let y = 0; y < H; y++) {
            const row = y * W;
            for (let x = 0; x < W; x++) {
              scratch[row + x] =
                (dtmp[row + (x === 0 ? W - 1 : x - 1)] +
                  dtmp[row + x] +
                  dtmp[row + (x === W - 1 ? 0 : x + 1)]) / 3;
            }
          }
          for (let x = 0; x < W; x++) {
            for (let y = 0; y < H; y++) {
              dtmp[y * W + x] =
                (scratch[(y === 0 ? H - 1 : y - 1) * W + x] +
                  scratch[y * W + x] +
                  scratch[(y === H - 1 ? 0 : y + 1) * W + x]) / 3;
            }
          }
        }
        const g = TEXTURE.glow;
        for (let i = 0; i < n; i++) disp[i] += dtmp[i] * g;
      }
      const gm = TEXTURE.gamma;
      const gr = TEXTURE.grain;
      for (let i = 0; i < n; i++) {
        let v = disp[i];
        if (gm !== 1) v = Math.pow(v < 0 ? 0 : v, gm);
        if (gr > 0) {
          // Cheap hash noise, deterministic per cell so it does not crawl.
          const h = Math.sin((i % W) * 12.9898 + ((i / W) | 0) * 78.233) * 43758.5453;
          v += (h - Math.floor(h) - 0.5) * gr;
        }
        buf![i] = shade(v);
      }
    }

    const sync = () => {
      col = palette();
      const de = document.documentElement.dataset;
      tint = TINTS[de.tint ?? "ink"] ?? TINTS.ink;
      // Steps per displayed frame. Nothing about the simulation changes; it
      // simply advances further between paints, so a slow preset reaches the
      // state worth judging in seconds rather than a minute.
      const sp = Number(de.speed);
      speed = Number.isFinite(sp) && sp >= 1 ? Math.min(16, Math.round(sp)) : 1;
      const raw = document.documentElement.dataset.backdrop ?? "";
      const next = raw.startsWith("gen-") ? raw.slice(4) : null;
      active = !!next && !!PRESETS[next];
      if (active && next && next !== name) {
        name = next;
        cfg = PRESETS[next] ?? PRESETS[DEFAULT];
        start();
        lastReset = de.reset ?? "";
        return;
      }
      // Reset is a changing token rather than a flag, so pressing it twice in
      // a row still restarts.
      const rs = de.reset ?? "";
      if (rs !== lastReset) {
        lastReset = rs;
        if (active) start();
      }
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-backdrop",
        "data-scheme",
        "data-theme",
        "data-tint",
        "data-speed",
        "data-reset",
      ],
    });
    const onResize = () => { if (active) start(); };
    window.addEventListener("resize", onResize);

    start();
    sync();

    const draw = () => {
      if (active && buf && img && !reduced) {
        // Advance `speed` times, but only build the picture on the last one.
        for (let i = 0; i < speed; i++) step(i === speed - 1);
        ctx.putImageData(img, 0, 0);
        if (needsRestart) start();
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
