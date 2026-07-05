"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { editableText } from "@/content/editable-text";
import { isEditorEnabled, getEditMode, subscribe } from "@/lib/edit-store";

export interface RowImage {
  /** Image path under /public. Omit when `youtube` is set. */
  src?: string;
  /** YouTube video id. Renders a muted, autoplaying, looping embed instead. */
  youtube?: string;
  /** Optional start time (seconds) for the embed. */
  start?: number;
  caption?: string;
  alt?: string;
  /** When set, the item links through to /work/<slug>. */
  slug?: string;
  /** Preview-zone JSON for this item's work (drives the hover preview). */
  prev?: string;
}

type Size = "S" | "M" | "L";
const SIZE_CLASS: Record<Size, string> = { S: "", M: " size-m", L: " size-l" };

/** Muted, autoplaying, looping, chromeless YouTube embed URL. */
function ytEmbed(id: string, start?: number) {
  const q = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: id,
    playsinline: "1",
    modestbranding: "1",
    rel: "0",
  });
  if (start) q.set("start", String(start));
  return `https://www.youtube.com/embed/${id}?${q.toString()}`;
}

/**
 * Single-row image strip. Images that don't fully fit within the row width are
 * hidden entirely (kept in layout but invisible) rather than clipped in half.
 * When `resizeId` is set, the dev editor shows S/M/L size presets above the row
 * whose choice saves (keyed imgsize.<resizeId>) and applies everywhere.
 */
export function ImageRow({
  images,
  sizeClass,
  title,
  oneOnMobile = false,
  resizeId,
  rowSlug,
  rowPrev,
}: {
  images: RowImage[];
  sizeClass: string; // "" | " size-m" | " size-l"
  title: string;
  oneOnMobile?: boolean;
  resizeId?: string;
  /** When every image belongs to one work (e.g. a Selected Works row), the
   *  slug + preview JSON to link and preview to. Per-image slug/prev win. */
  rowSlug?: string;
  rowPrev?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [firstHidden, setFirstHidden] = useState<number | null>(null);
  const editMode = useSyncExternalStore(subscribe, getEditMode, () => false);

  const initial: Size = sizeClass.includes("size-l")
    ? "L"
    : sizeClass.includes("size-m")
      ? "M"
      : "S";
  const override = resizeId
    ? (editableText[`imgsize.${resizeId}`] as Size | undefined)
    : undefined;
  const [size, setSize] = useState<Size>(override ?? initial);
  const cls = SIZE_CLASS[size];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const figs = [...el.querySelectorAll<HTMLElement>(".image-module")];
      const cRight = el.getBoundingClientRect().right;
      let fh: number | null = null;
      for (let i = 0; i < figs.length; i++) {
        if (figs[i].getBoundingClientRect().right > cRight + 1) {
          fh = i;
          break;
        }
      }
      setFirstHidden(fh);
    };
    const raf = requestAnimationFrame(measure);
    const imgs = [...el.querySelectorAll("img")];
    imgs.forEach((im) => {
      if (!im.complete) im.addEventListener("load", measure);
    });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      imgs.forEach((im) => im.removeEventListener("load", measure));
    };
  }, [images, size]);

  if (images.length === 0) return null;

  const resizable = isEditorEnabled && editMode && !!resizeId;

  return (
    <>
      {resizable && (
        <div className="img-resize">
          size:
          {(["S", "M", "L"] as Size[]).map((s) => (
            <button
              key={s}
              className={s === size ? "on" : ""}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
          <span
            data-edit-id={`imgsize.${resizeId}`}
            data-edit-default={initial}
            data-edit-value={size}
            hidden
          />
        </div>
      )}
      <div
        ref={ref}
        className={`image-row${cls}${oneOnMobile ? " one-mobile" : ""}`}
      >
        {images.map((img, i) => {
          const hidden = firstHidden !== null && i >= firstHidden;
          const alt = img.alt ?? img.caption ?? title;
          const key = img.src ?? img.youtube ?? String(i);
          // Per-image slug/preview win; otherwise fall back to the row's work
          // (Selected Works rows carry rowSlug/rowPrev for all their images).
          const slug = img.slug ?? rowSlug;
          const prev = img.prev ?? rowPrev;
          const media = img.youtube ? (
            <iframe
              className="yt"
              src={ytEmbed(img.youtube, img.start)}
              title={alt}
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(img.src!)} alt={alt} />
          );
          return (
            <figure
              key={key}
              className="image-module"
              style={hidden ? { visibility: "hidden" } : undefined}
            >
              {slug ? (
                <Link
                  href={`/work/${slug}`}
                  className={img.youtube ? "yt-link" : undefined}
                  data-prev={prev}
                  data-work={slug}
                >
                  {media}
                </Link>
              ) : (
                media
              )}
            </figure>
          );
        })}
      </div>
    </>
  );
}
