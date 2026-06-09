import { notFound } from "next/navigation";
import { Container } from "@humanberto/ui";
import { PageBlockRenderer } from "@/components/page-builder/block-renderer";
import { getCustomPageBySlug } from "@/lib/page-builder/server";
import { defaultTenantId } from "@/lib/tenant/server";

export const dynamic = "force-dynamic";

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug, defaultTenantId());
  if (!page) notFound();

  return (
    <Container className="max-w-3xl py-24">
      <PageBlockRenderer blocks={page.blocks} />
    </Container>
  );
}
