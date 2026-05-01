"use client";

import dynamic from "next/dynamic";
import type { Experiment } from "@/types/content";

/**
 * Lab experiments are mounted by key. Each one is loaded lazily so an
 * experiment page only ships the GL it actually needs.
 */
const Particles = dynamic(
  () =>
    import("./experiments/particles").then((m) => m.ParticlesExperiment),
  { ssr: false },
);
const AsciiFlow = dynamic(
  () => import("./experiments/ascii-flow").then((m) => m.AsciiFlowExperiment),
  { ssr: false },
);
const GridPulse = dynamic(
  () => import("./experiments/grid-pulse").then((m) => m.GridPulseExperiment),
  { ssr: false },
);
const BlobMini = dynamic(
  () => import("./experiments/blob-mini").then((m) => m.BlobMiniExperiment),
  { ssr: false },
);

export function ExperimentMount({
  component,
}: {
  component: Experiment["component"];
}) {
  switch (component) {
    case "particles":
      return <Particles />;
    case "ascii-flow":
      return <AsciiFlow />;
    case "grid-pulse":
      return <GridPulse />;
    case "blob-mini":
      return <BlobMini />;
  }
}
