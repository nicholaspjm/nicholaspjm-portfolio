/**
 * Old-media style ticker — repeats children to fill, then loops via CSS.
 */
export function Marquee({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden border-y border-rule bg-paper-soft">
      <div className="marquee-track py-2">
        <span className="caption mx-8">{children}</span>
        <span className="caption mx-8">{children}</span>
        <span className="caption mx-8">{children}</span>
        <span className="caption mx-8">{children}</span>
      </div>
    </div>
  );
}
