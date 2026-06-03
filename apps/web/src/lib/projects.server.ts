import "server-only";
import { defaultProjects, type Project } from "@/content/projects";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";
import type { AdminProject } from "@/lib/projects.shared";
import { defaultTenantId } from "@/lib/tenant/server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";

export type { AdminProject } from "@/lib/projects.shared";
export {
  emptyProject,
  slugifyTitle,
  PROJECT_STATUSES,
  PROJECT_PILLARS,
  PROJECT_ACCENTS,
} from "@/lib/projects.shared";

function normalizePublished(p: Project): boolean {
  return typeof p.published === "boolean" ? p.published : true;
}

function withPublishedDefaults(items: Project[]): AdminProject[] {
  return items.map((p) => ({
    ...p,
    published: normalizePublished(p),
  }));
}

async function tenantIdForRead(explicit?: string): Promise<string> {
  if (explicit) return explicit;
  const ctx = await resolveOfficeContext();
  return ctx?.tenantId ?? defaultTenantId();
}

/** All projects for the public site (published only). */
export async function getProjects(tenantId?: string): Promise<Project[]> {
  const all = await getAllProjects(tenantId);
  return all.filter((p) => p.published);
}

export async function getFeaturedProjects(tenantId?: string): Promise<Project[]> {
  const visible = await getProjects(tenantId);
  return visible.filter((p) => p.featured);
}

export async function getProject(slug: string, tenantId?: string): Promise<Project | undefined> {
  const visible = await getProjects(tenantId);
  return visible.find((p) => p.slug === slug);
}

/** Full list including hidden — back office only. */
export async function getAllProjects(tenantId?: string): Promise<AdminProject[]> {
  const tid = tenantId ?? (await tenantIdForRead());
  const override = await getContentOverride<Project[]>("projects", tid);
  if (override !== null) return withPublishedDefaults(override);
  if (tid === defaultTenantId()) return withPublishedDefaults(defaultProjects);
  return [];
}

export async function saveAllProjects(
  projects: AdminProject[],
  tenantId?: string,
): Promise<boolean> {
  const tid = tenantId ?? (await tenantIdForRead());
  return setContentOverride("projects", projects, tid);
}
