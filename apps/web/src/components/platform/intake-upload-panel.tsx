"use client";

import { useCallback, useEffect, useState } from "react";
import {
  INSPIRATION_DISCLAIMER,
  INTAKE_CATEGORIES,
  type IntakeAssetCategory,
  type IntakeAssetItem,
  type IntakeAssetsRecord,
  emptyIntakeAssets,
} from "@/lib/platform/intake-assets";

type Props = {
  /** e.g. `/api/platform/intake` or `/api/myoffice/intake` */
  apiBase: string;
  onBuilt?: (slug?: string) => void;
  showBuildActions?: boolean;
  buildLabel?: string;
  skipLabel?: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function IntakeUploadPanel({
  apiBase,
  onBuilt,
  showBuildActions = true,
  buildLabel = "Build my site with these files",
  skipLabel = "Skip for now — use my answers only",
}: Props) {
  const [assets, setAssets] = useState<IntakeAssetsRecord>(emptyIntakeAssets());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<IntakeAssetCategory | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch(apiBase);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { assets?: IntakeAssetsRecord };
    setAssets(data.assets ?? emptyIntakeAssets());
    setLoading(false);
  }, [apiBase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function upload(category: IntakeAssetCategory, files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setUploading(category);

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.set("category", category);
      form.set("file", file);
      const res = await fetch(apiBase, { method: "POST", body: form });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setError(body.error ?? `Failed to upload ${file.name}.`);
        break;
      }
      const data = (await res.json()) as { item?: IntakeAssetItem };
      if (data.item) {
        setAssets((prev) => ({
          ...prev,
          [category]: [...prev[category], data.item!],
        }));
      }
    }

    setUploading(null);
  }

  async function buildSite() {
    setBuilding(true);
    setError("");
    const res = await fetch(`${apiBase}/generate`, { method: "POST" });
    setBuilding(false);
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setError(body.error ?? "Build failed.");
      return;
    }
    onBuilt?.();
  }

  if (loading) {
    return <p className="text-sm text-white/50">Loading uploads…</p>;
  }

  const totalUsable =
    assets.resume.length + assets.portfolio.length + assets.projects.length;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 px-5 py-4">
        <p className="text-sm font-medium text-amber-100/90">How uploads are used</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">
          <li>
            <strong className="font-medium text-white/90">Resume, portfolio, and projects</strong>{" "}
            — the design agent uses these on your live site (copy, case studies, images).
          </li>
          <li>
            <strong className="font-medium text-white/90">Inspiration</strong> — reference only.
            Mood, colors, and layout feel — never copied onto your published portfolio.
          </li>
        </ul>
        <p className="mt-3 text-xs text-white/50">{INSPIRATION_DISCLAIMER}</p>
      </div>

      {INTAKE_CATEGORIES.map((cat) => (
        <section
          key={cat.id}
          className={`rounded-2xl border p-5 ${
            cat.usableOnSite ? "border-white/10" : "border-violet-400/25 bg-violet-400/5"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg">{cat.label}</h3>
              <p className="mt-1 text-sm text-white/60">{cat.hint}</p>
              {!cat.usableOnSite && (
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-violet-300/80">
                  Reference only — not published on your site
                </p>
              )}
            </div>
            <label className="cursor-pointer rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
              {uploading === cat.id ? "Uploading…" : "+ Add files"}
              <input
                type="file"
                multiple
                accept={cat.accept}
                className="sr-only"
                disabled={uploading !== null}
                onChange={(e) => {
                  void upload(cat.id, e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          {assets[cat.id].length > 0 && (
            <ul className="mt-4 space-y-2">
              {assets[cat.id].map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate text-white/85">{item.name}</span>
                  <span className="shrink-0 text-xs text-white/40">{formatSize(item.size)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {error && <p className="text-sm text-rose-300">{error}</p>}

      {showBuildActions && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={building}
            onClick={() => void buildSite()}
            className="flex-1 rounded-full bg-white py-3 text-sm font-medium text-black disabled:opacity-50"
          >
            {building
              ? "Building your site…"
              : totalUsable > 0
                ? buildLabel
                : "Generate my site from my answers"}
          </button>
          <button
            type="button"
            disabled={building}
            onClick={() => void buildSite()}
            className="rounded-full border border-white/20 px-6 py-3 text-sm text-white/70 hover:bg-white/5 disabled:opacity-50"
          >
            {skipLabel}
          </button>
        </div>
      )}
    </div>
  );
}
