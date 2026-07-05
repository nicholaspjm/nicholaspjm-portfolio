import type { QuoteBlock as Block } from "@/types/content";

export function QuoteBlock({ block }: { block: Block }) {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-6 py-12 md:px-10">
      <blockquote className="mx-auto max-w-[60ch] border-l-2 border-link pl-6">
        <p className="font-serif text-[1.5rem] italic leading-snug">
          &ldquo;{block.text}&rdquo;
        </p>
        {block.cite && (
          <cite className="caption mt-3 block not-italic text-ink-soft">
            {block.cite}
          </cite>
        )}
      </blockquote>
    </section>
  );
}
