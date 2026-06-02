import "server-only";
import { defaultProjects, type Project } from "@/content/projects";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";
import type { AdminProject } from "@/lib/projects.shared";

export type { AdminProject } from "@/lib/projects.shared";
export {
  emptyProject,
  slugifyTitle,
  PROJECT_STATUSES,
  PROJECT_PILLARS,
  PROJECT_ACCENTS,
} from "@/lib/projects.shared";

function withPublishedDefaults(items: Project[]): AdminProject[] {
  return items.map((p) => ({
    ...p,
    published: p.published !== false,
  }));
}

/** All projects for the public site (published only). */
export async function getProjects(): Promise<Project[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.published);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const visible = await getProjects();
  return visible.filter((p) => p.featured);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const visible = await getProjects();
  return visible.find((p) => p.slug === slug);
}

/** Full list including hidden — back office only. */
export async function getAllProjects(): Promise<AdminProject[]> {
  const override = await getContentOverride<Project[]>("projects");
  const source = override?.length ? override : defaultProjects;
  return withPublishedDefaults(source);
}

export async function saveAllProjects(projects: AdminProject[]): Promise<boolean> {
  return setContentOverride("projects", projects);
}
