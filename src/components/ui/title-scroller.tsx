"use client";

import { useEffect } from "react";

/**
 * Rotates document.title one character at a time, exactly like
 * mindyseu.com's titleScroller. Runs forever; cheap.
 */
export function TitleScroller({ text }: { text: string }) {
  useEffect(() => {
    let title = text;
    const id = setInterval(() => {
      title = title.slice(1) + title.slice(0, 1);
      document.title = title;
    }, 500);
    return () => clearInterval(id);
  }, [text]);
  return null;
}
