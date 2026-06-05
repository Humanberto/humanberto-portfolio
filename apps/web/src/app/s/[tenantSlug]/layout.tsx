import { notFound } from "next/navigation";
import { LivingBackground } from "@/components/living-background";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantNav } from "@/components/tenant/tenant-nav";
import { SiteVisibilityProvider } from "@/components/site-visibility/provider";
import { DesignSystemStyles } from "@/components/theme/design-system-styles";
import { getGlobalDesignSystem } from "@/lib/design-system.server";
import { getSite } from "@/lib/site.server";
import { getTenantBySlug } from "@/lib/tenant/server";
import { advocateEnabledFromIntake } from "@/lib/tenant/public-site";
import { getTenantVisibility } from "@/lib/site-visibility.server";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") {
    notFound();
  }

  const [designSystem, site, visibility] = await Promise.all([
    getGlobalDesignSystem(tenant.id),
    getSite(tenant.id),
    getTenantVisibility(tenant.id),
  ]);
  const advocate = advocateEnabledFromIntake(tenant.research_responses ?? undefined);

  return (
    <SiteVisibilityProvider value={visibility}>
      <DesignSystemStyles system={designSystem} />
      <LivingBackground />
      <TenantNav tenantSlug={tenantSlug} site={site} advocate={advocate} />
      <div className="relative z-10">{children}</div>
      <TenantFooter tenantSlug={tenantSlug} site={site} advocate={advocate} />
    </SiteVisibilityProvider>
  );
}
