"use client";

import { useEffect, useState } from "react";
import { defaultSite } from "@/lib/site";

type SiteForm = {
  name: string;
  role: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
};

export function ContentEditor() {
  const [site, setSite] = useState<SiteForm>({
    name: defaultSite.name,
    role: defaultSite.role,
    tagline: defaultSite.tagline,
    email: defaultSite.email,
    phone: defaultSite.phone,
    location: defaultSite.location,
    linkedin: defaultSite.linkedin,
    github: defaultSite.github,
  });
  const [prompt, setPrompt] = useState("");
  const [factsJson, setFactsJson] = useState("{}");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/myoffice/content");
      if (!res.ok) return;
      const data = (await res.json()) as {
        site?: Partial<SiteForm>;
        advocate_prompt?: string;
        advocate_facts?: unknown;
      };
      if (data.site) setSite((s) => ({ ...s, ...data.site }));
      if (data.advocate_prompt) setPrompt(data.advocate_prompt);
      if (data.advocate_facts) {
        setFactsJson(JSON.stringify(data.advocate_facts, null, 2));
      }
      setLoading(false);
    })();
  }, []);

  async function save(section: "site" | "advocate_prompt" | "advocate_facts") {
    setStatus("Saving…");
    let body: Record<string, unknown> = {};
    if (section === "site") body = { site };
    if (section === "advocate_prompt") body = { advocate_prompt: prompt };
    if (section === "advocate_facts") {
      try {
        body = { advocate_facts: JSON.parse(factsJson) };
      } catch {
        setStatus("Facts JSON is invalid.");
        return;
      }
    }

    const res = await fetch("/api/myoffice/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(res.ok ? "Saved." : "Save failed.");
  }

  if (loading) return <p className="text-white/60">Loading…</p>;

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-xl">Site basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["name", "Name"],
              ["role", "Role"],
              ["tagline", "Tagline"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["location", "Location"],
              ["linkedin", "LinkedIn URL"],
              ["github", "GitHub URL"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm text-white/70">
              {label}
              <input
                value={site[key]}
                onChange={(e) => setSite({ ...site, [key]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void save("site")}
          className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
        >
          Save site basics
        </button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-xl">Advocate system prompt</h2>
        <p className="mt-1 text-sm text-white/50">
          Use {"{name}"} and {"{location}"} placeholders.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={12}
          className="mt-4 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 font-mono text-sm text-white"
          placeholder="Leave empty to use the built-in default prompt."
        />
        <button
          type="button"
          onClick={() => void save("advocate_prompt")}
          className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
        >
          Save prompt
        </button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-xl">Advocate facts (JSON)</h2>
        <p className="mt-1 text-sm text-white/50">
          Partial override merged with defaults. Edit experience, skills, education, honestGaps.
        </p>
        <textarea
          value={factsJson}
          onChange={(e) => setFactsJson(e.target.value)}
          rows={16}
          className="mt-4 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 font-mono text-sm text-white"
        />
        <button
          type="button"
          onClick={() => void save("advocate_facts")}
          className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
        >
          Save facts
        </button>
      </section>

      {status && <p className="text-sm text-white/70">{status}</p>}
    </div>
  );
}
