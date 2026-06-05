"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SITE_FEATURE_GROUPS,
  isFeatureVisible,
  type ResolvedSiteVisibility,
  type SiteFeatureDef,
  type SiteVisibilityOverrides,
} from "@/lib/site-visibility";

type Payload = {
  scope: "bootstrap" | "tenant";
  visibility: ResolvedSiteVisibility;
  features: SiteFeatureDef[];
};

export function VisibilityEditor() {
  const [data, setData] = useState<Payload | null>(null);
  const [draft, setDraft] = useState<SiteVisibilityOverrides>({});
  const [customId, setCustomId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/myoffice/visibility");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const json = (await res.json()) as Payload;
    setData(json);
    setDraft(json.visibility.overrides);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const effective = useMemo(() => {
    if (!data) return null;
    return {
      ...data.visibility,
      features: Object.fromEntries(
        data.features.map((f) => [
          f.id,
          typeof draft[f.id] === "boolean" ? draft[f.id]! : f.defaultVisible,
        ]),
      ),
    } satisfies ResolvedSiteVisibility;
  }, [data, draft]);

  function setVisible(id: string, visible: boolean) {
    setDraft((prev) => ({ ...prev, [id]: visible }));
  }

  function toggle(id: string, defaultVisible: boolean) {
    const current =
      typeof draft[id] === "boolean" ? draft[id]! : defaultVisible;
    setVisible(id, !current);
  }

  async function save() {
    setStatus("Saving…");
    const res = await fetch("/api/myoffice/visibility", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overrides: draft }),
    });
    if (!res.ok) {
      setStatus("Save failed.");
      return;
    }
    const json = (await res.json()) as { visibility: ResolvedSiteVisibility };
    setData((d) => (d ? { ...d, visibility: json.visibility } : d));
    setDraft(json.visibility.overrides);
    setStatus("Saved.");
  }

  function addCustom() {
    const id = customId.trim().replace(/\s+/g, "-").toLowerCase();
    if (!id) return;
    setDraft((prev) => ({ ...prev, [id]: true }));
    setCustomId("");
  }

  if (loading) return <p className="text-white/60">Loading…</p>;
  if (!data || !effective) return <p className="text-rose-300">Could not load visibility settings.</p>;

  const customKeys = Object.keys(draft).filter(
    (id) => !data.features.some((f) => f.id === id),
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/65">
        Toggle any block, button, nav item, or whole page on your public site. Hidden items
        are removed from the layout; hidden pages return 404. Changes apply to{" "}
        {data.scope === "bootstrap" ? "humanberto.com" : "your tenant portfolio"} only.
      </div>

      {SITE_FEATURE_GROUPS.map((group) => {
        const items = data.features.filter((f) => f.group === group);
        if (!items.length) return null;
        return (
          <section key={group} className="rounded-2xl border border-white/10 p-5">
            <h3 className="font-display text-lg">{group}</h3>
            <ul className="mt-4 space-y-3">
              {items.map((feature) => {
                const on = isFeatureVisible(effective, feature.id);
                return (
                  <li
                    key={feature.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-white/90">{feature.label}</p>
                      <p className="mt-1 text-xs text-white/45">{feature.description}</p>
                      <p className="mt-1 font-mono text-[10px] text-white/30">{feature.id}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      onClick={() => toggle(feature.id, feature.defaultVisible)}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                        on ? "bg-emerald-500/80" : "bg-white/15"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                          on ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <section className="rounded-2xl border border-dashed border-white/15 p-5">
        <h3 className="font-display text-lg">Custom toggles</h3>
        <p className="mt-1 text-sm text-white/50">
          Add your own feature ids for advanced use — wire them in code with{" "}
          <code className="text-white/70">useFeatureVisible(&quot;your.id&quot;)</code>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
            placeholder="custom.feature-id"
            className="min-w-[200px] flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addCustom}
            className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            Add
          </button>
        </div>
        {customKeys.length > 0 && (
          <ul className="mt-4 space-y-2">
            {customKeys.map((id) => {
              const on = draft[id] ?? true;
              return (
                <li
                  key={id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm"
                >
                  <span className="font-mono text-white/70">{id}</span>
                  <button
                    type="button"
                    onClick={() => setVisible(id, !on)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      on ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/50"
                    }`}
                  >
                    {on ? "Visible" : "Hidden"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black"
        >
          Save visibility
        </button>
        {status && <span className="text-sm text-white/50">{status}</span>}
      </div>
    </div>
  );
}
