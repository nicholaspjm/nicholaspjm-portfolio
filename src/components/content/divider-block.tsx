import type { DividerBlock as Block } from "@/types/content";

export function DividerBlock({ block }: { block: Block }) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-10">
      <div className="flex items-center gap-4">
        <hr className="flex-1 border-t border-rule" />
        {block.label && <span className="caption">{block.label}</span>}
        <hr className="flex-1 border-t border-rule" />
      </div>
    </div>
  );
}
