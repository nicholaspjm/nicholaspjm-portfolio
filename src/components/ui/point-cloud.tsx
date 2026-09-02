"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { asset } from "@/lib/asset";

/**
 * Ambient point-cloud background — a real room scan (decimated to ~35k pts,
 * /public/data/scan.bin as raw Float32 xyz triplets). Drawn faint behind the
 * page; slow auto-rotation + mouse parallax + scroll-driven tilt.
 * Colour follows the active theme via the --pt / --pt-alpha CSS vars.
 */
export function PointCloud() {
  const ref = useRef<HTMLCanvasElement>(null);
  // The /cv page is a dense data sheet; the point cloud makes it hard to read.
  const pathname = usePathname();
  // The generative field is the site background now. The scan survives only as
  // the "point cloud" option on /preview, so everywhere else this neither
  // renders nor fetches its 419KB of points.
  const hide = !pathname.startsWith("/preview");
  // On /preview the scan is bent into shapes that are plainly not a room.
  const morph = pathname.startsWith("/preview");

  useEffect(() => {
    if (hide) return;
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

    // Render at the TRUE device pixel ratio. Capping below the real ratio is
    // what made the scan blurry on some phones: a 3x bitmap on a 3.5x or 4x
    // screen gets resampled up by the compositor, smearing every dot. 4 is
    // above every shipping display, so the cap never bites in practice.
    let dpr = Math.min(window.devicePixelRatio || 1, 4);
    // Dot size, held constant in CSS pixels rather than device pixels. The
    // old `min(2, round(dpr))` cap meant a 3x phone drew the same 2 device
    // pixels as a 2x laptop — i.e. a dot a third smaller in real terms, and
    // half the size at 4x. That is what read as "low res" on mobile: not
    // blur, just dots too small to register. Scaling by dpr keeps a dot the
    // same physical size on every screen.
    let dot = 1;
    const setDot = () => {
      // data-dot (set by the preview control) overrides the default so the
      // size can be judged on a real device instead of guessed at.
      const raw = parseFloat(document.documentElement.dataset.dot ?? "");
      const cssPx = Number.isFinite(raw) && raw > 0 ? raw : 1;
      dot = Math.max(1, Math.round(cssPx * dpr));
    };
    let img: ImageData | null = null;
    let buf: Uint32Array | null = null;
    const resize = () => {
      // re-read each resize so the correct device pixel ratio is used even if
      // the component mounted on a different screen / before rotation
      dpr = Math.min(window.devicePixelRatio || 1, 4);
      // Size from WHOLE CSS pixels outwards, never the reverse. Flooring the
      // backing store first and dividing back (w/dpr) leaves a fractional CSS
      // width like 1438.4px, so the fixed element lands on a fractional device
      // pixel and the compositor resamples the whole bitmap. An integer CSS
      // box times dpr maps 1:1 everywhere, fractional Windows scaling included.
      //
      // Measure the LAYOUT viewport, not window.innerWidth/Height. On iOS
      // Safari innerHeight tracks the collapsing URL bar, so it changes on
      // almost every scroll frame — the canvas was being torn down and
      // reallocated constantly, and Safari serves a stale, stretched bitmap
      // while that happens, which is what reads as permanently low-res there.
      // documentElement.clientWidth/Height stay put through the toolbar
      // animation. visualViewport is consulted only for its scale, so a
      // pinch-zoomed page still rasterises sharp.
      const de = document.documentElement;
      const cssW = Math.max(1, de.clientWidth || window.innerWidth);
      const cssH = Math.max(1, de.clientHeight || window.innerHeight);
      const vvScale = window.visualViewport?.scale ?? 1;
      // iOS Safari silently downscales canvases past a total-area budget
      // (~16.7M device px). Past that it hands back something blurry rather
      // than failing, so stay under it deliberately instead of being surprised.
      const MAX_AREA = 16_000_000;
      const wanted = dpr * Math.min(vvScale > 1 ? vvScale : 1, 2);
      const area = cssW * cssH * wanted * wanted;
      const eff = area > MAX_AREA ? Math.sqrt(MAX_AREA / (cssW * cssH)) : wanted;
      const w = Math.round(cssW * eff);
      const h = Math.round(cssH * eff);
      dpr = eff;
      setDot();
      if (canvas.width === w && canvas.height === h && img) return;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      img = ctx.createImageData(w, h);
      buf = new Uint32Array(img.data.buffer);
    };
    resize();
    window.addEventListener("resize", resize);
    // hidden tabs report 0×0 — re-measure when the tab becomes visible
    document.addEventListener("visibilitychange", resize);

    // Start where the scan actually reads. The old 0.6 / -0.4 put the room
    // nearly edge-on: measured over the real point data, the horizontal and
    // vertical spreads were 0.46:1, i.e. squashed along one axis, and frame
    // coverage was 0.29. Since rotY drifts at only 0.0012 rad/frame it took
    // roughly a minute to turn into a good view, which is why the cloud
    // "came good" after a while rather than on arrival. 4.6 / -0.5 measures
    // 0.84 balance and slightly better coverage — the best of a sweep over
    // the whole revolution.
    let rotY = 4.6;
    const rotX = -0.5;
    let targetParX = 0;
    let targetParY = 0;
    let parX = 0;
    let parY = 0;
    let impulse = 0; // kick from page interactions

    const onMove = (e: MouseEvent) => {
      // The preview backdrops are meant to be watched, not driven. On a phone
      // the scroll coupling below made the cloud lurch with every thumb
      // movement, which read as the page fighting back.
      if (morph) return;
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
    // On /preview the backdrop can be switched to the blur field or to
    // nothing at all. CSS hides the canvas either way, but the projection
    // loop would keep running behind it — so skip the work as well.
    let cloudOn = true;
    const readBackdrop = () => {
      const b = document.documentElement.dataset.backdrop;
      cloudOn = !b || b === "cloud";
    };
    readBackdrop();

    let themeCol = readTheme();
    const mo = new MutationObserver(() => {
      themeCol = readTheme();
      setDot();
      readBackdrop();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      // data-scheme as well as data-theme: the preview palettes move --pt and
      // --pt-alpha too, and without this the cloud keeps the previous colour
      // and disappears against a dark scheme's ground.
      attributeFilter: [
        "data-theme",
        "data-scheme",
        "data-dot",
        "data-backdrop",
      ],
    });

    // Morph output. Written into shared scratch rather than returned as a
    // tuple: this runs ~35k times a frame and allocating an array per point
    // would hand the collector 2M objects a second.
    let mx = 0, my = 0, mz = 0;
    const morphTo = (
      mode: number,
      x: number,
      y: number,
      z: number,
      t: number,
    ) => {
      switch (mode) {
        // 0 — the room as scanned, so the cycle always comes home.
        case 1: {
          // SPHERE INVERSION (Möbius): p ↦ k·p/|p|². The classic conformal
          // map — everything near the centre is flung outward and everything
          // far collapses in, so the room turns itself inside out.
          // The clamp sets how violent the inversion is: too low and points
          // near the centre are flung right off screen, leaving noise rather
          // than a form. 0.18 keeps the multiplier inside about 5x.
          const q = x * x + y * y + z * z;
          const k = 0.35 / Math.max(q, 0.18);
          mx = x * k; my = y * k; mz = z * k;
          return;
        }
        case 2: {
          // SPHERICAL HARMONIC: radius modulated by sin(mθ)·cos(nφ), the
          // standing-wave pattern of a vibrating sphere. Gives a lobed shell
          // that breathes as the orders drift.
          const r = Math.sqrt(x * x + y * y + z * z) || 1e-6;
          const theta = Math.atan2(y, x);
          const phi = Math.acos(z / r < -1 ? -1 : z / r > 1 ? 1 : z / r);
          const m = 5 + Math.sin(t * 0.11) * 2;
          const harm = Math.sin(m * theta) * Math.cos(4 * phi) * 0.2;
          const k = (0.6 + harm) / r;
          mx = x * k; my = y * k; mz = z * k;
          return;
        }
        case 3: {
          // COMPLEX SQUARE: treat (x,y) as a complex number and map w = z².
          // A conformal map that doubles every angle, so the room folds
          // through itself and comes out symmetric about the origin.
          mx = (x * x - y * y) * 0.85;
          my = 2 * x * y * 0.85;
          mz = z;
          return;
        }
        case 4: {
          // LORENZ FIELD: advect each point along the attractor's velocity.
          // Not the trajectory — just one step of the field — which shears
          // the cloud along the wings of the butterfly.
          const s1 = 10, rr = 28, b = 8 / 3, S = 0.011;
          const vx = s1 * (y - x);
          const vy = x * (rr - z * 4) - y;
          const vz = x * y * 4 - b * z;
          mx = x + vx * S; my = y + vy * S; mz = z + vz * S;
          return;
        }
        case 5: {
          // TORUS: (x,y) reread as the two angles of a torus, so the flat
          // room is rolled onto a donut and its far edges meet.
          const R = 0.55, rad = 0.24;
          const u = x * Math.PI * 1.4;
          const v = y * Math.PI * 1.4 + t * 0.12;
          const cv = Math.cos(v);
          mx = (R + rad * cv) * Math.cos(u);
          my = (R + rad * cv) * Math.sin(u);
          mz = rad * Math.sin(v) + z * 0.3;
          return;
        }
        case 6: {
          // CURL-ish FLOW: three offset sinusoids, one per axis, reading each
          // other's coordinates. Nearly divergence-free, so the cloud swirls
          // and stretches without collapsing into clumps.
          const f = 2.6;
          mx = x + Math.sin(y * f + t * 0.4) * 0.12;
          my = y + Math.sin(z * f + t * 0.5) * 0.12;
          mz = z + Math.sin(x * f + t * 0.3) * 0.12;
          return;
        }
        case 7: {
          // LOG-POLAR: r ↦ log r, θ unchanged. Rings become straight lines
          // and the scan smears into a spiral shell.
          const r = Math.sqrt(x * x + y * y) || 1e-6;
          const a = Math.atan2(y, x) + t * 0.1;
          const lr = (Math.log(r + 0.12) + 2.1) * 0.42;
          mx = lr * Math.cos(a); my = lr * Math.sin(a); mz = z * 0.8;
          return;
        }
        default:
          mx = x; my = y; mz = z;
      }
    };

    let bornAt = 0; // set when points arrive — drives the assembly animation

    fetch(asset("/data/scan.bin"))
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (disposed) return;
        // Full scan density: every point, each a single solid-black device
        // pixel, for the finest, darkest rendition of the room.
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
      if (!cloudOn) {
        // Not the active backdrop — idle cheaply rather than projecting 35k
        // points into a canvas nobody can see.
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
      const scrollT = morph ? 0 : window.scrollY * 0.0011; // scroll spins it, except on /preview

      parX += (targetParX - parX) * 0.05;
      parY += (targetParY - parY) * 0.05;

      const ry = rotY + parX;
      const rx = rotX + parY + scrollT;

      const cy = Math.cos(ry), sy = Math.sin(ry);
      const cx = Math.cos(rx), sx = Math.sin(rx);

      // dead-centre and large — sized to the longest viewport edge so the
      // scan reads as an immersive room you're standing inside of; points
      // that fall past the edges are simply clipped
      // The 1.9 is tuned so the room fills the frame. Several morphs push
      // points well past the room's extent, so pull back while morphing or
      // the shape spends its time off screen.
      const scale =
        Math.max(w, h) * (morph ? 1.25 : 1.9) * (1 + impulse * 0.05);
      const cxp = w * 0.5;
      const cyp = h * 0.5;
      const fov = 2.2;
      const word = themeCol.px;
      const accentWord = themeCol.accent;

      // scan sweep: a plane travels through the room every ~6.5s;
      // points it touches flash in the accent colour
      const scanX = ((time * 0.37) % 2.6) - 1.3;

      buf.fill(0);

      // --- abstract morphs (preview only) ------------------------------
      // The scan is a real room. These bend it into forms that clearly are
      // not one, holding each shape for most of its turn and then easing
      // into the next, so the room dissolves and reassembles rather than
      // wobbling continuously.
      const MODES = 8;
      const HOLD = 0.62; // fraction of each turn spent settled in the shape
      const mPos = time / 8; // ~8s per shape
      const mIdx = Math.floor(mPos) % MODES;
      const mNext = (mIdx + 1) % MODES;
      const mRaw = mPos - Math.floor(mPos);
      const mBlend =
        mRaw < HOLD
          ? 0
          : (1 - Math.cos(((mRaw - HOLD) / (1 - HOLD)) * Math.PI)) / 2;

      const n = pts.length;
      for (let i = 0; i < n; i += 3) {
        let x0 = pts[i], y0 = pts[i + 1], z0 = pts[i + 2];
        if (morph) {
          morphTo(mIdx, x0, y0, z0, time);
          const ax = mx, ay = my, az = mz;
          if (mBlend > 0) {
            morphTo(mNext, x0, y0, z0, time);
            x0 = ax + (mx - ax) * mBlend;
            y0 = ay + (my - ay) * mBlend;
            z0 = az + (mz - az) * mBlend;
          } else {
            x0 = ax; y0 = ay; z0 = az;
          }
        }
        // shimmer — a slow wave rolls through the scan like live sensor noise
        // (kept gentle so the field stays calm rather than grainy)
        if (!reduced) {
          y0 += Math.sin(time * 1.1 + x0 * 5 + i * 0.11) * 0.004;
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
  }, [hide, morph]);

  if (hide) return null;
  return <canvas ref={ref} className="ptcloud" aria-hidden />;
}
