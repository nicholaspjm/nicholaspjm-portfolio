import Image from "next/image";
import type { ImageBlock as Block } from "@/types/content";
import { cn } from "@/lib/cn";

export function ImageBlock({ block }: { block: Block }) {
  const layout = block.layout ?? "center";
  const wrap = cn(
    "mx-auto w-full px-6 py-6 md:px-10",
    layout === "bleed" && "max-w-none px-0 md:px-0",
    layout === "center" && "max-w-[1100px]",
    layout === "inset" && "max-w-[760px]",
  );
  const ratio = block.ratio ?? "3/2";
  return (
    <figure className={wrap}>
      <div
        className="relative w-full overflow-hidden border border-rule bg-paper-soft"
        style={{ aspectRatio: ratio }}
      >
        <Image
          src={block.src}
          alt={block.alt}
          fill
          sizes={layout === "bleed" ? "100vw" : "(min-width: 768px) 1100px, 100vw"}
          className="object-cover"
        />
      </div>
      {block.caption && (
        <figcaption className="caption mt-2 text-ink-soft">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
