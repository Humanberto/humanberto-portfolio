"use client";

import { useEffect, useState } from "react";

type Provider = {
  id: string;
  label: string;
  provider: "google" | "gateway" | "openai" | "anthropic";
  modelId: string;
  keyHint: string;
  sortOrder: number;
  enabled: boolean;
};

const providerLabels: Record<Provider["provider"], string> = {
  google: "Google AI Studio (Gemini direct)",
  gateway: "Vercel AI Gateway (model id only)",
  openai: "OpenAI via Gateway",
  anthropic: "Anthropic via Gateway",
};

export function LlmManager() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [label, setLabel] = useState("");
  const [provider, setProvider] = useState<Provider["provider"]>("google");
  const [modelId, setModelId] = useState("gemini-2.5-flash");
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const res = await fetch("/api/myoffice/llm");
    if (res.ok) {
      const data = (await res.json()) as { providers: Provider[] };
      setProviders(data.providers);
    }
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addProvider() {
    setStatus("Adding…");
    const res = await fetch("/api/myoffice/llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, provider, modelId, apiKey }),
    });
    if (!res.ok) {
      setStatus("Could not add provider.");
      return;
    }
    setLabel("");
    setApiKey("");
    setStatus("Added.");
    await refresh();
  }

  async function toggle(id: string, enabled: boolean) {
    await fetch(`/api/myoffice/llm/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this provider?")) return;
    await fetch(`/api/myoffice/llm/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function move(id: string, direction: -1 | 1) {
    const idx = providers.findIndex((p) => p.id === id);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= providers.length) return;
    const next = [...providers];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item!);
    await fetch("/api/myoffice/llm/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((p) => p.id) }),
    });
    await refresh();
  }

  if (loading) return <p className="text-white/60">Loading…</p>;

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-xl">Priority order</h2>
        <p className="mt-1 text-sm text-white/50">
          Top = tried first. On rate limits the site automatically tries the next enabled key.
          Keys are encrypted at rest; only the last 4 characters are shown here.
        </p>
        <ul className="mt-4 space-y-3">
          {providers.length === 0 && (
            <li className="text-sm text-white/50">
              No keys in the database yet — env vars are used as fallback.
            </li>
          )}
          {providers.map((p, i) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 px-4 py-3"
            >
              <span className="w-6 text-center text-sm text-white/40">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{p.label}</p>
                <p className="text-sm text-white/50">
                  {providerLabels[p.provider]} · {p.modelId} · key {p.keyHint}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) => void toggle(p.id, e.target.checked)}
                />
                On
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => void move(p.id, -1)}
                  className="rounded-lg border border-white/15 px-2 py-1 text-sm"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => void move(p.id, 1)}
                  className="rounded-lg border border-white/15 px-2 py-1 text-sm"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => void remove(p.id)}
                  className="rounded-lg border border-rose-500/30 px-2 py-1 text-sm text-rose-200"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-xl">Add provider</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-white/70">
            Label
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Gemini backup key"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70">
            Provider
            <select
              value={provider}
              onChange={(e) => {
                const next = e.target.value as Provider["provider"];
                setProvider(next);
                if (next === "google") setModelId("gemini-2.5-flash");
                if (next === "gateway") setModelId("google/gemini-2.0-flash");
                if (next === "openai") setModelId("gpt-4o-mini");
                if (next === "anthropic") setModelId("claude-haiku-4.5");
              }}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white"
            >
              {Object.entries(providerLabels).map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-white/70 sm:col-span-2">
            Model id
            <input
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70 sm:col-span-2">
            API key
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={!label || !apiKey || !modelId}
          onClick={() => void addProvider()}
          className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          Add key
        </button>
        {status && <p className="mt-3 text-sm text-white/70">{status}</p>}
      </section>
    </div>
  );
}
