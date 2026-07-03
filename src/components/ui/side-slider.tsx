"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getListedProjects } from "@/lib/projects";
import { performances, awards } from "@/content/cv";

interface WorkPoint {
  year: number;
  title: string;
  mag: number; // 0..1 magnitude → size + boldness
  href?: string;
  baseY: number; // position on the virtual timeline (px)
}

const SECTION_MAG: Record<string, number> = {
  commissioned: 0.8,
  installation: 0.62,
  sketch: 0.42,
  teaching: 0.42,
};

/**
 * The right rail is a temporal histogram of the work: each piece is a bar
 * placed by the year it was made, sized and darkened by its scale (bigger
 * commissions read louder). The timeline drifts continuously upward and
 * parallax-couples to page scroll. Hovering a bar pops its title out from
 * the side; clicking opens the work. Not a scrollbar.
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
    const items: Omit<WorkPoint, "baseY">[] = [
      ...projects.map((p) => ({
        year: parseInt(p.year, 10) || 2025,
        title: p.title,
        mag:
          p.weight ?? SECTION_MAG[p.section ?? "commissioned"] ?? 0.6,
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
    // newest first, biggest first within a year
    items.sort((a, b) => b.year - a.year || b.mag - a.mag);

    const GAP = 40 * dpr; // vertical spacing between bars
    const totalH = Math.max(items.length * GAP, 1);
    const work: WorkPoint[] = items.map((it, i) => ({
      ...it,
      baseY: i * GAP,
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
        soft: cs.getPropertyValue("--soft").trim() || "#666",
        accent: cs.getPropertyValue("--accent").trim() || "#00ff00",
      };
    };

    // where a work currently sits, in canvas px (looped)
    const screenY = (baseY: number, offset: number, h: number) => {
      let y = (baseY - offset) % totalH;
      if (y < 0) y += totalH;
      // centre the loop window so items scroll through the viewport
      return y - (totalH - h) * 0; // baseline: 0..totalH mapped, clipped by draw
    };

    const currentOffset = () =>
      drift + window.scrollY * 0.35 * dpr;

    const draw = (t: number) => {
      resize();
      const w = canvas.width;
      const h = canvas.height;
      const col = theme();
      ctx.clearRect(0, 0, w, h);

      if (!paused) drift += 0.35 * dpr; // continuous upward scroll
      const offset = currentOffset();

      // inner-edge hairline
      ctx.fillStyle = col.ink;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(0, 0, 1, h);
      ctx.globalAlpha = 1;

      let lastYearLabelled = -1;
      hoverIdx = -1;
      let hoverDist = 14 * dpr;

      for (let i = 0; i < work.length; i++) {
        const p = work[i];
        // draw two copies (wrap) so bars are continuous across the loop seam
        for (let k = -1; k <= 1; k++) {
          let y = ((p.baseY - offset) % totalH) + k * totalH;
          if (y < -GAP || y > h + GAP) continue;

          const len = (5 + p.mag * 22) * dpr;
          const thick = Math.max(1, (0.6 + p.mag * 3) * dpr);
          const alpha = 0.22 + p.mag * 0.66;

          // hover hit-test against the pointer (only the on-screen copy)
          if (pointerY >= 0) {
            const d = Math.abs(y - pointerY);
            if (d < hoverDist) {
              hoverDist = d;
              hoverIdx = i;
            }
          }

          ctx.globalAlpha = alpha;
          ctx.fillStyle = i === hoverIdx ? col.accent : col.ink;
          ctx.fillRect(w - len, y - thick / 2, len, thick);
        }

        // year tick + label at the first bar of each year
        if (p.year !== lastYearLabelled) {
          let y = ((p.baseY - offset) % totalH);
          if (y < 0) y += totalH;
          if (y >= 0 && y <= h) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = col.soft;
            ctx.font = `${9 * dpr}px 'Courier New', monospace`;
            ctx.fillText(String(p.year), 2 * dpr, y - 3 * dpr);
          }
          lastYearLabelled = p.year;
        }
      }
      ctx.globalAlpha = 1;

      // --- pop-out label -------------------------------------------------
      if (hoverIdx >= 0) {
        const p = work[hoverIdx];
        pop.textContent = `${p.year} · ${p.title}${p.href ? " ↗" : ""}`;
        pop.style.top = `${pointerY / dpr}px`;
        pop.classList.add("on");
        pop.style.cursor = p.href ? "pointer" : "default";
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
