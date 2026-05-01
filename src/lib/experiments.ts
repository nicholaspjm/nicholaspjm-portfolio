import type { Experiment } from "@/types/content";
import { experiments as registry } from "@/content/experiments/_index";

export function getAllExperiments(): Experiment[] {
  return [...registry].sort((a, b) => {
    const ay = parseInt(a.year, 10) || 0;
    const by = parseInt(b.year, 10) || 0;
    if (by !== ay) return by - ay;
    return a.title.localeCompare(b.title);
  });
}

export function getExperimentBySlug(slug: string): Experiment | undefined {
  return registry.find((e) => e.slug === slug);
}

export function getAllExperimentSlugs(): string[] {
  return registry.map((e) => e.slug);
}
