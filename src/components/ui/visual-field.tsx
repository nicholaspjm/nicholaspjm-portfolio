"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { ytEmbed } from "@/lib/yt";

export interface VisualItem {
  /** Image path under /public. Omit when `youtube` is set. */
  src?: string;
  /** YouTube video id; renders a muted autoplay embed in the frame instead. */
  youtube?: string;
  start?: number;
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
    // Reshuffle client-side so the arrangement is random each visit. Runs
    // directly in the effect (not rAF) so the field also appears when the
    // page loads in a background tab, where animation frames are suspended.
    const idx = items.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    setOrder(idx);
  }, [items]);

  if (!order) return null;

  return (
    <div className="visual-field">
      {order.map((idx, n) => {
        const it = items[idx];
        return (
          <Link
            key={`${it.src ?? it.youtube}-${idx}`}
            href={`/work/${it.slug}`}
            className="vblob"
          >
            <span className="blob-label">
              trk_{String(n + 1).padStart(2, "0")} · {it.slug}
            </span>
            {it.youtube ? (
              <iframe
                className="yt"
                src={ytEmbed(it.youtube, it.start)}
                title={it.title}
                loading="lazy"
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(it.src!)} alt={it.title} />
            )}
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
