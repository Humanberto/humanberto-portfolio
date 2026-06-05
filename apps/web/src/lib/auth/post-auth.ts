import { BOOTSTRAP_TENANT_SLUG, tenantPublicPath, type TenantRow } from "@/lib/tenant/constants";

/** Default path after sign-in when no explicit `next` was requested. */
export function defaultPostAuthPath(tenant: TenantRow | undefined): string {
  if (!tenant) return "/onboarding";
  if (tenant.status === "onboarding") return "/onboarding";
  if (tenant.slug === BOOTSTRAP_TENANT_SLUG) return "/myoffice/studio";
  return tenantPublicPath(tenant.slug);
}

/**
 * Resolve redirect after OAuth/email callback.
 * Honors explicit deep links; otherwise sends new users to onboarding and
 * returning tenants to their public portfolio at /s/{slug}.
 */
export function resolvePostAuthPath(
  tenant: TenantRow | undefined,
  requestedNext: string | null,
): string {
  const next = requestedNext?.trim() || "/onboarding";
  if (!next.startsWith("/") || next.startsWith("//")) return defaultPostAuthPath(tenant);

  const generic = next === "/onboarding" || next === "/myoffice/studio" || next === "/";
  if (generic) return defaultPostAuthPath(tenant);

  return next;
}
