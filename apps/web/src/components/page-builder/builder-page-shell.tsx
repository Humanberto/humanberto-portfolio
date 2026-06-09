import { Container } from "@humanberto/ui";
import { PageBlockRenderer } from "@/components/page-builder/block-renderer";
import { getBlocksForSystemPage } from "@/lib/page-builder/server";
import { defaultTenantId } from "@/lib/tenant/server";

export async function BuilderPageShell({
  pageId,
  isBootstrap,
  tenantId,
  children,
}: {
  pageId: string;
  isBootstrap: boolean;
  tenantId?: string;
  children?: React.ReactNode;
}) {
  const blocks = await getBlocksForSystemPage(pageId, isBootstrap, tenantId);
  if (!blocks?.length) return children ?? null;

  return (
    <Container className="max-w-3xl space-y-8 py-24">
      <PageBlockRenderer blocks={blocks} />
      {children}
    </Container>
  );
}

export async function BuilderPageOnly({
  pageId,
  isBootstrap,
  tenantId,
}: {
  pageId: string;
  isBootstrap: boolean;
  tenantId?: string;
}) {
  const blocks = await getBlocksForSystemPage(pageId, isBootstrap, tenantId);
  if (!blocks?.length) return null;

  return (
    <Container className="max-w-3xl space-y-8 py-24">
      <PageBlockRenderer blocks={blocks} />
    </Container>
  );
}

export async function hasBuilderContent(
  pageId: string,
  isBootstrap: boolean,
  tenantId?: string,
): Promise<boolean> {
  const blocks = await getBlocksForSystemPage(pageId, isBootstrap, tenantId);
  return Boolean(blocks?.length);
}
