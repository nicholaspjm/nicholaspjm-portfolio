import type { EmbedBlock as Block } from "@/types/content";

export function EmbedBlock({ block }: { block: Block }) {
  const ratio = block.ratio ?? "16/9";
  return (
    <figure className="w-full py-4">
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
    </figure>
  );
}
