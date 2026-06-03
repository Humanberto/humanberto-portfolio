import { redirect } from "next/navigation";
import { StudioWorkspace } from "@/components/myoffice/studio-workspace";
import { loadStudioState } from "@/lib/studio/agent";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { getTenantById } from "@/lib/tenant/server";
import { tenantPublicPath } from "@/lib/tenant/constants";
import Link from "next/link";

export default async function StudioPage() {
  const ctx = await resolveOfficeContext();
  if (!ctx) redirect("/signup?next=/myoffice/studio");

  const preview = await loadStudioState(ctx.tenantId);
  const tenant = await getTenantById(ctx.tenantId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Studio</h2>
          <p className="mt-1 text-sm text-white/60">
            Chat with your agent while the preview updates in real time.
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
      <StudioWorkspace initialPreview={preview} />
    </div>
  );
}
