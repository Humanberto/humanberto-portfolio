import { BuildGuide } from "@/components/tenant/build-guide";
import { TenantHome } from "@/components/tenant/tenant-home";
import { getFeaturedProjects } from "@/lib/projects.server";
import { requireTenantSite } from "@/lib/tenant/require-tenant-site";
import { tenantPublicPath } from "@/lib/tenant/constants";

export const dynamic = "force-dynamic";

export default async function TenantHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { tenantSlug } = await params;
  const { welcome } = await searchParams;
  const ctx = await requireTenantSite(tenantSlug);
  const projects = await getFeaturedProjects(ctx.tenant.id);

  return (
    <>
      <TenantHome
        tenantSlug={tenantSlug}
        site={ctx.site}
        projects={projects}
        about={ctx.about}
        advocate={ctx.advocate}
      />
      <BuildGuide
        tenantId={ctx.tenant.id}
        tenantSlug={tenantSlug}
        show={welcome === "1"}
      />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const ctx = await requireTenantSite(tenantSlug);
  return {
    title: `${ctx.site.name} — ${ctx.site.role}`,
    description: ctx.site.tagline,
    alternates: { canonical: tenantPublicPath(tenantSlug) },
  };
}
