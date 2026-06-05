import { Container } from "@humanberto/ui";
import { WorkExplorer } from "@/components/work/work-explorer";
import { getProjects } from "@/lib/projects.server";
import { requireTenantSite } from "@/lib/tenant/require-tenant-site";
import { tenantFitCheckHref, tenantWorkPath } from "@/lib/tenant/public-site";

export const dynamic = "force-dynamic";

export default async function TenantWorkPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const ctx = await requireTenantSite(tenantSlug);
  const projects = await getProjects(ctx.tenant.id);

  return (
    <div className="pt-32 pb-24">
      <Container>
        <WorkExplorer
          projects={projects}
          projectHref={(slug) => tenantWorkPath(tenantSlug, slug)}
          fitCheckHref={
            ctx.advocate ? tenantFitCheckHref(tenantSlug) : undefined
          }
        />
      </Container>
    </div>
  );
}
