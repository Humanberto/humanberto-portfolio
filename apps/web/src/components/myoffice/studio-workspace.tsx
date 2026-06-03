"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DesignSystemPresentation } from "@/components/myoffice/design-system-presentation";
import { ProjectStudioPreview } from "@/components/myoffice/project-studio-preview";
import { defaultDesignSystem, type DesignSystem } from "@humanberto/ui";
import type { SiteConfig } from "@/lib/site";
import type { AdminProject } from "@/lib/projects.shared";

type SitePreview = {
  scope: "site";
  designSystem: DesignSystem;
  site: SiteConfig;
};

type ProjectPreview = {
  scope: "project";
  designSystem: DesignSystem;
  site: SiteConfig;
  project: AdminProject;
};

type Preview = SitePreview | ProjectPreview;

type Message = { role: "user" | "assistant"; content: string };

type Scope = "site" | "project";

export function StudioWorkspace({
  initialSitePreview,
  projects: initialProjects,
}: {
  initialSitePreview: SitePreview;
  projects: AdminProject[];
}) {
  const searchParams = useSearchParams();
  const initialProjectSlug = searchParams.get("project");

  const [projects, setProjects] = useState(initialProjects);
  const [scope, setScope] = useState<Scope>(
    initialProjectSlug && initialProjects.some((p) => p.slug === initialProjectSlug)
      ? "project"
      : "site",
  );
  const [projectSlug, setProjectSlug] = useState<string | null>(
    initialProjectSlug && initialProjects.some((p) => p.slug === initialProjectSlug)
      ? initialProjectSlug
      : initialProjects[0]?.slug ?? null,
  );
  const [sitePreview, setSitePreview] = useState(initialSitePreview);
  const [projectPreview, setProjectPreview] = useState<ProjectPreview | null>(() => {
    const slug =
      initialProjectSlug && initialProjects.some((p) => p.slug === initialProjectSlug)
        ? initialProjectSlug
        : initialProjects[0]?.slug;
    const project = initialProjects.find((p) => p.slug === slug);
    if (!project) return null;
    return {
      scope: "project",
      designSystem: initialSitePreview.designSystem,
      site: initialSitePreview.site,
      project,
    };
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const activeProject = useMemo(
    () => projects.find((p) => p.slug === projectSlug) ?? null,
    [projects, projectSlug],
  );

  useEffect(() => {
    if (scope === "project" && activeProject && projectPreview?.project.slug !== activeProject.slug) {
      setProjectPreview({
        scope: "project",
        designSystem: sitePreview.designSystem,
        site: sitePreview.site,
        project: activeProject,
      });
      setMessages([]);
    }
  }, [scope, activeProject, projectPreview?.project.slug, sitePreview]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (scope === "project" && !projectSlug) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/myoffice/studio/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          ...(scope === "project" && projectSlug ? { projectSlug } : {}),
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        preview?: Preview;
        error?: string;
      };

      if (data.preview) {
        if (data.preview.scope === "project") {
          const updated = data.preview;
          setProjectPreview(updated);
          setProjects((prev) =>
            prev.map((p) => (p.slug === updated.project.slug ? updated.project : p)),
          );
        } else {
          setSitePreview(data.preview);
        }
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
  }, [input, loading, scope, projectSlug]);

  const placeholder =
    scope === "site"
      ? 'Try: "Make it darker with gold accents" or "Rewrite my tagline for product design roles"'
      : 'Try: "Tighten the summary for recruiters" or "Give this project a darker purple theme"';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-white/15 p-1">
          <button
            type="button"
            onClick={() => {
              setScope("site");
              setMessages([]);
            }}
            className={`rounded-full px-4 py-1.5 text-sm ${
              scope === "site" ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            Portfolio site
          </button>
          <button
            type="button"
            onClick={() => {
              setScope("project");
              setMessages([]);
            }}
            className={`rounded-full px-4 py-1.5 text-sm ${
              scope === "project" ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            Project
          </button>
        </div>

        {scope === "project" && (
          <select
            value={projectSlug ?? ""}
            onChange={(e) => {
              setProjectSlug(e.target.value || null);
              setMessages([]);
            }}
            className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm"
          >
            {projects.length === 0 && <option value="">No projects yet</option>}
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title || p.slug}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid min-h-[calc(100dvh-14rem)] gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="border-b border-white/10 px-4 py-2 text-xs text-white/50">
            Live preview —{" "}
            {scope === "site"
              ? sitePreview.site.shortName ?? sitePreview.site.name
              : projectPreview?.project.title ?? "Select a project"}
          </div>
          <div className="max-h-[calc(100dvh-16rem)] overflow-y-auto bg-ink">
            {scope === "site" ? (
              <>
                <div className="border-b border-line px-8 py-10 text-center">
                  <p className="text-xs uppercase tracking-widest text-gold">{sitePreview.site.role}</p>
                  <h2 className="mt-3 font-display text-3xl font-light">{sitePreview.site.name}</h2>
                  <p className="mt-3 text-muted">{sitePreview.site.tagline}</p>
                </div>
                <DesignSystemPresentation
                  system={sitePreview.designSystem ?? defaultDesignSystem}
                  title="Design system"
                  subtitle="Updates apply as you chat with Studio."
                />
              </>
            ) : projectPreview ? (
              <ProjectStudioPreview
                project={projectPreview.project}
                designSystem={projectPreview.designSystem}
              />
            ) : (
              <p className="p-8 text-center text-muted">
                Add a project in{" "}
                <a href="/myoffice/projects" className="text-gold underline">
                  Projects
                </a>{" "}
                first.
              </p>
            )}
          </div>
        </div>

        <aside className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] lg:max-h-[calc(100dvh-14rem)]">
          <div className="border-b border-white/10 px-4 py-3">
            <h2 className="font-display text-lg">Studio agent</h2>
            <p className="text-xs text-white/50">
              {scope === "site" ? "Site design system & copy" : "Case study copy & project design"}
            </p>
          </div>
          <ul className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.length === 0 && <li className="text-white/40">{placeholder}</li>}
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
              placeholder={
                scope === "site"
                  ? "Ask Studio to refine your portfolio…"
                  : "Ask about this project…"
              }
              disabled={scope === "project" && !projectSlug}
              className="w-full resize-none rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <button
              type="button"
              disabled={loading || !input.trim() || (scope === "project" && !projectSlug)}
              onClick={() => void send()}
              className="mt-2 w-full rounded-full bg-white py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {loading ? "Thinking…" : "Send"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
