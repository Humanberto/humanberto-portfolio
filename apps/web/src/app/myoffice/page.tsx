import Link from "next/link";
import { isAdminConfigured } from "@/lib/admin/auth";
import { listContentKeys } from "@/lib/admin/content";
import { listLlmProviders } from "@/lib/admin/llm-providers";
import { getAllProjects } from "@/lib/projects.server";

export default async function MyOfficeHome() {
  const [providers, contentKeys, projects] = await Promise.all([
    listLlmProviders(),
    listContentKeys(),
    getAllProjects(),
  ]);
  const configured = isAdminConfigured();
  const visible = projects.filter((p) => p.published).length;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-2xl">Overview</h2>
        <p className="mt-2 text-sm text-white/60">
          Hidden admin at <code className="text-white/80">/myoffice</code>. Nothing on the public
          site links here.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 p-4">
            <dt className="text-xs uppercase tracking-wide text-white/50">Auth</dt>
            <dd className="mt-1 text-lg">{configured ? "Configured" : "Missing env"}</dd>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <dt className="text-xs uppercase tracking-wide text-white/50">Projects</dt>
            <dd className="mt-1 text-lg">
              {visible} live / {projects.length} total
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <dt className="text-xs uppercase tracking-wide text-white/50">LLM providers</dt>
            <dd className="mt-1 text-lg">{providers.length}</dd>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <dt className="text-xs uppercase tracking-wide text-white/50">Content overrides</dt>
            <dd className="mt-1 text-lg">{contentKeys.length}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/myoffice/projects"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20"
        >
          <h3 className="font-display text-xl">Projects CRM</h3>
          <p className="mt-2 text-sm text-white/60">
            Show, hide, edit, and add portfolio work. Reorder with the arrows; toggle featured for
            the homepage.
          </p>
        </Link>
        <Link
          href="/myoffice/llm"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20"
        >
          <h3 className="font-display text-xl">LLM keys & order</h3>
          <p className="mt-2 text-sm text-white/60">
            Add API keys, pick models, drag priority. Keys are encrypted in Supabase and never sent
            to the browser.
          </p>
        </Link>
        <Link
          href="/myoffice/content"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20"
        >
          <h3 className="font-display text-xl">Site content</h3>
          <p className="mt-2 text-sm text-white/60">
            Edit tagline, contact info, advocate prompt, and facts without touching code.
          </p>
        </Link>
      </section>

      {!configured && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Set <code>ADMIN_PASSWORD_HASH</code>, <code>ADMIN_SESSION_SECRET</code>, and{" "}
          <code>ADMIN_ENCRYPTION_KEY</code> in your environment before using the back office in
          production.
        </p>
      )}
    </div>
  );
}
