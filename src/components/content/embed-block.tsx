import type { EmbedBlock as Block } from "@/types/content";

export function EmbedBlock({ block }: { block: Block }) {
  const ratio = block.ratio ?? "16/9";
  return (
    <figure className="mx-auto w-full max-w-[1100px] px-6 py-6 md:px-10">
      <div
        className="relative w-full overflow-hidden border border-rule bg-black"
        style={{ aspectRatio: ratio }}
      >
        <iframe
          src={block.url}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
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
