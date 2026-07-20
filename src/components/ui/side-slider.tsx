"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getListedProjects } from "@/lib/projects";
import { selectedWorks } from "@/content/selected";
import { performances, awards } from "@/content/cv";

interface WorkPoint {
  year: number;
  title: string;
  mag: number; // 0..1 magnitude → bar length
  href?: string;
  selected: boolean; // is this a Selected Works piece?
  frac: number; // 0..1 base position along the rail
  phase: number; // breathing offset
}

const SECTION_MAG: Record<string, number> = {
  commissioned: 0.8,
  installation: 0.62,
  sketch: 0.42,
  teaching: 0.42,
};

/**
 * The right rail is a temporal histogram of the work: each piece is one thin
 * bar, ordered by year (newest at top), its length set by the work's scale
 * (bigger commissions reach further across). Bars breathe on a slow sine,
 * the whole timeline drifts gently upward and parallax-couples to scroll.
 * Hover a bar to slide its title out; click to open it. On top of that, the
 * Selected Works bars occasionally reveal their name on their own as they
 * drift by (max two at once), riding along with the bar.
 */
export function SideSlider() {
  const ref = useRef<HTMLCanvasElement>(null);
  const popRef = useRef<HTMLAnchorElement>(null);
  const autoRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    const canvas = ref.current;
    const pop = popRef.current;
    if (!canvas || !pop) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // --- build the timeline ------------------------------------------------
    const selectedSet = new Set(selectedWorks.map((s) => `/work/${s}`));
    const projects = getListedProjects();
    const items: Omit<WorkPoint, "frac" | "phase">[] = [
      ...projects.map((p) => ({
        year: parseInt(p.year, 10) || 2025,
        title: p.title,
        mag: p.weight ?? SECTION_MAG[p.section ?? "commissioned"] ?? 0.6,
        href: `/work/${p.slug}`,
        selected: selectedSet.has(`/work/${p.slug}`),
      })),
      ...performances
        .filter((p) => p.year)
        .map((p) => ({
          year: parseInt(p.year, 10) || 2025,
          title: p.title,
          mag: 0.55,
          selected: false,
        })),
      ...awards.map((a) => ({
        year: parseInt(a.year, 10) || 2026,
        title: a.title,
        mag: 1,
        selected: false,
      })),
    ];
    items.sort((a, b) => b.year - a.year || b.mag - a.mag);

    // stable pseudo-random, so placement is fixed per item
    const rnd = (i: number) => {
      const s = Math.sin(i * 127.1 + 11.7) * 43758.5453;
      return s - Math.floor(s);
    };

    // Group by year: each year gets a band sized by how many works it holds
    // (busy years cluster densely), separated by small gaps, and items are
    // scattered randomly inside their band so the spacing reads irregular.
    const N = Math.max(items.length, 1);
    const years = [...new Set(items.map((it) => it.year))]; // desc
    const GAP = 0.035;
    const content = Math.max(0.1, 1 - GAP * Math.max(0, years.length - 1));
    const work: WorkPoint[] = [];
    let cursor = 0;
    let idx = 0;
    for (const yr of years) {
      const group = items.filter((it) => it.year === yr);
      const bandH = (group.length / N) * content;
      for (const it of group) {
        work.push({
          ...it,
          frac: cursor + rnd(idx) * bandH,
          phase: idx * 0.7,
        });
        idx++;
      }
      cursor += bandH + GAP;
    }
    const selectedIdxs = work
      .map((p, i) => (p.selected ? i : -1))
      .filter((i) => i >= 0);

    // --- state -------------------------------------------------------------
    let raf = 0;
    let hoverIdx = -1;
    let pointerY = -1;
    let paused = false; // freeze drift while hovering for easy reading
    let drift = 0;
    // current on-screen top (CSS px) of every bar, refreshed each frame
    const curY = new Float32Array(work.length);
    // ambient auto-reveal: up to two Selected Works names at a time, each
    // staying until it rides to the top of the screen
    const autoState: ({ idx: number; lastY: number } | null)[] = [null, null];
    let sinceSpawn = 0;
    let spawnEvery = 1400;
    let prevT = 0;

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const theme = () => {
      const cs = getComputedStyle(document.documentElement);
      return {
        ink: cs.getPropertyValue("--ink").trim() || "#000",
        accent: cs.getPropertyValue("--accent").trim() || "#00ff00",
      };
    };

    const draw = (t: number) => {
      const dt = prevT ? t - prevT : 16;
      prevT = t;
      resize();
      const w = canvas.width;
      const h = canvas.height;
      const time = t * 0.001;
      const col = theme();
      ctx.clearRect(0, 0, w, h);

      if (!paused) drift += 0.28 * dpr; // continuous upward scroll
      // timeline wraps within the rail height; parallax couples to scroll
      const offset = (drift + window.scrollY * 0.3 * dpr) % h;

      hoverIdx = -1;
      let hoverDist = 11 * dpr;
      const thick = 1 * dpr; // thin, hairline bars — as before

      for (let i = 0; i < work.length; i++) {
        const p = work[i];
        let y = (p.frac * h - offset) % h;
        if (y < 0) y += h;
        const iy = Math.round(y);
        curY[i] = iy / dpr;

        const breathe = 1 + Math.sin(time * 0.6 + p.phase) * 0.14;
        const len = (0.26 + p.mag * 0.74) * (w - 2 * dpr) * breathe;
        const alpha = 0.3 + p.mag * 0.34;

        if (pointerY >= 0) {
          const d = Math.abs(iy - pointerY);
          if (d < hoverDist) {
            hoverDist = d;
            hoverIdx = i;
          }
        }

        ctx.globalAlpha = i === hoverIdx ? 1 : alpha;
        ctx.fillStyle = i === hoverIdx ? col.accent : col.ink;
        ctx.fillRect(w - len, iy, len, thick);
      }
      ctx.globalAlpha = 1;

      // --- hover pop-out label -------------------------------------------
      if (hoverIdx >= 0) {
        const p = work[hoverIdx];
        pop.textContent = `${p.year} · ${p.title}${p.href ? " ↗" : ""}`;
        pop.style.top = `${pointerY / dpr}px`;
        pop.classList.add("on");
        canvas.style.cursor = p.href ? "pointer" : "default";
      } else {
        pop.classList.remove("on");
        canvas.style.cursor = "default";
      }

      // --- ambient auto-reveal (Selected Works) --------------------------
      const autos = autoRefs.current;
      const railH = h / dpr;
      if (paused) {
        // clear while hovering so the manual pop-out reads cleanly
        for (let s = 0; s < autos.length; s++) {
          if (autoState[s]) {
            autos[s]?.classList.remove("on");
            autoState[s] = null;
          }
        }
      } else {
        // track live ones; release once they ride off the top, wrap, or age out
        for (let s = 0; s < autos.length; s++) {
          const st = autoState[s];
          const el = autos[s];
          if (!st || !el) continue;
          const yc = curY[st.idx];
          // stay put until it reaches the top of the screen (or wraps around)
          if (yc < 10 || Math.abs(yc - st.lastY) > railH * 0.4) {
            el.classList.remove("on");
            autoState[s] = null;
          } else {
            el.style.top = `${yc}px`;
            st.lastY = yc;
          }
        }
        // occasionally reveal a new one into a free slot
        sinceSpawn += dt;
        if (sinceSpawn >= spawnEvery && selectedIdxs.length) {
          sinceSpawn = 0;
          spawnEvery = 2400 + Math.random() * 3200; // 2.4–5.6s between reveals
          const free = autoState.findIndex((x) => x === null);
          if (free >= 0) {
            const activeIdx = new Set(
              autoState.filter(Boolean).map((x) => (x as { idx: number }).idx),
            );
            const cands = selectedIdxs.filter((i) => {
              if (activeIdx.has(i)) return false;
              const yc = curY[i];
              // start low so the name has room to ride up before releasing
              if (yc < railH * 0.5 || yc > railH * 0.95) return false;
              for (const st of autoState) {
                if (st && Math.abs(curY[st.idx] - yc) < 70) return false;
              }
              return true;
            });
            if (cands.length) {
              const pick = cands[Math.floor(Math.random() * cands.length)];
              const p = work[pick];
              const el = autos[free];
              if (el) {
                el.textContent = `${p.year} · ${p.title}`;
                el.style.top = `${curY[pick]}px`;
                el.classList.add("on");
                autoState[free] = { idx: pick, lastY: curY[pick] };
              }
            }
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    // --- interaction -------------------------------------------------------
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointerY = (e.clientY - r.top) * dpr;
      paused = true;
    };
    const onLeave = () => {
      pointerY = -1;
      paused = false;
      pop.classList.remove("on");
    };
    const onClick = () => {
      if (hoverIdx >= 0) {
        const href = work[hoverIdx].href;
        if (href) router.push(href);
      }
    };

    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);
    window.addEventListener("resize", resize);

    resize();
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, [router]);

  return (
    <>
      <canvas ref={ref} className="side-slider" aria-hidden />
      <a ref={popRef} className="rail-pop" aria-hidden />
      <a
        ref={(el) => {
          autoRefs.current[0] = el;
        }}
        className="rail-pop rail-auto"
        aria-hidden
      />
      <a
        ref={(el) => {
          autoRefs.current[1] = el;
        }}
        className="rail-pop rail-auto"
        aria-hidden
      />
    </>
  );
}
