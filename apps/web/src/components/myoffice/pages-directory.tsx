"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SystemRow = {
  id: string;
  title: string;
  publicPath: string;
  zone: string;
  description: string;
  editorHref?: string;
  blockCount: number;
  updatedAt?: string;
};

type CustomRow = {
  id: string;
  title: string;
  slug: string;
  publicPath: string;
  updatedAt: string;
};

export function PagesDirectory({
  system,
  custom,
  previewBase,
}: {
  system: SystemRow[];
  custom: CustomRow[];
  previewBase: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "public" | "myoffice">("all");

  const filteredSystem = system.filter((p) => {
    if (filter === "all") return true;
    if (filter === "myoffice") return p.zone === "myoffice";
    return p.zone === "public";
  });

  async function createPage(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/myoffice/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = (await res.json()) as { page?: { id: string }; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      router.push(`/myoffice/pages/${data.page!.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  function previewPath(row: { publicPath: string; slug?: string; id?: string }, custom?: boolean) {
    if (custom) return `${previewBase}/pages/${row.slug}`;
    return row.publicPath === "/" ? previewBase || "/" : `${previewBase}${row.publicPath}`;
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-2xl">Pages</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          View and edit every route on your site. System pages link to specialized editors or the
          block builder. Add custom pages for landing pages, docs, or campaigns.
        </p>
      </div>

      <form
        onSubmit={createPage}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
      >
        <div className="min-w-[200px] flex-1">
          <label className="block text-xs text-white/50">New custom page</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Pricing, Team, Login help"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !title.trim()}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {creating ? "Creating…" : "Add page"}
        </button>
        {error ? <p className="w-full text-sm text-rose-300">{error}</p> : null}
      </form>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All pages"],
            ["public", "Public site"],
            ["myoffice", "My Office"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              filter === key ? "bg-white/15 text-white" : "text-white/55 hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section>
        <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/45">
          System pages
        </h3>
        <ul className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10">
          {filteredSystem.map((page) => (
            <li key={page.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium">{page.title}</p>
                <p className="text-xs text-white/45">{page.description}</p>
                <p className="mt-1 font-mono text-[11px] text-white/35">{page.publicPath}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
                  {page.zone}
                </span>
                {page.blockCount > 0 ? (
                  <span className="text-xs text-white/40">{page.blockCount} blocks</span>
                ) : null}
                <Link
                  href={previewPath(page)}
                  target="_blank"
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                >
                  View ↗
                </Link>
                {page.editorHref ? (
                  <Link
                    href={page.editorHref}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                  >
                    Edit
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {custom.length > 0 ? (
        <section>
          <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/45">
            Custom pages
          </h3>
          <ul className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10">
            {custom.map((page) => (
              <li
                key={page.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium">{page.title}</p>
                  <p className="font-mono text-[11px] text-white/35">/pages/{page.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={previewPath(page, true)}
                    target="_blank"
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                  >
                    View ↗
                  </Link>
                  <Link
                    href={`/myoffice/pages/${page.id}`}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                  >
                    Edit blocks
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
