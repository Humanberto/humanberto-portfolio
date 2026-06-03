import { notFound } from "next/navigation";
import { DesignSystemStyles } from "@/components/theme/design-system-styles";
import { getGlobalDesignSystem } from "@/lib/design-system.server";
import { getTenantBySlug } from "@/lib/tenant/server";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") notFound();

  const designSystem = await getGlobalDesignSystem(tenant.id);

  return (
    <>
      <DesignSystemStyles system={designSystem} />
      {children}
    </>
  );
}
