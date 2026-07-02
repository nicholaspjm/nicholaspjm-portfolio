/**
 * Corecore noise furniture — server components, zero JS.
 * NoiseRule: a &&&&& divider line, like the book's section breaks.
 * BinaryLine: a faint binary string; pass text to encode it for real.
 */

export function NoiseRule({ char = "&" }: { char?: string }) {
  return <div className="noise">{char.repeat(400)}</div>;
}

export function BinaryLine({ text }: { text: string }) {
  const bits = Array.from(text)
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
  return <div className="binary">{bits}</div>;
}
