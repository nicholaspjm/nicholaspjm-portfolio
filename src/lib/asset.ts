/**
 * Prefix a root-absolute public asset path with the deploy base path.
 *
 * next/link and next/image apply basePath automatically; raw `fetch()` and
 * plain `<img src>` do not — use this for those. NEXT_PUBLIC_BASE_PATH is
 * inlined at build time (empty in local dev, "/nicholaspjm-portfolio" in CI).
 */
export function asset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return path.startsWith("/") ? `${base}${path}` : path;
}
