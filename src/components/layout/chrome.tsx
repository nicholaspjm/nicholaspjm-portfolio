import Link from "next/link";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

export function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="relative z-10 flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/85 backdrop-blur-[2px]">
      <div className="mx-auto flex w-full max-w-[1400px] items-baseline justify-between px-6 py-3 md:px-10">
        <Link
          href="/"
          className="font-serif text-base tracking-tight hover:text-link"
        >
          {site.name}
          <span className="caption ml-3 hidden text-ink-soft md:inline">
            ({site.shortName})
          </span>
        </Link>
        <nav className="flex items-center gap-5">
          {site.nav
            .filter((n) => n.href !== "/")
            .map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "caption transition-colors hover:text-link",
                  "text-ink",
                )}
              >
                {n.label}
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 mt-24 border-t border-rule bg-paper-soft">
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-6 py-10 md:grid-cols-4 md:px-10">
        <div className="md:col-span-2">
          <p className="font-serif text-lg leading-snug">{site.tagline}</p>
        </div>
        <div>
          <p className="caption mb-2">Elsewhere</p>
          <ul className="space-y-1">
            {site.social.map((s) => (
              <li key={s.href}>
                <a className="link" href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="caption mb-2">Contact</p>
          <a className="link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <p className="caption mt-6">
            © {year} {site.name}.
          </p>
          <p className="caption">Set in EB Garamond &amp; JetBrains Mono.</p>
        </div>
      </div>
    </footer>
  );
}
