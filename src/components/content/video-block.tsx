import type { VideoBlock as Block } from "@/types/content";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/asset";

export function VideoBlock({ block }: { block: Block }) {
  const layout = block.layout ?? "center";
  const auto = block.autoplay ?? true;
  const wrap = cn(
    "mx-auto w-full px-6 py-6 md:px-10",
    layout === "bleed" && "max-w-none px-0 md:px-0",
    layout === "center" && "max-w-[1100px]",
    layout === "inset" && "max-w-[760px]",
  );
  const ratio = block.ratio ?? "16/9";
  return (
    <figure className={wrap}>
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
      {block.caption && (
        <figcaption className="caption mt-2 text-ink-soft">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
