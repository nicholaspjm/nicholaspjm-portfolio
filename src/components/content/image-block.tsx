import Image from "next/image";
import type { ImageBlock as Block } from "@/types/content";

export function ImageBlock({ block }: { block: Block }) {
  const ratio = block.ratio ?? "3/2";
  return (
    <figure className="w-full py-4">
      <div
        className="relative w-full overflow-hidden border border-rule bg-paper-soft"
        style={{ aspectRatio: ratio }}
      >
        <Image
          src={block.src}
          alt={block.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </figure>
  );
}
