/**
 * Section furniture — server components, zero JS.
 * NoiseRule: a plain hairline divider (the char prop is kept for call-site
 * compatibility but no longer rendered).
 * BinaryLine: a faint binary string; pass text to encode it for real.
 */

export function NoiseRule({ char: _char = "&" }: { char?: string }) {
  return <hr className="rule-line" />;
}

export function BinaryLine({ text }: { text: string }) {
  const bits = Array.from(text)
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
  return <div className="binary">{bits}</div>;
}
