import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StudioWorkspace } from "@/components/myoffice/studio-workspace";
import { loadStudioState } from "@/lib/studio/agent";
import { getAllProjects } from "@/lib/projects.server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { getTenantById } from "@/lib/tenant/server";
import { tenantPublicPath } from "@/lib/tenant/constants";

export default async function StudioPage() {
  const ctx = await resolveOfficeContext();
  if (!ctx) redirect("/signup?next=/myoffice/studio");

  const [sitePreview, projects, tenant] = await Promise.all([
    loadStudioState(ctx.tenantId),
    getAllProjects(ctx.tenantId),
    getTenantById(ctx.tenantId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Studio</h2>
          <p className="mt-1 text-sm text-white/60">
            Chat with your agent for the whole site or each project — preview updates in real time.
          </p>
        </div>
        {tenant && (
          <Link
            href={tenantPublicPath(tenant.slug)}
            target="_blank"
            className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            View public site ↗
          </Link>
        )}
      </div>
      <Suspense fallback={<p className="text-white/60">Loading studio…</p>}>
        <StudioWorkspace initialSitePreview={sitePreview} projects={projects} />
      </Suspense>
    </div>
  );
}
