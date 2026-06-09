import { notFound } from "next/navigation";
import { Container } from "@humanberto/ui";
import { PageBlockRenderer } from "@/components/page-builder/block-renderer";
import { getCustomPageBySlug } from "@/lib/page-builder/server";
import { getTenantBySlug } from "@/lib/tenant/server";

export const dynamic = "force-dynamic";

export default async function TenantCustomPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; slug: string }>;
}) {
  const { tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") notFound();

  const page = await getCustomPageBySlug(slug, tenant.id);
  if (!page) notFound();

  return (
    <Container className="max-w-3xl py-24">
      <PageBlockRenderer blocks={page.blocks} />
    </Container>
  );
}
