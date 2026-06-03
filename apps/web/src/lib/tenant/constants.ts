/** Bootstrap tenant for humanberto.com (Roberto's portfolio). */
export const BOOTSTRAP_TENANT_ID = "00000000-0000-4000-8000-000000000001";
export const BOOTSTRAP_TENANT_SLUG = "humanberto";

export type TenantRow = {
  id: string;
  slug: string;
  display_name: string;
  status: string;
  research_completed_at: string | null;
};

export function tenantPublicPath(slug: string): string {
  if (slug === BOOTSTRAP_TENANT_SLUG) return "/";
  return `/s/${slug}`;
}

export function tenantProjectPath(tenantSlug: string, projectSlug: string): string {
  if (tenantSlug === BOOTSTRAP_TENANT_SLUG) return `/work/${projectSlug}`;
  return `/s/${tenantSlug}/work/${projectSlug}`;
}
