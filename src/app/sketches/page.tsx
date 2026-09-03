import type { Metadata } from "next";
import { Editable } from "@/components/ui/editable";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Sketches, TouchDesigner & real-time experiments",
  description:
    "Self-directed experiments in real-time graphics: TouchDesigner, GLSL and generative systems built outside client work.",
  path: "/sketches/",
});

export default function SketchesPage() {
  return (
    <>

      <h1 className="labelrow">
        <Editable id="label.sketches" as="span" className="extra">
          sketches
        </Editable>
      </h1>
    </>
  );
}
