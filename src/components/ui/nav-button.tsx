"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface Props {
  href: string;
  external?: boolean;
  children: ReactNode;
}

/**
 * Renders a real <button> element (so it picks up the browser's default
 * button styling, exactly like mindyseu.com), and routes via Next.js for
 * internal links or opens in a new tab for external.
 */
export function NavButton({ href, external, children }: Props) {
  const router = useRouter();
  const isExternal =
    external ?? /^(https?:|mailto:|tel:)/.test(href);
  return (
    <button
      onClick={() => {
        if (isExternal) {
          window.open(href, "_blank");
        } else if (href.startsWith("#")) {
          document.getElementById(href.slice(1))?.scrollIntoView();
        } else {
          router.push(href);
        }
      }}
    >
      {children}
      {isExternal && " ↗"}
    </button>
  );
}
