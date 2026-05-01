import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
  /** Open external links in a new tab. Defaults to true if href is absolute. */
  external?: boolean;
}

export function Hyperlink({ href, children, className, external }: Props) {
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn("link", className)}
      >
        {children}
        <span className="caption ml-1 text-ink-soft">↗</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cn("link", className)}>
      {children}
    </Link>
  );
}
