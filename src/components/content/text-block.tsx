import type { TextBlock as Block } from "@/types/content";
import { cn } from "@/lib/cn";

export function TextBlock({ block }: { block: Block }) {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-10">
      <div className={cn("prose", block.lead && "max-w-[60ch] text-[1.25rem] leading-[1.4]")}>
        {block.heading && (
          <h2 className="caption mb-4 text-ink-soft">{block.heading}</h2>
        )}
        {block.paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
        ))}
      </div>
    </section>
  );
}
