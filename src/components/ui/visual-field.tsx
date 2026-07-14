"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { ytEmbed } from "@/lib/yt";
import { editableText } from "@/content/editable-text";
import { isEditorEnabled, getEditMode, subscribe } from "@/lib/edit-store";

export interface VisualItem {
  /** Image path under /public. Omit when `video` or `youtube` is set. */
  src?: string;
  /** Local clip path; renders a muted, in-view autoplay video in the frame. */
  video?: string;
  /** YouTube video id; renders a muted autoplay embed in the frame instead. */
  youtube?: string;
  start?: number;
  slug: string;
  title: string;
  year: string;
}

/** Stable identity for an item: the media path or the video id. */
const keyOf = (it: VisualItem) => it.src ?? it.video ?? it.youtube ?? "";

/** The scatter renders small; serve the generated thumbnail tier. */
const thumbOf = (src: string) =>
  src.startsWith("/images/projects/")
    ? src.replace("/images/projects/", "/images/thumbs/")
    : src;

/** Parse the saved comma-separated hidden list. */
function initialHidden(): Set<string> {
  return new Set(
    (editableText["visual.hidden"] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/**
 * Every work image laid out as a clean, non-overlapping masonry in the
 * blob-tracker frame (bounding box, corner ticks, track label). Images sit
 * straight; the order is reshuffled on each visit. Each detection links to
 * its work, with a hover CTA prompting the click-through.
 *
 * Items can be hidden from this page: in the dev editor each frame has a
 * hide/show toggle, saved to editable-text.json under visual.hidden. On
 * localhost a hidden item stays visible but dimmed with a "hidden on live"
 * mark; the production build drops it entirely.
 */
export function VisualField({ items }: { items: VisualItem[] }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<number[] | null>(null);
  const editMode = useSyncExternalStore(subscribe, getEditMode, () => false);
  const [hidden, setHidden] = useState<Set<string>>(initialHidden);

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

  // With every clip on one page, play only what is actually on screen.
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const vids = [...el.querySelectorAll<HTMLVideoElement>("video.vid")];
    if (vids.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) void v.play?.().catch(() => {});
          else v.pause?.();
        }
      },
      { threshold: 0.2 },
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
    // editMode swaps frames between links and editable divs, remounting the
    // clips; re-observe so preload="none" videos still get played.
  }, [order, hidden, editMode]);

  if (!order) return null;

  const editing = isEditorEnabled && editMode;
  const toggle = (k: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return (
    <div className="visual-field" ref={fieldRef}>
      {order.map((idx, n) => {
        const it = items[idx];
        const k = keyOf(it);
        const isHidden = hidden.has(k);
        // Hidden items only render while edit mode is on (dimmed + marked,
        // with the toggle). Otherwise the page shows exactly what live shows.
        if (isHidden && !editing) return null;

        const cls = `vblob${isHidden ? " vblob-hidden" : ""}`;
        const inner = (
          <>
            <span className="blob-label">
              trk_{String(n + 1).padStart(2, "0")} · {it.slug}
            </span>
            {isHidden && <span className="vblob-hiddenmark">hidden on live</span>}
            {it.youtube ? (
              <iframe
                className="yt"
                src={ytEmbed(it.youtube, it.start)}
                title={it.title}
                loading="lazy"
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            ) : it.video ? (
              <video
                className="vid"
                src={asset(it.video)}
                muted
                loop
                playsInline
                preload="none"
                aria-label={it.title}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset(thumbOf(it.src!))}
                alt={it.title}
                loading="lazy"
                decoding="async"
              />
            )}
            <span className="blob-meta">
              {it.title} · {it.year}
            </span>
          </>
        );

        // Edit mode: frames become plain divs (no navigation) with the toggle.
        if (editing) {
          return (
            <div key={`${k}-${idx}`} className={cls}>
              {inner}
              <button className="vblob-hide" onClick={() => toggle(k)}>
                {isHidden ? "show" : "hide"}
              </button>
            </div>
          );
        }

        return (
          <Link key={`${k}-${idx}`} href={`/work/${it.slug}`} className={cls}>
            {inner}
            <span className="vblob-cta">open work ↗</span>
          </Link>
        );
      })}
      {editing && (
        <span
          data-edit-id="visual.hidden"
          data-edit-default=""
          data-edit-value={[...hidden].sort().join(",")}
          hidden
        />
      )}
    </div>
  );
}
