import { notFound } from "next/navigation";
import { LivingBackground } from "@/components/living-background";
import { TenantFooter } from "@/components/tenant/tenant-footer";
import { TenantNav } from "@/components/tenant/tenant-nav";
import { DesignSystemStyles } from "@/components/theme/design-system-styles";
import { getGlobalDesignSystem } from "@/lib/design-system.server";
import { getSite } from "@/lib/site.server";
import { getTenantBySlug } from "@/lib/tenant/server";
import { advocateEnabledFromIntake } from "@/lib/tenant/public-site";

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

  const [designSystem, site] = await Promise.all([
    getGlobalDesignSystem(tenant.id),
    getSite(tenant.id),
  ]);
  const advocate = advocateEnabledFromIntake(tenant.research_responses ?? undefined);

  return (
    <>
      <DesignSystemStyles system={designSystem} />
      <LivingBackground />
      <TenantNav tenantSlug={tenantSlug} site={site} advocate={advocate} />
      <div className="relative z-10">{children}</div>
      <TenantFooter tenantSlug={tenantSlug} site={site} advocate={advocate} />
    </>
  );
}
