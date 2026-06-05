import { Container } from "@humanberto/ui";
import { requireTenantSite } from "@/lib/tenant/require-tenant-site";

export const dynamic = "force-dynamic";

export default async function TenantPrivacyPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const ctx = await requireTenantSite(tenantSlug, { page: "page.privacy" });

  return (
    <div className="pt-32 pb-24">
      <Container className="max-w-2xl prose prose-invert">
        <h1 className="font-display text-3xl font-light">Privacy</h1>
        <p className="mt-6 text-muted">
          {ctx.site.name} operates this portfolio site. Contact{" "}
          {ctx.site.email ? (
            <a href={`mailto:${ctx.site.email}`} className="text-gold-bright">
              {ctx.site.email}
            </a>
          ) : (
            "the site owner"
          )}{" "}
          for privacy questions. Hosted on Humanberto Studio.
        </p>
      </Container>
    </div>
  );
}
