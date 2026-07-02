import type { Metadata } from "next";
import { getListedProjects, getCategories } from "@/lib/projects";
import { WorkIndex, type WorkItem } from "./work-index";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  const projects: WorkItem[] = getListedProjects().map((p) => ({
    slug: p.slug,
    title: p.title,
    year: p.year,
    summary: p.summary,
    categories: p.categories,
  }));
  return <WorkIndex projects={projects} cats={getCategories()} />;
}
