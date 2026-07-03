"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getListedProjects } from "@/lib/projects";
import { performances, awards } from "@/content/cv";

interface WorkPoint {
  year: number;
  title: string;
  mag: number; // 0..1 magnitude → bar length
  href?: string;
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
 * Hover a bar to slide its title out from the side; click to open it.
 */
export function SideSlider() {
  const ref = useRef<HTMLCanvasElement>(null);
  const popRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = ref.current;
    const pop = popRef.current;
    if (!canvas || !pop) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // --- build the timeline ------------------------------------------------
    const projects = getListedProjects();
    const items: Omit<WorkPoint, "frac" | "phase">[] = [
      ...projects.map((p) => ({
        year: parseInt(p.year, 10) || 2025,
        title: p.title,
        mag: p.weight ?? SECTION_MAG[p.section ?? "commissioned"] ?? 0.6,
        href: `/work/${p.slug}`,
      })),
      ...performances
        .filter((p) => p.year !== "—")
        .map((p) => ({
          year: parseInt(p.year, 10) || 2025,
          title: p.title,
          mag: 0.55,
        })),
      ...awards.map((a) => ({
        year: parseInt(a.year, 10) || 2026,
        title: a.title,
        mag: 1,
      })),
    ];
    items.sort((a, b) => b.year - a.year || b.mag - a.mag);

    const N = Math.max(items.length, 1);
    const work: WorkPoint[] = items.map((it, i) => ({
      ...it,
      frac: (i + 0.5) / N,
      phase: i * 0.7,
    }));

    // --- state -------------------------------------------------------------
    let raf = 0;
    let hoverIdx = -1;
    let pointerY = -1;
    let paused = false; // freeze drift while hovering for easy reading
    let drift = 0;

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
      resize();
      const w = canvas.width;
      const h = canvas.height;
      const time = t * 0.001;
      const col = theme();
      ctx.clearRect(0, 0, w, h);

      if (!paused) drift += 0.28 * dpr; // continuous upward scroll
      // timeline wraps within the rail height; parallax couples to scroll
      const offset = (drift + window.scrollY * 0.3 * dpr) % h;

      // inner-edge hairline
      ctx.fillStyle = col.ink;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(0, 0, 1, h);

      hoverIdx = -1;
      let hoverDist = 11 * dpr;
      const thick = 1 * dpr; // thin, hairline bars — as before

      for (let i = 0; i < work.length; i++) {
        const p = work[i];
        let y = (p.frac * h - offset) % h;
        if (y < 0) y += h;
        const iy = Math.round(y);

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

      // --- pop-out label -------------------------------------------------
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
    </>
  );
}
