import Link from "next/link";
import { site } from "@/content/site";
import { getListedProjects } from "@/lib/projects";
import { getAllExperiments } from "@/lib/experiments";
import { Marquee } from "@/components/ui/marquee";
import { HeroMount } from "@/components/hero/hero-mount";

export default function Home() {
  const projects = getListedProjects().slice(0, 6);
  const experiments = getAllExperiments().slice(0, 3);
  return (
    <>
      <section className="relative h-[88dvh] min-h-[560px] w-full overflow-hidden border-b border-rule">
        <div className="absolute inset-0">
          <HeroMount />
        </div>
        <div className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-[1400px] flex-col justify-between px-6 py-8 md:px-10">
          <div className="pointer-events-auto flex items-baseline justify-between">
            <p className="caption">
              <span className="mono text-link">●</span> Live · WebGL · move cursor
            </p>
            <p className="caption hidden md:block">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="pointer-events-auto max-w-2xl">
            <h1 className="font-serif text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] tracking-tight">
              {site.name}
            </h1>
            <p className="mt-4 max-w-[44ch] font-serif text-lg leading-snug text-ink">
              {site.tagline}
            </p>
            <p className="caption mt-6">
              <Link href="/work" className="link">
                Index of work →
              </Link>
              <span className="mx-3 text-rule">|</span>
              <Link href="/lab" className="link">
                Code lab →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Marquee>
        Now / 2026 ⟶ Code, motion, print, spatial — open to commissions and
        collaboration. {site.email}
      </Marquee>

      {/* Selected projects — short list teaser */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-16 md:px-10">
        <div className="mb-6 flex items-baseline justify-between border-b border-rule pb-2">
          <h2 className="caption">Selected work</h2>
          <Link href="/work" className="link caption">
            See all
          </Link>
        </div>
        <ul className="divide-y divide-rule">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="grid grid-cols-12 items-baseline gap-3 py-3 transition-colors hover:bg-paper-soft"
              >
                <span className="caption col-span-2 md:col-span-1">{p.year}</span>
                <span className="col-span-7 font-serif text-lg leading-snug md:col-span-6">
                  {p.title}
                </span>
                <span className="caption col-span-3 hidden text-ink-soft md:col-span-3 md:block">
                  {p.summary}
                </span>
                <span className="caption col-span-3 text-right text-ink-soft md:col-span-2">
                  {p.categories.join(" / ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Lab teaser */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-16 md:px-10">
        <div className="mb-6 flex items-baseline justify-between border-b border-rule pb-2">
          <h2 className="caption">From the lab</h2>
          <Link href="/lab" className="link caption">
            All experiments
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {experiments.map((e) => (
            <Link
              key={e.slug}
              href={`/lab/${e.slug}`}
              className="group block border border-rule p-4 transition-colors hover:border-link"
            >
              <p className="caption flex justify-between">
                <span>{e.year}</span>
                <span>{e.tags?.[0]}</span>
              </p>
              <h3 className="mt-2 font-serif text-xl group-hover:text-link">
                {e.title}
              </h3>
              <p className="mt-1 text-sm leading-snug text-ink-soft">
                {e.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
