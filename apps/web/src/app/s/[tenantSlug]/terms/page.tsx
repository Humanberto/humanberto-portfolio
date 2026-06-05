import { Container } from "@humanberto/ui";
import { requireTenantSite } from "@/lib/tenant/require-tenant-site";

export const dynamic = "force-dynamic";

export default async function TenantTermsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const ctx = await requireTenantSite(tenantSlug);

  return (
    <div className="pt-32 pb-24">
      <Container className="max-w-2xl">
        <h1 className="font-display text-3xl font-light">Terms</h1>
        <p className="mt-6 text-muted">
          Content on this site is provided by {ctx.site.name}. Humanberto Studio hosts
          the platform; the site owner is responsible for their portfolio content.
        </p>
      </Container>
    </div>
  );
}
