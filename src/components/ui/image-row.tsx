"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { editableText } from "@/content/editable-text";
import { isEditorEnabled, getEditMode, subscribe } from "@/lib/edit-store";

export interface RowImage {
  src: string;
  caption?: string;
  alt?: string;
  /** When set, the image links through to /work/<slug>. */
  slug?: string;
}

type Size = "S" | "M" | "L";
const SIZE_CLASS: Record<Size, string> = { S: "", M: " size-m", L: " size-l" };

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
}: {
  images: RowImage[];
  sizeClass: string; // "" | " size-m" | " size-l"
  title: string;
  oneOnMobile?: boolean;
  resizeId?: string;
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
          return (
            <figure
              key={img.src}
              className="image-module"
              style={hidden ? { visibility: "hidden" } : undefined}
            >
              {img.slug ? (
                <Link href={`/work/${img.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(img.src)} alt={alt} />
                </Link>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset(img.src)} alt={alt} />
              )}
            </figure>
          );
        })}
      </div>
    </>
  );
}
