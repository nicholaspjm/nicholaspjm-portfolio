"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";

export interface RowImage {
  src: string;
  caption?: string;
  alt?: string;
  /** When set, the image links through to /work/<slug>. */
  slug?: string;
}

/**
 * Single-row image strip. Images that don't fully fit within the row width
 * are hidden entirely (kept in layout but made invisible) rather than being
 * clipped in half by the row's overflow.
 */
export function ImageRow({
  images,
  sizeClass,
  title,
  oneOnMobile = false,
}: {
  images: RowImage[];
  sizeClass: string; // "" | " size-m" | " size-l"
  title: string;
  /** On mobile, show only the first image (one per work). */
  oneOnMobile?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [firstHidden, setFirstHidden] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const figs = [
        ...el.querySelectorAll<HTMLElement>(".image-module"),
      ];
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
    // Defer the first measure out of the effect body; re-measure as images
    // land and on resize (widths depend on loaded image dimensions).
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
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div
      ref={ref}
      className={`image-row${sizeClass}${oneOnMobile ? " one-mobile" : ""}`}
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
  );
}
