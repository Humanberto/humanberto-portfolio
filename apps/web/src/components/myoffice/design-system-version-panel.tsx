"use client";

import { useCallback, useEffect, useState } from "react";
import type { DesignSystemVersion } from "@humanberto/ui";

type Props = {
  scope: "system" | "project";
  projectSlug?: string;
  onRestored?: () => void;
};

export function DesignSystemVersionPanel({ scope, projectSlug, onRestored }: Props) {
  const [versions, setVersions] = useState<DesignSystemVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const query =
    scope === "system"
      ? "scope=system"
      : `scope=project&slug=${encodeURIComponent(projectSlug ?? "")}`;

  const refresh = useCallback(async () => {
    if (scope === "project" && !projectSlug) {
      setVersions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/myoffice/design/versions?${query}`);
    if (res.ok) {
      const data = (await res.json()) as { versions: DesignSystemVersion[] };
      setVersions(data.versions);
    }
    setLoading(false);
  }, [query, scope, projectSlug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function saveVersion() {
    setStatus("Saving version…");
    const res = await fetch("/api/myoffice/design/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope,
        slug: projectSlug,
        label: scope === "system" ? "Manual save" : "Project theme save",
      }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setStatus(err.error ?? "Save failed.");
      return;
    }
    setStatus("Version saved.");
    await refresh();
  }

  async function restoreVersion(id: string) {
    if (!confirm("Restore this saved version? Current design will be snapshotted first.")) return;
    setBusyId(id);
    setStatus("Restoring…");
    const res = await fetch("/api/myoffice/design/versions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, slug: projectSlug, versionId: id }),
    });
    setBusyId(null);
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setStatus(err.error ?? "Restore failed.");
      return;
    }
    setStatus("Restored.");
    onRestored?.();
    await refresh();
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h5 className="text-sm font-medium text-white">Saved versions</h5>
          <p className="text-xs text-white/50">Up to 5 snapshots. Oldest drops off when full.</p>
        </div>
        <button
          type="button"
          onClick={() => void saveVersion()}
          className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:bg-white/5"
        >
          Save version
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-white/50">Loading versions…</p>
      ) : versions.length === 0 ? (
        <p className="text-xs text-white/50">No saved versions yet.</p>
      ) : (
        <ul className="space-y-2">
          {versions.map((v) => (
            <li
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
            >
              <div>
                <p className="text-sm text-white">{v.label}</p>
                <p className="text-xs text-white/45">
                  {new Date(v.savedAt).toLocaleString()}
                  {v.payload.kind === "project" &&
                    (!v.payload.binding || v.payload.binding.mode === "inherit") &&
                    " · System theme"}
                </p>
              </div>
              <button
                type="button"
                disabled={busyId === v.id}
                onClick={() => void restoreVersion(v.id)}
                className="rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/5 disabled:opacity-50"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}

      {status && <p className="text-xs text-white/55">{status}</p>}
    </div>
  );
}
