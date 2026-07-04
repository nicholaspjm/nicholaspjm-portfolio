/**
 * Instant Suspense fallback for a work page. It paints the bluescreen
 * immediately on navigation so the previous page isn't left showing while
 * the route's data loads.
 */
export default function Loading() {
  return (
    <div className="bluepage">
      <p style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: 12 }}>
        loading&hellip;
      </p>
    </div>
  );
}
