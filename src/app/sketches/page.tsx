import type { Metadata } from "next";
import { NavButton } from "@/components/ui/nav-button";

export const metadata: Metadata = {
  title: "Sketches",
  description: "Work made just for fun.",
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
        <br />
        <i>
          Work made just for fun — instruments, ports, and studies that
          escaped the client folder. Being re-catalogued; new work lands here
          soon.
        </i>
      </p>
    </>
  );
}
