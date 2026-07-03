import type { Metadata } from "next";
import { NavButton } from "@/components/ui/nav-button";

export const metadata: Metadata = {
  title: "Sketches",
  description: "Self-directed experiments in real-time graphics.",
};

export default function SketchesPage() {
  return (
    <>
      <p>
        <NavButton href="/">← index</NavButton>
        <NavButton href="/work">visual work</NavButton>
        <NavButton href="/cv">CV</NavButton>
      </p>

      <p>
        <span className="extra">sketches</span>
      </p>
    </>
  );
}
