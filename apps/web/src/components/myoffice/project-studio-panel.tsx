"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminProject } from "@/lib/projects.shared";
import type { DesignSystem } from "@humanberto/ui";
import { ProjectStudioPreview } from "./project-studio-preview";

type Message = { role: "user" | "assistant"; content: string };

type ProjectPreview = {
  scope: "project";
  project: AdminProject;
  designSystem: DesignSystem;
};

export function ProjectStudioPanel({
  project,
  globalDesignSystem,
  onProjectChange,
  onSaveNeeded,
}: {
  project: AdminProject;
  globalDesignSystem: DesignSystem;
  onProjectChange: (project: AdminProject) => void;
  onSaveNeeded: () => Promise<string | null>;
}) {
  const [preview, setPreview] = useState<ProjectPreview>({
    scope: "project",
    project,
    designSystem: globalDesignSystem,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPreview({ scope: "project", project, designSystem: globalDesignSystem });
  }, [project, globalDesignSystem]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);

    try {
      const slug = await onSaveNeeded();
      if (!slug) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Save the project title first, then try again." },
        ]);
        return;
      }

      const res = await fetch("/api/myoffice/studio/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, projectSlug: slug }),
      });
      const data = (await res.json()) as {
        reply?: string;
        preview?: ProjectPreview;
        error?: string;
      };

      if (data.preview?.project) {
        setPreview(data.preview);
        onProjectChange(data.preview.project);
      }

      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? data.error ?? "No response." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Request failed." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, onProjectChange, onSaveNeeded]);

  return (
    <aside className="flex min-h-[480px] flex-col rounded-2xl border border-purple/30 bg-purple/5 xl:min-h-0">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="font-display text-lg">Project studio</h3>
        <p className="text-xs text-white/50">Case study copy &amp; design — updates live</p>
      </div>

      <div className="max-h-48 overflow-y-auto border-b border-white/10 bg-black/20 p-3">
        <ProjectStudioPreview
          project={preview.project}
          designSystem={preview.designSystem}
          compact
        />
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
        {messages.length === 0 && (
          <li className="text-white/40">
            Try: &quot;Tighten the summary for recruiters&quot; or &quot;Give this project a
            darker purple theme&quot;
          </li>
        )}
        {messages.map((m, i) => (
          <li
            key={i}
            className={`rounded-xl px-3 py-2 ${
              m.role === "user" ? "ml-3 bg-white/10" : "mr-3 bg-purple/20"
            }`}
          >
            {m.content}
          </li>
        ))}
      </ul>

      <div className="border-t border-white/10 p-3">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this project…"
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
          className="mt-2 w-full rounded-full bg-white py-2 text-xs font-medium text-black disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Send"}
        </button>
      </div>
    </aside>
  );
}
