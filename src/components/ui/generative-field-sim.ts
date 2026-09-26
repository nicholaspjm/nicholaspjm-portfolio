/**
 * Physarum backdrops: the simulation itself, with no DOM in it.
 *
 * All of these are the same simulation: thousands of agents that sense three
 * points ahead, steer toward the strongest trail, deposit behind themselves,
 * and let the map blur and decay. Nothing about the pattern is drawn; the
 * networks are what the feedback loop settles into. The presets below only
 * change how the agents sense and move, and that is enough to take it from a
 * fine mesh to a few thick channels to something that will not settle at all.
 *
 * It runs on a small offscreen buffer scaled up by CSS. Every agent and every
 * cell is touched each frame, so at viewport resolution this would be hopeless
 * in JS, while at a few hundred pixels across it is cheap and the upscale reads
 * as softness. Colour comes from the palette variables, so a scheme change
 * recolours the simulation.
 *
 * Cheap is relative, though: on a throttled phone each frame was still a long
 * task, and on the main thread that froze the page for most of its first
 * load. So this module takes any canvas, and generative-field.tsx hands it an
 * OffscreenCanvas inside a worker (generative-field.worker.ts), keeping the
 * page thread free for scrolling and taps. The DOM-dependent parts — reading
 * the palette, the viewport, the /preview controls — stay in the component and
 * arrive here as plain settings.
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
  /** Steps per displayed frame this preset wants. These settle at very
   *  different rates: aura needs 16x to reach its structure in reasonable
   *  time, while corona and wisp are worth watching arrive at 1x. The speed
   *  control on /preview overrides it; "auto" hands it back. */
  speed: number;
};

export const PRESETS: Record<string, Preset> = {
  // Wide, sparse ring that splits as it turns. Runs at 2x, which is where the
  // split happens soon enough to watch.
  halo: {
    density: 0.05, sensorAngle: 0.6, rotate: 0.52, sensorDist: 15, step: 2.3,
    deposit: 0.858, decay: 0.974, jitter: 0.0, bias: 0.0,
    ringRadius: 0.4, ringSpread: 0.03, tangential: true,
    speed: 2,
  },
  // Launched outward rather than along the ring: rays, not a rim. Deliberately
  // slow, so 1x.
  corona: {
    density: 0.06, sensorAngle: 0.48, rotate: 0.34, sensorDist: 14, step: 1.05,
    deposit: 0.385, decay: 0.986, jitter: 0.01, bias: 0.0,
    ringRadius: 0.22, ringSpread: 0.04, tangential: false,
    speed: 1,
  },
  // The sparsest and most persistent. Almost nothing, drawn slowly, and worth
  // leaving at 1x for it.
  wisp: {
    density: 0.03, sensorAngle: 0.62, rotate: 0.46, sensorDist: 17, step: 2.0,
    deposit: 0.66, decay: 0.988, jitter: 0.0, bias: 0.0,
    ringRadius: 0.34, ringSpread: 0.1, tangential: true,
    speed: 1,
  },
  // A little noise in the steering, so the circle never quite closes.
  drift: {
    density: 0.06, sensorAngle: 0.55, rotate: 0.42, sensorDist: 12, step: 1.5,
    deposit: 0.55, decay: 0.98, jitter: 0.06, bias: 0.0,
    ringRadius: 0.36, ringSpread: 0.12, tangential: true,
    speed: 2,
  },
  // Widest and faintest: a ring at the edge of the frame. Its structure takes a
  // long time to arrive, hence 16x.
  aura: {
    density: 0.045, sensorAngle: 0.66, rotate: 0.3, sensorDist: 18, step: 1.9,
    deposit: 0.55, decay: 0.985, jitter: 0.0, bias: 0.006,
    ringRadius: 0.44, ringSpread: 0.02, tangential: true,
    speed: 16,
  },
  // A wide band rather than a line: the ring is given real thickness, so it
  // reads as a curtain drawn across the frame.
  veil: {
    density: 0.03, sensorAngle: 0.7, rotate: 0.26, sensorDist: 20, step: 1.7,
    deposit: 0.715, decay: 0.987, jitter: 0.0, bias: 0.004,
    ringRadius: 0.46, ringSpread: 0.16, tangential: true,
    speed: 8,
  },
  // Short senses and a hard turn, so the strands interlace instead of running
  // parallel. The densest of the set.
  lace: {
    density: 0.11, sensorAngle: 0.4, rotate: 0.62, sensorDist: 6, step: 1.0,
    deposit: 0.42, decay: 0.972, jitter: 0.0, bias: 0.0,
    ringRadius: 0.3, ringSpread: 0.07, tangential: true,
    speed: 2,
  },
  // Very few agents taking very long steps, held almost indefinitely, so each
  // one draws a single long trail.
  comet: {
    density: 0.022, sensorAngle: 0.58, rotate: 0.34, sensorDist: 16, step: 2.4,
    deposit: 0.675, decay: 0.991, jitter: 0.0, bias: 0.01,
    ringRadius: 0.38, ringSpread: 0.04, tangential: true,
    speed: 4,
  },
  // Spread so wide it fills a disc rather than tracing a ring, then finds its
  // own structure inside it.
  nebula: {
    density: 0.05, sensorAngle: 0.64, rotate: 0.36, sensorDist: 14, step: 1.6,
    deposit: 0.528, decay: 0.984, jitter: 0.02, bias: 0.0,
    ringRadius: 0.24, ringSpread: 0.3, tangential: true,
    speed: 1,
  },
};

