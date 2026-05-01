import type { Metadata } from "next";
import { site } from "@/content/site";
import { Hyperlink } from "@/components/ui/hyperlink";

export const metadata: Metadata = { title: "Info" };

export default function InfoPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-16 md:px-10">
      <header className="mb-10 border-b border-rule pb-6">
        <p className="caption">Colophon</p>
        <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-tight">
          Info
        </h1>
      </header>

      <div className="grid gap-12 md:grid-cols-12">
        <section className="md:col-span-7">
          <p className="caption mb-3">Bio</p>
          <div className="prose">
            <p className="text-xl leading-snug">
              {site.name} is a designer, programmer, and image-maker
              working between code and physical media. Practice spans interactive
              installation, generative graphics, motion identity, and printed
              objects.
            </p>
            <p>
              Recent work includes audio-reactive visuals for live shows,
              real-time installations using TouchDesigner and custom hardware,
              and a continuing investigation into how typography behaves in
              motion. Past collaborators include musicians, fashion houses,
              architects, and arts organisations.
            </p>
            <p>
              Available for commissions, art direction, and collaboration. For
              talks, teaching, and press inquiries, write to{" "}
              <Hyperlink href={`mailto:${site.email}`}>{site.email}</Hyperlink>.
            </p>
          </div>
        </section>

        <aside className="md:col-span-5">
          <div className="border border-rule p-5">
            <p className="caption mb-2">Contact</p>
            <ul className="space-y-1">
              <li>
                <Hyperlink href={`mailto:${site.email}`}>{site.email}</Hyperlink>
              </li>
              {site.social.map((s) => (
                <li key={s.href}>
                  <Hyperlink href={s.href}>{s.label}</Hyperlink>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border border-rule p-5">
            <p className="caption mb-2">Currently</p>
            <p className="font-serif">
              Open to commissions for early {new Date().getFullYear() + 1}.
            </p>
          </div>

          <div className="mt-6 border border-rule p-5">
            <p className="caption mb-2">Colophon</p>
            <p className="font-serif text-sm leading-snug">
              Site built with Next.js, React Three Fiber, and Tailwind. Type
              set in EB Garamond and JetBrains Mono. Hero shader is a
              domain-warped fbm rendered as topographic isobands. Source on
              GitHub.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
