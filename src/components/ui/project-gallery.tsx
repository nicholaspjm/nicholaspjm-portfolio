"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { asset } from "@/lib/asset";
import { editableText } from "@/content/editable-text";
import { isEditorEnabled, getEditMode, subscribe } from "@/lib/edit-store";
import type { RowImage } from "./image-row";

type Size = "S" | "M" | "L";
const SIZES: Size[] = ["S", "M", "L"];
const DEFAULT_SIZE: Size = "M";

/** Stable identity for an image/clip: its filename. */
function keyOf(img: RowImage): string {
  const p = img.src ?? img.video ?? img.youtube ?? "";
  return p.split("/").pop() || p;
}

interface Item {
  img: RowImage;
  key: string;
  size: Size;
}

/** Parse the saved "key:M,key2:S" config into order + per-key size. */
function parseConfig(raw: string | undefined) {
  const order: string[] = [];
  const sizes: Record<string, Size> = {};
  if (raw) {
    for (const part of raw.split(",")) {
      const [k, s] = part.split(":");
      if (!k) continue;
      order.push(k);
      if (s === "S" || s === "M" || s === "L") sizes[k] = s;
    }
  }
  return { order, sizes };
}

/**
 * Full-width, wrapping project gallery that shows every image and clip. In the
 * dev editor each item gains reorder (◀ ▶) and size (S/M/L) controls; the
 * resulting order + sizes save to editable-text.json under gallery.<slug> and
 * ride along with the next push. Videos autoplay muted only while on screen.
 */
export function ProjectGallery({
  slug,
  images,
  title,
}: {
  slug: string;
  images: RowImage[];
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const editMode = useSyncExternalStore(subscribe, getEditMode, () => false);

  const initial = useMemo<Item[]>(() => {
    const { order, sizes } = parseConfig(editableText[`gallery.${slug}`]);
    const byKey = new Map(images.map((im) => [keyOf(im), im]));
    const out: Item[] = [];
    const seen = new Set<string>();
    // saved order first...
    for (const k of order) {
      const img = byKey.get(k);
      if (img && !seen.has(k)) {
        out.push({ img, key: k, size: sizes[k] ?? DEFAULT_SIZE });
        seen.add(k);
      }
    }
    // ...then anything new dropped into the folder since.
    for (const im of images) {
      const k = keyOf(im);
      if (!seen.has(k)) {
        out.push({ img: im, key: k, size: DEFAULT_SIZE });
        seen.add(k);
      }
    }
    return out;
  }, [slug, images]);

  const [items, setItems] = useState<Item[]>(initial);

  // Play clips only while on screen so a page full of video stays light.
  useEffect(() => {
    const el = ref.current;
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
  }, [items]);

  if (items.length === 0) return null;

  const editing = isEditorEnabled && editMode;

  const move = (i: number, d: number) =>
    setItems((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const resize = (i: number, s: Size) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, size: s } : it)));

  const serialized = items.map((it) => `${it.key}:${it.size}`).join(",");
  const defaultSerialized = images
    .map((im) => `${keyOf(im)}:${DEFAULT_SIZE}`)
    .join(",");

  return (
    <div className="project-gallery" ref={ref}>
      {items.map((it, i) => {
        const img = it.img;
        const alt = img.alt ?? title;
        const media = img.video ? (
          <video
            className="vid"
            src={asset(img.video)}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={alt}
          />
        ) : img.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(img.src)} alt={alt} />
        ) : null;
        return (
          <figure key={it.key} className={`gallery-item size-${it.size.toLowerCase()}`}>
            {media}
            {editing && (
              <div className="gallery-ctl">
                <button onClick={() => move(i, -1)} disabled={i === 0} title="Move left">
                  ◀
                </button>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    className={s === it.size ? "on" : ""}
                    onClick={() => resize(i, s)}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  title="Move right"
                >
                  ▶
                </button>
              </div>
            )}
          </figure>
        );
      })}
      {editing && (
        <span
          data-edit-id={`gallery.${slug}`}
          data-edit-default={defaultSerialized}
          data-edit-value={serialized}
          hidden
        />
      )}
    </div>
  );
}
