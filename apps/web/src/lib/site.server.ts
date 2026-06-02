import "server-only";
import { getContentOverride } from "@/lib/admin/content";
import { defaultSite, type SiteConfig } from "@/lib/site";

/** Server-only: merges back-office overrides when present. */
export async function getSite(): Promise<SiteConfig> {
  const override = await getContentOverride<Partial<SiteConfig>>("site");
  if (!override) return defaultSite;
  return { ...defaultSite, ...override };
}
