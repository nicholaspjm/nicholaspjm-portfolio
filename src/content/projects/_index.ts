import type { Project } from "@/types/content";

import { project as signalArchive } from "./signal-archive";
import { project as halftoneType } from "./halftone-type";
import { project as roomTone } from "./room-tone";
import { project as fieldMonitor } from "./field-monitor";
import { project as paperBeacon } from "./paper-beacon";
import { project as printRuns } from "./print-runs";

export const projects: Project[] = [
  signalArchive,
  halftoneType,
  roomTone,
  fieldMonitor,
  paperBeacon,
  printRuns,
];
