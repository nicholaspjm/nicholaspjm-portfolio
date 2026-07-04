"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";

export interface VisualItem {
  src: string;
  slug: string;
  title: string;
  year: string;
}

/**
 * Every work image laid out as a clean, non-overlapping masonry in the
 * blob-tracker frame (bounding box, corner ticks, track label). Images sit
 * straight; the order is reshuffled on each visit. Each detection links to
 * its work, with a hover CTA prompting the click-through.
 */
export function VisualField({ items }: { items: VisualItem[] }) {
  const [order, setOrder] = useState<number[] | null>(null);

  useEffect(() => {
    // Reshuffle client-side so the arrangement is random each visit. Deferred
    // to a frame so the state update isn't synchronous in the effect body.
    const raf = requestAnimationFrame(() => {
      const idx = items.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      setOrder(idx);
    });
    return () => cancelAnimationFrame(raf);
  }, [items]);

  if (!order) return null;

  return (
    <div className="visual-field">
      {order.map((idx, n) => {
        const it = items[idx];
        return (
          <Link
            key={`${it.src}-${idx}`}
            href={`/work/${it.slug}`}
            className="vblob"
          >
            <span className="blob-label">
              trk_{String(n + 1).padStart(2, "0")} · {it.slug}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(it.src)} alt={it.title} />
            <span className="blob-meta">
              {it.title} · {it.year}
            </span>
            <span className="vblob-cta">open work ↗</span>
          </Link>
        );
      })}
    </div>
  );
}
