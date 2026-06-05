import "server-only";
import { notFound } from "next/navigation";
import { getContentOverride } from "@/lib/admin/content";
import { getSite } from "@/lib/site.server";
import { getTenantBySlug } from "@/lib/tenant/server";
import { BOOTSTRAP_TENANT_SLUG, tenantPublicPath } from "@/lib/tenant/constants";
import { advocateEnabledFromIntake } from "@/lib/tenant/public-site";

export type TenantAboutContent = {
  intro: string;
  focus: string;
  audience: string;
};

export async function requireTenantSite(tenantSlug: string) {
  if (tenantSlug === BOOTSTRAP_TENANT_SLUG) notFound();

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") notFound();

  const [site, aboutOverride] = await Promise.all([
    getSite(tenant.id),
    getContentOverride<TenantAboutContent>("about", tenant.id),
  ]);

  const research = tenant.research_responses as Record<string, string> | null;
  const advocate = advocateEnabledFromIntake(research ?? undefined);

  return {
    tenant,
    site,
    base: tenantPublicPath(tenantSlug),
    tenantSlug,
    advocate,
    about: aboutOverride ?? {
      intro: `${site.name} — ${site.role}`,
      focus: site.tagline,
      audience: "",
    },
  };
}
