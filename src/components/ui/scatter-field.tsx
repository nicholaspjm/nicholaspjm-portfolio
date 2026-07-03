"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

export interface ScatterItem {
  src: string;
  slug: string;
  title: string;
  year: string;
}

interface BlobLayout {
  left: number; // vw
  top: number; // vh
  w: number; // vw
  rot: number; // deg
  par: number; // parallax factor
  z: number;
  conf: string;
}

/**
 * Work images piled in the right-hand whitespace as blob-tracker
 * detections: bounding box, corner ticks, mono track label — nothing
 * drawn over the image itself. Positions cluster into loose stacks
 * (rolled fresh each landing), every blob scrolls at its own parallax
 * rate so the pile slides apart and restacks as you move through the
 * page, and dashed association lines connect detections that belong to
 * the same project. Hidden while the preview zone is up.
 */
export function ScatterField({ items }: { items: ScatterItem[] }) {
  const [layout, setLayout] = useState<BlobLayout[] | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // loose cluster centres so blobs overlap into stacks
    const centres = Array.from(
      { length: Math.max(1, Math.min(3, Math.ceil(items.length / 3))) },
      () => ({
        x: 58 + Math.random() * 22, // 58–80vw
        y: 16 + Math.random() * 44, // 16–60vh
      }),
    );
    setLayout(
      items.map((_, i) => {
        const c = centres[i % centres.length];
        return {
          left: Math.min(84, Math.max(52, c.x + (Math.random() - 0.5) * 12)),
          top: Math.min(70, Math.max(6, c.y + (Math.random() - 0.5) * 18)),
          w: 6 + Math.random() * 4,
          rot: (Math.random() - 0.5) * 8,
          par: 0.03 + Math.random() * 0.09,
          z: 1 + Math.floor(Math.random() * items.length),
          conf: (0.62 + Math.random() * 0.37).toFixed(2),
        };
      }),
    );
  }, [items]);

  // parallax + association lines + scroll-velocity datamosh, updated on scroll
  useEffect(() => {
    if (!layout) return;
    const field = fieldRef.current;
    if (!field) return;
    const blobs = [...field.querySelectorAll<HTMLElement>(".blob")];
    const lines = [...field.querySelectorAll<SVGLineElement>("line")];
    const disp = field.querySelector<SVGElement>("#blob-distort feDisplacementMap");

    let raf = 0;
    let dScale = 0; // displacement amount — spikes with scroll speed
    let lastY = window.scrollY;
    let lastT = performance.now();
    let decayRaf = 0;

    const decay = () => {
      dScale *= 0.86;
      if (dScale < 0.5) {
        dScale = 0;
        decayRaf = 0;
      } else {
        decayRaf = requestAnimationFrame(decay);
      }
      disp?.setAttribute("scale", dScale.toFixed(1));
    };

    const update = () => {
      raf = 0;
      blobs.forEach((b, i) => {
        const l = layout[i];
        if (!l) return;
        b.style.transform = `translateY(${-window.scrollY * l.par}px) rotate(${l.rot}deg)`;
      });
      // connect consecutive detections of the same project
      let li = 0;
      for (let i = 1; i < blobs.length; i++) {
        if (items[i].slug !== items[i - 1].slug) continue;
        const a = blobs[i - 1].getBoundingClientRect();
        const b = blobs[i].getBoundingClientRect();
        const ln = lines[li++];
        if (!ln) break;
        ln.setAttribute("x1", String(a.left + a.width / 2));
        ln.setAttribute("y1", String(a.top + a.height / 2));
        ln.setAttribute("x2", String(b.left + b.width / 2));
        ln.setAttribute("y2", String(b.top + b.height / 2));
      }
      // datamosh: scroll velocity tears the images, settling when you stop
      const now = performance.now();
      const vel =
        (Math.abs(window.scrollY - lastY) / Math.max(1, now - lastT)) * 16;
      lastY = window.scrollY;
      lastT = now;
      dScale = Math.min(70, Math.max(dScale, vel * 2.2));
      disp?.setAttribute("scale", dScale.toFixed(1));
      if (dScale > 0.5 && !decayRaf && !document.hidden) {
        decayRaf = requestAnimationFrame(decay);
      }
    };
    const onScroll = () => {
      // rAF is suspended in hidden tabs — update directly there so state
      // is correct the moment the tab becomes visible
      if (document.hidden) {
        update();
      } else if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };
    const onVis = () => update();
    update();
    // line endpoints depend on image heights — re-measure as images land
    blobs.forEach((b) => {
      const im = b.querySelector("img");
      if (im && !im.complete) im.addEventListener("load", onVis, { once: true });
    });
    const settleT = setTimeout(update, 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (decayRaf) cancelAnimationFrame(decayRaf);
      clearTimeout(settleT);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [layout, items]);

  if (!layout) return null;

  const linkCount = items.filter(
    (it, i) => i > 0 && it.slug === items[i - 1].slug,
  ).length;

  return (
    <div ref={fieldRef} className="scatter-field" aria-hidden>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="blob-distort">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.09"
            numOctaves="2"
            seed="7"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <svg className="blob-links">
        {Array.from({ length: linkCount }, (_, i) => (
          <line key={i} />
        ))}
      </svg>
      {items.map((it, i) => {
        const b = layout[i];
        if (!b) return null;
        return (
          <figure
            key={it.src}
            className="blob"
            style={{
              left: `${b.left.toFixed(2)}vw`,
              top: `${b.top.toFixed(2)}vh`,
              width: `${b.w.toFixed(2)}vw`,
              zIndex: b.z,
            }}
          >
            <span className="blob-label">
              trk_{String(i + 1).padStart(2, "0")} · {it.slug} · {b.conf}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(it.src)} alt="" />
            <span className="blob-meta">
              x{b.left.toFixed(0)} y{b.top.toFixed(0)} · {it.year}
            </span>
          </figure>
        );
      })}
    </div>
  );
}
