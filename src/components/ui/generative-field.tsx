"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  createField,
  DEFAULT_PRESET,
  PRESETS,
  TEXTURES,
  type FieldSettings,
  type Palette,
} from "./generative-field-sim";

/**
 * The site backdrop: the physarum simulation in generative-field-sim.ts, on a
 * small canvas scaled up by CSS. This component owns everything that needs
 * the page — the palette, the viewport, the /preview controls — and runs the
 * simulation itself in a worker where the browser can hand one a canvas, so
 * its per-frame work never blocks scrolling, taps or first load. Browsers
 * without OffscreenCanvas run the same simulation here, as it always did.
 */

/** What the live site runs. /preview overrides all of this by attribute. */
const LIVE = { tint: "ink", texture: "velvet" };

/**
 * Grid size, as the LONG edge. The old formula pinned width and let height
 * follow the aspect ratio, so a portrait phone got 460x995 — 457k cells
 * against a desktop's 118k, four times the work on the weaker device, which
 * is exactly why it crawled there.
 */
const RESOLUTIONS: Record<string, number> = {
  low: 300,
  med: 440,
  high: 620,
  max: 860,
};

/** Auto picks by what the device is likely to sustain. */
function autoResolution(): number {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (coarse) return cores >= 8 ? RESOLUTIONS.med : RESOLUTIONS.low;
  return cores >= 8 ? RESOLUTIONS.high : RESOLUTIONS.med;
}

/** Page colours for the simulation, read from the palette variables. */
function palette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const pt = (cs.getPropertyValue("--pt").trim() || "0,0,0")
    .split(",").map((v) => parseInt(v.trim(), 10) || 0);
  const bg = (cs.getPropertyValue("--bg").trim() || "#ffffff").replace("#", "");
  const h = (s: string, i: number) =>
    parseInt(s.length === 3 ? s[i].repeat(2) : s.slice(i * 2, i * 2 + 2), 16) || 0;
  return { ink: pt, bg: [h(bg, 0), h(bg, 1), h(bg, 2)] };
}

/** Target grid for the current viewport and resolution setting. Measured
 *  from the LAYOUT viewport: window.innerHeight tracks the collapsing URL
 *  bar on a phone, so reading it here meant a tap resized the grid and
 *  restarted the whole simulation. */
function gridSize(resolution: number): [number, number] {
  const de = document.documentElement;
  let cw = de.clientWidth || window.innerWidth || 0;
  let ch = de.clientHeight || window.innerHeight || 0;
  // A hidden or backgrounded tab reports 0x0. Clamping that to 1x1 made
  // the aspect ratio exactly 1 and built a square grid, which is both the
  // wrong shape and needlessly large. Fall back to a normal landscape
  // viewport instead and let the resize/visibility handlers correct it
  // once the page is actually on screen.
  if (cw < 2 || ch < 2) {
    cw = 1440;
    ch = 810;
  }
  const long = resolution;
  return ch >= cw
    ? [Math.max(1, Math.round(long * (cw / ch))), long]
    : [long, Math.max(1, Math.round(long * (ch / cw)))];
}

