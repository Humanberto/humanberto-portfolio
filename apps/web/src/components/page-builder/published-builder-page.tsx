import Link from "next/link";
import { Container } from "@humanberto/ui";
import { PageBlockRenderer } from "@/components/page-builder/block-renderer";
import { getPublishedBuilderPage } from "@/lib/page-builder/server";

export async function PublishedBuilderPage({
  pageId,
  isBootstrap = true,
  tenantId,
  backHref = "/",
}: {
  pageId: string;
  isBootstrap?: boolean;
  tenantId?: string;
  backHref?: string;
}) {
  const page = await getPublishedBuilderPage(pageId, isBootstrap, tenantId);
  if (!page) return null;

  return (
    <div className="pt-32 pb-20">
      <Container className="max-w-3xl">
        <Link href={backHref} className="text-sm text-muted hover:text-fg">
          ← Back
        </Link>
        <div className="mt-8">
          <PageBlockRenderer blocks={page.blocks} />
        </div>
      </Container>
    </div>
  );
}
