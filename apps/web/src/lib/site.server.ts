import "server-only";
import { getContentOverride } from "@/lib/admin/content";
import { defaultSite, type SiteConfig } from "@/lib/site";
import { defaultTenantId } from "@/lib/tenant/server";

/** Server-only: merges back-office overrides when present. */
export async function getSite(tenantId?: string): Promise<SiteConfig> {
  const tid = tenantId ?? defaultTenantId();
  const override = await getContentOverride<Partial<SiteConfig>>("site", tid);
  if (!override) return defaultSite;
  return { ...defaultSite, ...override };
}
