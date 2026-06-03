import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@humanberto/ui";
import { getFeaturedProjects } from "@/lib/projects.server";
import { getSite } from "@/lib/site.server";
import { getTenantBySlug } from "@/lib/tenant/server";
import { BOOTSTRAP_TENANT_SLUG, tenantPublicPath } from "@/lib/tenant/constants";

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  if (tenantSlug === BOOTSTRAP_TENANT_SLUG) {
    return notFound();
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") notFound();

  const [site, projects] = await Promise.all([
    getSite(tenant.id),
    getFeaturedProjects(tenant.id),
  ]);

  return (
    <div className="pt-32 pb-20">
        <Container>
          <p className="text-xs uppercase tracking-widest text-gold">{site.role}</p>
          <h1 className="mt-4 font-display text-4xl font-light">{site.name}</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">{site.tagline}</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {projects.map((p) => (
              <Link
                key={p.slug}
                href={`${tenantPublicPath(tenantSlug)}/work/${p.slug}`}
                className="rounded-2xl border border-line p-6 hover:border-gold/40"
              >
                <h2 className="font-display text-xl">{p.title}</h2>
                <p className="mt-2 text-sm text-muted">{p.tagline}</p>
              </Link>
            ))}
          </div>
          {projects.length === 0 && (
            <p className="text-muted">Projects coming soon — owner is still building.</p>
          )}
        </Container>
      </div>
  );
}
