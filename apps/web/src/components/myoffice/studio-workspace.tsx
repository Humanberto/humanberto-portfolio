"use client";

import { useCallback, useState } from "react";
import {
  DesignSystemPresentation,
} from "@/components/myoffice/design-system-presentation";
import { defaultDesignSystem, type DesignSystem } from "@humanberto/ui";
import type { SiteConfig } from "@/lib/site";

type Preview = {
  designSystem: DesignSystem;
  site: SiteConfig;
};

type Message = { role: "user" | "assistant"; content: string };

export function StudioWorkspace({
  initialPreview,
}: {
  initialPreview: Preview;
}) {
  const [preview, setPreview] = useState(initialPreview);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/myoffice/studio/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await res.json()) as {
        reply?: string;
        preview?: Preview;
        error?: string;
      };
      if (data.preview) setPreview(data.preview);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? data.error ?? "No response." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Request failed." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return (
    <div className="grid min-h-[calc(100dvh-12rem)] gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="border-b border-white/10 px-4 py-2 text-xs text-white/50">
          Live preview — {preview.site.shortName ?? preview.site.name}
        </div>
        <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto bg-ink">
          <div className="border-b border-line px-8 py-10 text-center">
            <p className="text-xs uppercase tracking-widest text-gold">{preview.site.role}</p>
            <h2 className="mt-3 font-display text-3xl font-light">{preview.site.name}</h2>
            <p className="mt-3 text-muted">{preview.site.tagline}</p>
          </div>
          <DesignSystemPresentation
            system={preview.designSystem ?? defaultDesignSystem}
            title="Design system"
            subtitle="Updates apply as you chat with Studio."
          />
        </div>
      </div>

      <aside className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] lg:max-h-[calc(100dvh-12rem)]">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="font-display text-lg">Studio agent</h2>
          <p className="text-xs text-white/50">Design system, copy, and vibe</p>
        </div>
        <ul className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
          {messages.length === 0 && (
            <li className="text-white/40">
              Try: &quot;Make it darker with gold accents&quot; or &quot;Rewrite my tagline for
              product design roles&quot;
            </li>
          )}
          {messages.map((m, i) => (
            <li
              key={i}
              className={`rounded-xl px-3 py-2 ${
                m.role === "user" ? "ml-4 bg-white/10" : "mr-4 bg-purple/20"
              }`}
            >
              {m.content}
            </li>
          ))}
        </ul>
        <div className="border-t border-white/10 p-3">
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Studio to refine your portfolio…"
            className="w-full resize-none rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={() => void send()}
            className="mt-2 w-full rounded-full bg-white py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {loading ? "Thinking…" : "Send"}
          </button>
        </div>
      </aside>
    </div>
  );
}
