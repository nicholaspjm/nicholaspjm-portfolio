import Image from "next/image";
import type { GalleryBlock as Block } from "@/types/content";
import { cn } from "@/lib/cn";

export function GalleryBlock({ block }: { block: Block }) {
  const cols = block.columns ?? 2;
  return (
    <section className="mx-auto w-full max-w-[1400px] px-6 py-6 md:px-10">
      <div
        className={cn(
          "grid gap-3",
          cols === 2 && "md:grid-cols-2",
          cols === 3 && "md:grid-cols-3",
          cols === 4 && "md:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {block.items.map((it, i) => (
          <figure
            key={i}
            className="relative w-full overflow-hidden border border-rule bg-paper-soft"
            style={{ aspectRatio: it.ratio ?? "1/1" }}
          >
            <Image
              src={it.src}
              alt={it.alt}
              fill
              sizes="(min-width: 768px) 600px, 100vw"
              className="object-cover"
            />
          </figure>
        ))}
      </div>
      {block.caption && (
        <p className="caption mt-3 text-ink-soft">{block.caption}</p>
      )}
    </section>
  );
}