export function GenerativeField() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // /cv is a dense data sheet; a moving field behind it makes it hard to read.
  const hide = pathname === "/cv" || pathname === "/cv/";
  const isPreview = pathname.startsWith("/preview");

  useEffect(() => {
    if (hide) return;
    const host = ref.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A fresh canvas per run. Once a canvas has been handed to a worker it
    // can neither be drawn from here nor handed over again, so every mount
    // (and dev's double-run effects) needs its own.
    const makeCanvas = () => {
      const c = document.createElement("canvas");
      c.style.display = "block";
      c.style.width = "100%";
      c.style.height = "100%";
      return c;
    };
    // On the live site the preset is chosen at random on each landing, so the
    // background is not the same drawing every visit. It stays put for the
    // duration: a settle-restart re-runs the same one rather than switching
    // character underneath someone mid-read.
    const keys = Object.keys(PRESETS);
    let name = isPreview
      ? DEFAULT_PRESET
      : keys[Math.floor(Math.random() * keys.length)] ?? DEFAULT_PRESET;
    const presetSpeed = () => (PRESETS[name] ?? PRESETS[DEFAULT_PRESET]).speed;
    let texture = isPreview ? "mist" : LIVE.texture;

    // The texture's CSS filter goes on the wrapper, not the canvas, and is in
    // place before the canvas is handed to a worker. Changing the filter on a
    // canvas a worker already owns left Chrome showing a stale, empty layer:
    // the worker drew every frame and none of them reached the screen until
    // some unrelated style change forced a recomposite.
    const setFilter = () => {
      const f = (TEXTURES[texture] ?? TEXTURES.mist).filter;
      if (host.style.filter !== f) host.style.filter = f;
    };
    setFilter();
    let cv = makeCanvas();
    host.appendChild(cv);
    let tint = LIVE.tint;
    let resolution = autoResolution();
    let speed = presetSpeed();
    let active = false;
    let reset = "";
    let lastGrid: [number, number] = [0, 0];

    let worker: Worker | null = null;
    let local: ReturnType<typeof createField> = null;

    const push = () => {
      setFilter();
      const grid = gridSize(resolution);
      lastGrid = grid;
      const settings: FieldSettings = {
        preset: name,
        grid,
        texture,
        tint,
        palette: palette(),
        speed,
        active,
        reset,
        // Not gated on page visibility: animation frames already stop in a
        // hidden tab, in a worker as on the page, and a page can load as
        // "hidden" (a background tab, a prerender) without a reliable event
        // when it is shown — which left the backdrop blank.
        running: !reduced,
      };
      if (worker) worker.postMessage({ type: "update", settings });
      else local?.update(settings);
    };

    const runHere = () => {
      local = createField(cv, {
        request: (cb) => requestAnimationFrame(cb),
        cancel: (id) => cancelAnimationFrame(id),
      });
    };
    // The canvas may already belong to a worker that then failed, so falling
    // back always starts from a new one.
    const fallBack = () => {
      worker?.terminate();
      worker = null;
      const fresh = makeCanvas();
      cv.replaceWith(fresh);
      cv = fresh;
      runHere();
    };

    let readyTimer = 0;
    if (typeof Worker !== "undefined" && "transferControlToOffscreen" in cv) {
      try {
        // A classic worker, not { type: "module" }: the bundler's worker
        // bootstrap loads its chunks with importScripts, which module workers
        // do not have — and that failure is silent, leaving a blank backdrop.
        worker = new Worker(new URL("./generative-field.worker.ts", import.meta.url));
        const off = cv.transferControlToOffscreen();
        worker.postMessage({ type: "init", canvas: off }, [off]);
        const giveUp = () => {
          window.clearTimeout(readyTimer);
          if (!worker) return;
          fallBack();
          push();
        };
        worker.onerror = giveUp;
        worker.onmessage = (e: MessageEvent<{ type: string }>) => {
          if (e.data?.type === "ready") window.clearTimeout(readyTimer);
        };
        // Generous, so a slow connection still gets the worker; this only
        // exists to catch one that will never start.
        readyTimer = window.setTimeout(giveUp, 8000);
      } catch {
        fallBack();
      }
    } else {
      runHere();
    }

    const sync = () => {
      if (!isPreview) {
        // Live: fixed settings, always running, at whatever pace the randomly
        // chosen preset asks for. Only the palette is re-read, so a light/dark
        // switch still recolours the field.
        speed = presetSpeed();
        active = true;
        push();
        return;
      }
      const de = document.documentElement.dataset;
      tint = de.tint ?? "ink";
      texture = de.texture ?? "mist";
      const rq = de.res ?? "auto";
      resolution = rq === "auto" ? autoResolution() : RESOLUTIONS[rq] ?? autoResolution();
      const raw = de.backdrop ?? "";
      const next = raw.startsWith("gen-") ? raw.slice(4) : null;
      active = !!next && !!PRESETS[next];
      if (active && next) name = next;
      // Steps per displayed frame. Nothing about the simulation changes; it
      // simply advances further between paints, so a slow preset reaches the
      // state worth judging in seconds rather than a minute. "auto" (and
      // anything unrecognised) hands the choice back to the preset, which is
      // the sensible default now that they settle at such different rates.
      const sp = Number(de.speed);
      speed = Number.isFinite(sp) && sp >= 1 ? Math.min(16, Math.round(sp)) : presetSpeed();
      reset = de.reset ?? "";
      push();
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-backdrop",
        "data-scheme",
        "data-theme",
        "data-tint",
        "data-texture",
        "data-res",
        "data-speed",
        "data-reset",
      ],
    });
    const onResize = () => {
      if (!active) return;
      // Only rebuild when the grid would actually differ. A phone fires resize
      // constantly as its toolbar slides, and restarting on each one wiped the
      // network every time the screen was touched.
      const [tw, th] = gridSize(resolution);
      if (tw !== lastGrid[0] || th !== lastGrid[1]) push();
    };
    window.addEventListener("resize", onResize);
    // A tab restored from the background reports its real size only once it is
    // visible again, so re-check the grid then as well.
    document.addEventListener("visibilitychange", onResize);

    sync();

    return () => {
      window.clearTimeout(readyTimer);
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onResize);
      worker?.terminate();
      local?.stop();
      cv.remove();
      host.style.filter = "";
    };
  }, [hide, isPreview]);

  if (hide) return null;
  return <div ref={ref} className="genfield" aria-hidden />;
}
