import { notFound, redirect } from "next/navigation";
import { PageBuilderWorkspace } from "@/components/myoffice/page-builder-workspace";
import { resolvePublicUrl } from "@/lib/page-builder/registry";
import { getPageDocument } from "@/lib/page-builder/server";
import { getTenantById } from "@/lib/tenant/server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const ctx = await resolveOfficeContext();
  if (!ctx) redirect("/myoffice/login");

  const { pageId } = await params;
  const page = await getPageDocument(pageId, ctx.isBootstrapOffice);
  if (!page) notFound();

  const tenant = ctx.isBootstrapOffice ? null : await getTenantById(ctx.tenantId);
  const previewUrl = resolvePublicUrl(page, ctx.isBootstrapOffice, tenant?.slug);

  return <PageBuilderWorkspace initialPage={page} previewUrl={previewUrl} />;
}
