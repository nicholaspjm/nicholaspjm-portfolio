export function Chrome({ children }: { children: React.ReactNode }) {
  // <main> rather than <div>: the page's own content, as distinct from the
  // header and backdrop, which screen readers and crawlers look for.
  return <main className="page-frame">{children}</main>;
}
