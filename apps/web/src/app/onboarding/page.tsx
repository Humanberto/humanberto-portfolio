"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { defaultPostAuthPath } from "@/lib/auth/post-auth";
import { tenantPublicPath } from "@/lib/tenant/constants";
import { PLATFORM_RESEARCH } from "@/lib/platform/research";
import { createAuthClient } from "@/lib/auth/client";

async function resolveClientPostAuthPath(): Promise<string> {
  const res = await fetch("/api/platform/tenant");
  if (!res.ok) return "/onboarding";
  const data = (await res.json()) as { tenant?: { slug: string } };
  if (!data.tenant?.slug) return "/onboarding";
  return defaultPostAuthPath({
    id: "",
    slug: data.tenant.slug,
    display_name: "",
    status: "active",
    research_completed_at: null,
  });
}

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void (async () => {
      const supabase = createAuthClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/signup?next=/onboarding");
        return;
      }
      const tenantRes = await fetch("/api/platform/tenant");
      if (tenantRes.ok) {
        router.replace(await resolveClientPostAuthPath());
        return;
      }
      const meta = user.user_metadata as { full_name?: string };
      if (meta.full_name) setDisplayName(meta.full_name);
      setChecking(false);
    })();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/platform/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, slug, answers }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setError(body.error ?? "Setup failed.");
      return;
    }
    const data = (await res.json()) as { tenant?: { slug: string } };
    router.replace(
      data.tenant?.slug
        ? `${tenantPublicPath(data.tenant.slug)}?welcome=1`
        : "/onboarding",
    );
    router.refresh();
  }

  if (checking) {
    return <p className="p-10 text-white/60">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl">Set up your portfolio</h1>
      <p className="mt-2 text-sm text-white/60">Pick a URL and answer a few quick questions.</p>
      <form onSubmit={submit} className="mt-8 space-y-6">
        <label className="block text-sm text-white/70">
          Your name (shown on site)
          <input
            required
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (!slug) {
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
                    .slice(0, 32),
                );
              }
            }}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3"
          />
        </label>
        <label className="block text-sm text-white/70">
          Portfolio URL
          <div className="mt-1 flex items-center gap-1 rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm">
            <span className="text-white/40">humanberto.com/s/</span>
            <input
              required
              pattern="[a-z0-9-]{3,32}"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </div>
        </label>
        {PLATFORM_RESEARCH.map((q) => (
          <label key={q.id} className="block text-sm text-white/70">
            {q.label}
            {q.type === "textarea" ? (
              <textarea
                rows={2}
                required={q.required}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3"
              />
            ) : q.type === "select" ? (
              <select
                required={q.required}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3"
              >
                <option value="">Select…</option>
                {q.options?.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                required={q.required}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3"
              />
            )}
          </label>
        ))}
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-white py-3 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? "Creating…" : "Launch my portfolio"}
        </button>
      </form>
    </div>
  );
}
