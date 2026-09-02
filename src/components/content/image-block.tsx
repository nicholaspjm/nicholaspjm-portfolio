import type { ImageBlock as Block } from "@/types/content";
import { asset } from "@/lib/asset";
import { imageDims } from "@/content/project-images";

/**
 * A body image on a project page. Sized to its own proportions inside a cap,
 * never stretched to fill.
 *
 * It used to be a full-width box with a forced aspect ratio and object-cover,
 * which did two bad things at once: it cropped whatever did not match the
 * ratio, and on a phone it blew a 640px-tall source across the whole screen,
 * which is why the media read as low quality and overwhelming. Now the file
 * is drawn at its own shape, bounded by the column and by a fraction of the
 * viewport height, and it carries its intrinsic size so the space is reserved
 * before it loads.
 */
export function ImageBlock({ block }: { block: Block }) {
  const d = imageDims[block.src];
  return (
    <figure className="blockmedia">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(block.src)}
        alt={block.alt}
        {...(d ? { width: d[0], height: d[1] } : {})}
        loading="lazy"
        decoding="async"
      />
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}
