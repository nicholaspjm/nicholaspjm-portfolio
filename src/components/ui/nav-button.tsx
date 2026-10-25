import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * The plain underlined control used for navigation across the site.
 *
 * It used to render a real <button> and call router.push, which looked right
 * but behaved like a control rather than a link: nothing could be cmd-clicked
 * into a new tab, copied as an address, or previewed in the status bar, and a
 * crawler following the site could not see the header at all. It is now an
 * anchor carrying `.navbtn`, which holds exactly the box the `button` rule
 * draws, so it renders identically while behaving like the link it always was.
 *
 * Internal routes go through next/link to keep client-side navigation; a hash
 * jumps natively; anything external opens in a new tab.
 */
export function NavButton({ href, external, className, children }: Props) {
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href);
  const cls = className ? `navbtn ${className}` : "navbtn";

  if (isExternal) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  }

  return (
    <Link className={cls} href={href}>
      {children}
    </Link>
  );
}
