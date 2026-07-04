"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";

export interface VisualItem {
  src: string;
  slug: string;
  title: string;
  year: string;
}

interface Pos {
  left: number; // % of field width
  top: number; // px
  w: number; // % of field width
  rot: number; // deg
  z: number;
  conf: string;
}

/**
 * Every work image scattered across the page in the blob-tracker look —
 * bounding box, corner ticks, mono track label. Positions are rolled once
 * on mount and then hold still; each detection is a link straight to its
 * work page. A focus on the visuals themselves.
 */
export function VisualField({ items }: { items: VisualItem[] }) {
  const [pos, setPos] = useState<Pos[] | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // Defer to a frame so the state update isn't synchronous in the effect
    // body; positions are client-only (window size + random) and roll once.
    const raf = requestAnimationFrame(() => {
      const vw = window.innerWidth;
      const cols = vw < 700 ? 2 : vw < 1100 ? 3 : 4;
      const rowH = vw < 700 ? 210 : 250; // vertical spacing per row (px)
      const cellW = 100 / cols;
      const p: Pos[] = items.map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const w = cellW * (0.6 + Math.random() * 0.22); // 60–82% of a cell
        const left = Math.min(
          100 - w,
          Math.max(0, col * cellW + (Math.random() - 0.5) * cellW * 0.5),
        );
        const top = 24 + row * rowH + (Math.random() - 0.5) * rowH * 0.5;
        return {
          left,
          top,
          w,
          rot: (Math.random() - 0.5) * 9,
          z: 1 + Math.floor(Math.random() * items.length),
          conf: (0.6 + Math.random() * 0.39).toFixed(2),
        };
      });
      const rows = Math.ceil(items.length / cols);
      setHeight(24 + rows * rowH + 240);
      setPos(p);
    });
    return () => cancelAnimationFrame(raf);
  }, [items]);

  if (!pos) return null;

  return (
    <div className="visual-field" style={{ height }}>
      {items.map((it, i) => {
        const b = pos[i];
        if (!b) return null;
        const style = {
          left: `${b.left.toFixed(2)}%`,
          top: `${b.top.toFixed(0)}px`,
          width: `${b.w.toFixed(2)}%`,
          zIndex: b.z,
          "--rot": `${b.rot.toFixed(2)}deg`,
        } as CSSProperties;
        return (
          <Link
            key={`${it.src}-${i}`}
            href={`/work/${it.slug}`}
            className="vblob"
            style={style}
          >
            <span className="blob-label">
              trk_{String(i + 1).padStart(2, "0")} · {it.slug} · {b.conf}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(it.src)} alt={it.title} />
            <span className="blob-meta">
              {it.title} · {it.year}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
