import type { Block } from "@/types/content";
import { TextBlock } from "./text-block";
import { ImageBlock } from "./image-block";
import { VideoBlock } from "./video-block";
import { GalleryBlock } from "./gallery-block";
import { EmbedBlock } from "./embed-block";
import { QuoteBlock } from "./quote-block";
import { DividerBlock } from "./divider-block";

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.kind) {
    case "text":
      return <TextBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "video":
      return <VideoBlock block={block} />;
    case "gallery":
      return <GalleryBlock block={block} />;
    case "embed":
      return <EmbedBlock block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "divider":
      return <DividerBlock block={block} />;
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockRenderer key={i} block={b} />
      ))}
    </>
  );
}
