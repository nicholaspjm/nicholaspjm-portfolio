import type { Experiment } from "@/types/content";

import { experiment as particles } from "./particles";
import { experiment as asciiFlow } from "./ascii-flow";
import { experiment as gridPulse } from "./grid-pulse";
import { experiment as blobMini } from "./blob-mini";

export const experiments: Experiment[] = [
  particles,
  asciiFlow,
  gridPulse,
  blobMini,
];
