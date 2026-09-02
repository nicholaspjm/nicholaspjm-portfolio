import type { VideoBlock as Block } from "@/types/content";
import { asset } from "@/lib/asset";

/**
 * A body video on a project page. Same reasoning as ImageBlock: no forced
 * aspect box and no object-cover, so nothing is cropped and nothing is scaled
 * past its own resolution. The cap keeps a clip from taking the whole screen.
 */
export function VideoBlock({ block }: { block: Block }) {
  const auto = block.autoplay ?? true;
  return (
    <figure className="blockmedia">
      <video
        src={asset(block.src)}
        poster={block.poster ? asset(block.poster) : undefined}
        autoPlay={auto}
        muted={auto}
        loop={auto}
        playsInline
        controls={!auto}
        preload="metadata"
      />
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}
