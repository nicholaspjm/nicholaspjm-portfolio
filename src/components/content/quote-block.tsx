import type { QuoteBlock as Block } from "@/types/content";

export function QuoteBlock({ block }: { block: Block }) {
  return (
    <section className="w-full max-w-[72ch] py-8">
      <blockquote className="max-w-[60ch] border-l-2 border-link pl-6">
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
