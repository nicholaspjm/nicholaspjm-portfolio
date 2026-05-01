"use client";

import dynamic from "next/dynamic";

// WebGL has no business on the server — this component lives in client land
// and lazy-imports the canvas so server pages can embed it without flinching.
const HeroCanvas = dynamic(
  () => import("./hero-canvas").then((m) => m.HeroCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 grid place-items-center bg-paper text-ink-soft">
        <span className="caption">[ rendering ]</span>
      </div>
    ),
  },
);

export function HeroMount() {
  return <HeroCanvas />;
}
