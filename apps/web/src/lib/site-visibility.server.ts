import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getContentOverride } from "@/lib/admin/content";
import { defaultTenantId } from "@/lib/tenant/server";
import {
  isFeatureVisible,
  resolveSiteVisibility,
  type ResolvedSiteVisibility,
  type SiteFeatureId,
  type SiteVisibilityOverrides,
} from "@/lib/site-visibility";

export const getSiteVisibility = cache(
  async (
    tenantId?: string,
    scope: "bootstrap" | "tenant" = "bootstrap",
  ): Promise<ResolvedSiteVisibility> => {
    const tid = tenantId?.trim() || defaultTenantId();
    const raw = await getContentOverride<SiteVisibilityOverrides>("site_visibility", tid);
    return resolveSiteVisibility(scope, raw);
  },
);

export async function getBootstrapVisibility(): Promise<ResolvedSiteVisibility> {
  return getSiteVisibility(defaultTenantId(), "bootstrap");
}

export async function getTenantVisibility(tenantId: string): Promise<ResolvedSiteVisibility> {
  return getSiteVisibility(tenantId, "tenant");
}

export async function requireFeatureVisible(
  tenantId: string,
  scope: "bootstrap" | "tenant",
  featureId: SiteFeatureId,
): Promise<ResolvedSiteVisibility> {
  const visibility = await getSiteVisibility(tenantId, scope);
  if (!isFeatureVisible(visibility, featureId)) notFound();
  return visibility;
}

export async function requireBootstrapPage(featureId: SiteFeatureId): Promise<void> {
  await requireFeatureVisible(defaultTenantId(), "bootstrap", featureId);
}
