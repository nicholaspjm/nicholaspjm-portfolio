import type { Project } from "@/types/content";
import { projects as registry } from "@/content/projects/_index";

export function getAllProjects(): Project[] {
  return [...registry].sort((a, b) => {
    // Sort newest year first; fall back to title.
    const ay = parseInt(a.year, 10) || 0;
    const by = parseInt(b.year, 10) || 0;
    if (by !== ay) return by - ay;
    return a.title.localeCompare(b.title);
  });
}

export function getListedProjects(): Project[] {
  return getAllProjects().filter((p) => !p.unlisted);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return registry.find((p) => p.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return registry.map((p) => p.slug);
}

export function getProjectNeighbors(slug: string) {
  const list = getListedProjects();
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];
  return { prev, next };
}

export function getCategories(): string[] {
  const set = new Set<string>();
  for (const p of getListedProjects()) {
    for (const c of p.categories) set.add(c);
  }
  return Array.from(set).sort();
}