/** Default must name a preset that exists. This previously said "network",
 *  left behind when the presets were replaced, so cfg was undefined and
 *  start() threw on cfg.density — which took the whole page down, not just
 *  the backdrop. The fallbacks below make an unknown key impossible to crash
 *  on again, whether it comes from a stale localStorage value or a future
 *  rename. */
export const DEFAULT_PRESET = "halo";

/**
 * Backdrop colour. `lo` is where faint trails sit and `hi` where the strongest
 * paths land, so a pair gives a duotone ramp rather than one colour fading to
 * the page. `null` follows the palette's own --pt, which is what the rest of
 * the site uses.
 */
export const TINTS: Record<string, { lo: [number, number, number] | null; hi: [number, number, number] | null }> = {
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
 * Surface treatment. The blur is a CSS filter on the canvas rather than
 * passes over the buffer: mist alone was ten full-grid passes every frame,
 * more work than the simulation itself, and the GPU does the same job for
 * nothing. Only grain and gamma stay in JS, one cheap pass each.
 */
export const TEXTURES: Record<string, { filter: string; grain: number; gamma: number }> = {
  mist: { filter: "blur(6px)", grain: 0, gamma: 0.85 },
  soft: { filter: "blur(2.5px)", grain: 0, gamma: 1 },
  glow: { filter: "blur(3px) contrast(1.25) brightness(1.06)", grain: 0, gamma: 1 },
  bloom: { filter: "blur(5px) contrast(1.35) brightness(1.1)", grain: 0, gamma: 0.9 },
  grain: { filter: "blur(1.5px)", grain: 0.14, gamma: 0.9 },
  velvet: { filter: "blur(8px) contrast(0.92) brightness(1.04)", grain: 0.06, gamma: 0.8 },
};

/** Page colours as RGB, read from the CSS variables by the component. */
export type Palette = { ink: number[]; bg: number[] };

/** Everything the simulation needs from the page, as plain data so it can be
 *  posted to a worker. */
export type FieldSettings = {
  preset: string;
  /** Simulation grid in cells, already fitted to the viewport's shape. */
  grid: [number, number];
  texture: string;
  tint: string;
  palette: Palette;
  /** Steps per displayed frame. */
  speed: number;
  /** False while /preview is showing a different backdrop. */
  active: boolean;
  /** A changing token rather than a flag, so pressing reset twice in a row
   *  still restarts. */
  reset: string;
  /** Motion allowed (no reduced-motion preference). False stops the frame
   *  loop entirely; a hidden tab is left to animation-frame throttling. */
  running: boolean;
};

type Schedule = {
  request: (cb: () => void) => number;
  cancel: (id: number) => void;
};

/** A 2D context from either kind of canvas; the calls used here are shared. */
type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/**
 * Run the simulation on `canvas`, redrawing on `schedule` (requestAnimationFrame
 * on the page or in a worker). Returns null if the canvas has no 2D context.
 */
export function createField(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  schedule: Schedule,
) {
  const c2d = canvas.getContext("2d") as Ctx2D | null;
  if (!c2d) return null;
  const ctx: Ctx2D = c2d;

  let settings: FieldSettings | null = null;
  let cfg = PRESETS[DEFAULT_PRESET];
  let tex = TEXTURES.mist;
  let tint = TINTS.ink;
  let col: Palette = { ink: [0, 0, 0], bg: [255, 255, 255] };

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
  // Frames between samples. This was 45, but the check was accidentally
  // written out twice, so it actually ran every ~22 frames — and STILL_ENOUGH
  // was tuned against that. One copy at 22 keeps the behaviour it was tuned on.
  const PROBE_EVERY = 22;
  const STILL_ENOUGH = 0.015; // relative change below which nothing is moving
  const STILL_REPEATS = 3; // consecutive quiet samples before restarting
  let probe = new Float32Array(0);
  let sinceProbe = 0;
  let stillCount = 0;
  let needsRestart = false;

  let disp = new Float32Array(0);
  let agents = new Float32Array(0);
  let trail = new Float32Array(0);
  let scratch = new Float32Array(0);
  // Per-cell grain, before scaling by the texture's amount. It is a fixed
  // hash of the cell position, so computing it once per grid instead of a
  // Math.sin per pixel per frame gives the same picture for less work.
  let noise = new Float64Array(0);

  let raf = 0;
  let looping = false;

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
    if (!settings) return;
    [W, H] = settings.grid;
    canvas.width = W;
    canvas.height = H;
    img = ctx.createImageData(W, H);
    buf = new Uint32Array(img.data.buffer);
    const N = W * H;
    trail = new Float32Array(N);
    scratch = new Float32Array(N);
    disp = new Float32Array(N);
    noise = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const h = Math.sin((i % W) * 12.9898 + ((i / W) | 0) * 78.233) * 43758.5453;
      noise[i] = h - Math.floor(h) - 0.5;
    }
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
      // Restart from frame() rather than here: start() reallocates the very
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

    const gm = tex.gamma;
    const gr = tex.grain;
    for (let i = 0; i < n; i++) {
      let v = disp[i];
      if (gm !== 1) v = Math.pow(v < 0 ? 0 : v, gm);
      // Deterministic per cell, so it does not crawl.
      if (gr > 0) v += noise[i] * gr;
      buf![i] = shade(v);
    }
  }

  function frame() {
    if (!settings) return;
    // Advance `speed` times, but only build the picture on the last one.
    for (let i = 0; i < settings.speed; i++) step(i === settings.speed - 1);
    ctx.putImageData(img!, 0, 0);
    if (needsRestart) start();
  }

  const tick = () => {
    if (!settings?.running || !settings.active || !buf) {
      looping = false;
      return;
    }
    frame();
    raf = schedule.request(tick);
  };

  return {
    /** Apply new settings, restarting the run only when the preset, the grid
     *  or the reset token changed — a palette or speed change carries on
     *  from where the network already is. */
    update(next: FieldSettings) {
      const prev = settings;
      settings = next;
      cfg = PRESETS[next.preset] ?? PRESETS[DEFAULT_PRESET];
      tex = TEXTURES[next.texture] ?? TEXTURES.mist;
      tint = TINTS[next.tint] ?? TINTS.ink;
      col = next.palette;
      if (
        !prev ||
        prev.preset !== next.preset ||
        prev.grid[0] !== next.grid[0] ||
        prev.grid[1] !== next.grid[1] ||
        prev.reset !== next.reset
      ) {
        start();
      }
      if (next.running && next.active && !looping) {
        looping = true;
        raf = schedule.request(tick);
      }
    },
    stop() {
      schedule.cancel(raf);
      looping = false;
    },
  };
}
