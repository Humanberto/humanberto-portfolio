import type { Pillar, Project, ProjectStatus } from "@/content/projects";

export type AdminProject = Project & { published: boolean };

export const PROJECT_STATUSES: ProjectStatus[] = [
  "live",
  "in-progress",
  "prototype",
  "case-study",
];

export const PROJECT_PILLARS: Pillar[] = [
  "Product Design",
  "UX/UI Design",
  "Python",
  "Data Engineering",
  "AI/ML",
];

export const PROJECT_ACCENTS = ["gold", "purple"] as const;

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function emptyProject(): AdminProject {
  return {
    slug: "",
    title: "",
    tagline: "",
    year: String(new Date().getFullYear()),
    role: "",
    pillars: [],
    status: "in-progress",
    summary: "",
    problem: "",
    approach: [],
    outcomes: [],
    stack: [],
    links: {},
    featured: false,
    published: false,
    accent: "gold",
  };
}
