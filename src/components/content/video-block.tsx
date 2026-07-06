import type { VideoBlock as Block } from "@/types/content";
import { asset } from "@/lib/asset";

export function VideoBlock({ block }: { block: Block }) {
  const auto = block.autoplay ?? true;
  const ratio = block.ratio ?? "16/9";
  return (
    <figure className="w-full py-4">
      <div
        className="relative w-full overflow-hidden border border-rule bg-black"
        style={{ aspectRatio: ratio }}
      >
        <video
          className="h-full w-full object-cover"
          src={asset(block.src)}
          poster={block.poster ? asset(block.poster) : undefined}
          autoPlay={auto}
          muted={auto}
          loop={auto}
          playsInline
          controls={!auto}
        />
      </div>
    </figure>
  );
}
