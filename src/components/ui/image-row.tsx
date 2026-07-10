"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { ytEmbed } from "@/lib/yt";
import { editableText } from "@/content/editable-text";
import { isEditorEnabled, getEditMode, subscribe } from "@/lib/edit-store";

export interface RowImage {
  /** Image path under /public. Omit when `youtube` is set. */
  src?: string;
  /** YouTube video id. Renders a muted, autoplaying, looping embed instead. */
  youtube?: string;
  /** Local video path. Renders a muted, autoplaying (in-view) looping clip. */
  video?: string;
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

/** Stable identity for a row item: its filename or video id. */
const itemKey = (img: RowImage) =>
  (img.src ?? img.video ?? img.youtube ?? "").split("/").pop() ?? "";

/**
 * Single-row image strip. The row wraps in CSS and clips everything past the
 * first line with max-height, so an image either shows whole or not at all —
 * never cut mid-image (no measuring, works before/after any media loads).
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

  // Per-image hiding, saved as rowhide.<resizeId>. Hidden items are dropped
  // on the live build; localhost keeps them dimmed and marked.
  const [hidden, setHidden] = useState<Set<string>>(
    () =>
      new Set(
        (resizeId ? (editableText[`rowhide.${resizeId}`] ?? "") : "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
  );
  const toggleHide = (k: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  // Play gallery videos only while actually visible on screen. Clips clipped
  // away below the row's max-height never intersect, so they stay paused.
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
          <span
            data-edit-id={`rowhide.${resizeId}`}
            data-edit-default=""
            data-edit-value={[...hidden].sort().join(",")}
            hidden
          />
        </div>
      )}
      <div
        ref={ref}
        className={`image-row${cls}${oneOnMobile ? " one-mobile" : ""}`}
      >
        {images.map((img, i) => {
          const alt = img.alt ?? img.caption ?? title;
          const ik = itemKey(img);
          const isHidden = hidden.has(ik);
          // Live build drops hidden items; localhost keeps them visible
          // (dimmed + marked) so what's hidden stays obvious while working.
          if (isHidden && !isEditorEnabled) return null;
          // Index-qualified: two works can share a file (e.g. a feature that
          // reuses another project's photos), so the path alone can collide.
          const key = `${img.src ?? img.video ?? img.youtube ?? ""}-${i}`;
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
          ) : img.video ? (
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
          const figCls = `image-module${isHidden ? " im-hidden" : ""}`;
          // Edit mode: unlinked, with a per-image hide/show toggle.
          if (resizable) {
            return (
              <figure key={key} className={figCls}>
                {media}
                {isHidden && <span className="im-hiddenmark">hidden on live</span>}
                <button className="img-hide" onClick={() => toggleHide(ik)}>
                  {isHidden ? "show" : "hide"}
                </button>
              </figure>
            );
          }
          return (
            <figure key={key} className={figCls}>
              {isHidden && <span className="im-hiddenmark">hidden on live</span>}
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
