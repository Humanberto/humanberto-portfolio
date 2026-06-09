import { redirect } from "next/navigation";
import { PagesDirectory } from "@/components/myoffice/pages-directory";
import { resolvePublicUrl } from "@/lib/page-builder/registry";
import { getPageBuilderStore, listCatalogWithPages } from "@/lib/page-builder/server";
import { getTenantById } from "@/lib/tenant/server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";

export default async function MyOfficePagesPage() {
  const ctx = await resolveOfficeContext();
  if (!ctx) redirect("/myoffice/login");

  const store = await getPageBuilderStore(ctx.isBootstrapOffice);
  const listing = listCatalogWithPages(store, ctx.isBootstrapOffice);
  const tenant = ctx.isBootstrapOffice ? null : await getTenantById(ctx.tenantId);
  const previewBase = ctx.isBootstrapOffice ? "" : `/s/${tenant?.slug ?? ""}`;

  const custom = listing.custom.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    publicPath: resolvePublicUrl(p, ctx.isBootstrapOffice, tenant?.slug),
    updatedAt: p.updatedAt,
  }));

  return (
    <PagesDirectory
      system={listing.system}
      custom={custom}
      previewBase={previewBase}
    />
  );
}
