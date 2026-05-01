import type { Metadata } from "next";
import Link from "next/link";
import { getAllExperiments } from "@/lib/experiments";

export const metadata: Metadata = {
  title: "Lab",
  description: "A drawer of code experiments — shaders, particles, type tests.",
};

export default function LabPage() {
  const experiments = getAllExperiments();
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-16 md:px-10">
      <header className="mb-10 border-b border-rule pb-6">
        <p className="caption">Lab — release notes</p>
        <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-tight">
          Code experiments
        </h1>
        <p className="mt-3 max-w-[60ch] font-serif text-lg text-ink-soft">
          Quick sketches in shaders, particles, and 2D canvas. Each runs live
          in the browser. Move your cursor.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {experiments.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/lab/${e.slug}`}
              className="group block border border-rule p-5 transition-colors hover:border-link"
            >
              <p className="caption flex items-center justify-between">
                <span>{e.year}</span>
                <span>{e.tags?.join(" / ")}</span>
              </p>
              <h2 className="mt-3 font-serif text-2xl leading-tight group-hover:text-link">
                {e.title}
              </h2>
              <p className="mt-2 max-w-[52ch] text-ink-soft">{e.summary}</p>
              <p className="caption mt-4 text-link">Run experiment →</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
