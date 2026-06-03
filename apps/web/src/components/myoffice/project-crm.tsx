"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  emptyProject,
  slugifyTitle,
  PROJECT_ACCENTS,
  PROJECT_PILLARS,
  PROJECT_STATUSES,
  type AdminProject,
} from "@/lib/projects.shared";
import type { Pillar } from "@/content/projects";
import { ProjectRichContent } from "./project-rich-content";
import { ProjectDesignSystemFields } from "./design-system-editor";
import { ProjectStudioPanel } from "./project-studio-panel";
import type { DesignSystem } from "@humanberto/ui";

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function arrayToLines(items: string[]): string {
  return items.join("\n");
}

const inputClass =
  "mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white";
const labelClass = "block text-sm text-white/70";

export function ProjectCrm() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminProject | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [globalDesign, setGlobalDesign] = useState<DesignSystem | null>(null);

  const refresh = useCallback(async () => {
    const [projectsRes, designRes] = await Promise.all([
      fetch("/api/myoffice/projects"),
      fetch("/api/myoffice/design"),
    ]);
    if (projectsRes.ok) {
      const data = (await projectsRes.json()) as { projects: AdminProject[] };
      setProjects(data.projects);
    }
    if (designRes.ok) {
      const data = (await designRes.json()) as { system: DesignSystem };
      setGlobalDesign(data.system);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selected = useMemo(
    () => projects.find((p) => p.slug === selectedSlug) ?? null,
    [projects, selectedSlug],
  );

  function openEdit(slug: string) {
    const project = projects.find((p) => p.slug === slug);
    if (!project) return;
    setIsNew(false);
    setSelectedSlug(slug);
    setDraft({
      ...project,
      images: project.images ?? [],
      videos: project.videos ?? [],
      processes: project.processes ?? [],
    });
    setStatus("");
  }

  function openNew() {
    const blank = emptyProject();
    setIsNew(true);
    setSelectedSlug(null);
    setDraft(blank);
    setStatus("");
  }

  function closeEditor() {
    setSelectedSlug(null);
    setDraft(null);
    setIsNew(false);
  }

  async function saveDraft(): Promise<string | null> {
    if (!draft?.title.trim()) {
      setStatus("Title is required.");
      return null;
    }

    const payload: AdminProject = {
      ...draft,
      slug: (draft.slug.trim() || slugifyTitle(draft.title)).toLowerCase(),
    };

    setStatus("Saving…");
    const next = isNew
      ? [payload, ...projects]
      : projects.map((p) => (p.slug === selectedSlug ? payload : p));

    const res = await fetch("/api/myoffice/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projects: next }),
    });

    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setStatus(err.error ?? "Save failed.");
      return null;
    }

    setProjects(next);
    if (isNew) {
      setIsNew(false);
      setSelectedSlug(payload.slug);
    }
    setDraft(payload);
    setStatus("Saved.");
    return payload.slug;
  }

  async function ensureSavedForStudio(): Promise<string | null> {
    if (!draft?.title.trim()) return null;
    return saveDraft();
  }

  async function quickToggle(slug: string, patch: Partial<AdminProject>) {
    const next = projects.map((p) => (p.slug === slug ? { ...p, ...patch } : p));
    setProjects(next);
    const res = await fetch("/api/myoffice/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projects: next }),
    });
    if (!res.ok) {
      setStatus("Update failed.");
      await refresh();
    }
  }

  async function removeProject(slug: string) {
    if (!confirm(`Remove "${slug}" from the portfolio?`)) return;
    const next = projects.filter((p) => p.slug !== slug);
    const res = await fetch("/api/myoffice/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projects: next }),
    });
    if (res.ok) {
      setProjects(next);
      if (selectedSlug === slug) closeEditor();
      setStatus("Removed.");
    }
  }

  async function moveProject(slug: string, direction: -1 | 1) {
    const idx = projects.findIndex((p) => p.slug === slug);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= projects.length) return;
    const next = [...projects];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item!);
    setProjects(next);
    await fetch("/api/myoffice/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projects: next }),
    });
  }

  if (loading) return <p className="text-white/60">Loading projects…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg">Portfolio ({projects.length})</h3>
          <button
            type="button"
            onClick={openNew}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
          >
            + New
          </button>
        </div>
        <p className="mt-1 text-xs text-white/50">
          Hidden projects stay in the back office only. Featured + published appear on the homepage.
        </p>
        <ul className="mt-4 space-y-2">
          {projects.map((p, i) => (
            <li
              key={p.slug}
              className={`rounded-xl border px-3 py-3 ${
                selectedSlug === p.slug
                  ? "border-white/30 bg-white/[0.06]"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(p.slug)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate font-medium">{p.title || "Untitled"}</p>
                  <p className="truncate text-xs text-white/50">
                    {p.year} · {p.status}
                    {!p.published && " · hidden"}
                    {p.featured && " · featured"}
                  </p>
                </button>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    title="Move up"
                    onClick={() => void moveProject(p.slug, -1)}
                    disabled={i === 0}
                    className="rounded border border-white/15 px-1.5 py-0.5 text-xs disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    onClick={() => void moveProject(p.slug, 1)}
                    disabled={i === projects.length - 1}
                    className="rounded border border-white/15 px-1.5 py-0.5 text-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-white/70">
                  <input
                    type="checkbox"
                    checked={p.published}
                    onChange={(e) =>
                      void quickToggle(p.slug, { published: e.target.checked })
                    }
                  />
                  Visible
                </label>
                <label className="flex items-center gap-1.5 text-white/70">
                  <input
                    type="checkbox"
                    checked={Boolean(p.featured)}
                    onChange={(e) =>
                      void quickToggle(p.slug, { featured: e.target.checked })
                    }
                  />
                  Featured
                </label>
                {p.published && (
                  <Link
                    href={`/work/${p.slug}`}
                    target="_blank"
                    className="text-white/50 hover:text-white"
                  >
                    Preview ↗
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-1">
        {!draft ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center text-white/50">
            <p>Select a project to edit, or create a new one.</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg">
                {isNew ? "New project" : "Edit project"}
              </h3>
              <button
                type="button"
                onClick={closeEditor}
                className="text-sm text-white/50 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Title *
                <input
                  value={draft.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            title,
                            slug: isNew && !d.slug ? slugifyTitle(title) : d.slug,
                          }
                        : d,
                    );
                  }}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Slug
                <input
                  value={draft.slug}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, slug: e.target.value } : d))
                  }
                  className={inputClass}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Tagline
                <input
                  value={draft.tagline}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, tagline: e.target.value } : d))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Year
                <input
                  value={draft.year}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, year: e.target.value } : d))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Role
                <input
                  value={draft.role}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, role: e.target.value } : d))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Status
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            status: e.target.value as AdminProject["status"],
                          }
                        : d,
                    )
                  }
                  className={inputClass}
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Accent
                <select
                  value={draft.accent ?? "gold"}
                  onChange={(e) =>
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            accent: e.target.value as "gold" | "purple",
                          }
                        : d,
                    )
                  }
                  className={inputClass}
                >
                  {PROJECT_ACCENTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset>
              <legend className="text-sm text-white/70">Pillars</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PROJECT_PILLARS.map((pillar) => (
                  <label
                    key={pillar}
                    className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={draft.pillars.includes(pillar)}
                      onChange={(e) =>
                        setDraft((d) => {
                          if (!d) return d;
                          const pillars = e.target.checked
                            ? [...d.pillars, pillar as Pillar]
                            : d.pillars.filter((x) => x !== pillar);
                          return { ...d, pillars };
                        })
                      }
                    />
                    {pillar}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2 text-white/70">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, published: e.target.checked } : d))
                  }
                />
                Published (visible on site)
              </label>
              <label className="flex items-center gap-2 text-white/70">
                <input
                  type="checkbox"
                  checked={Boolean(draft.featured)}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, featured: e.target.checked } : d))
                  }
                />
                Featured on homepage
              </label>
            </div>

            <label className={labelClass}>
              Summary
              <textarea
                rows={3}
                value={draft.summary}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, summary: e.target.value } : d))
                }
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Problem
              <textarea
                rows={3}
                value={draft.problem}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, problem: e.target.value } : d))
                }
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Approach (one step per line)
              <textarea
                rows={4}
                value={arrayToLines(draft.approach)}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, approach: linesToArray(e.target.value) } : d,
                  )
                }
                className={`${inputClass} font-mono text-sm`}
              />
            </label>
            <label className={labelClass}>
              Outcomes (one per line)
              <textarea
                rows={3}
                value={arrayToLines(draft.outcomes)}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, outcomes: linesToArray(e.target.value) } : d,
                  )
                }
                className={`${inputClass} font-mono text-sm`}
              />
            </label>
            <label className={labelClass}>
              Stack (one per line)
              <textarea
                rows={3}
                value={arrayToLines(draft.stack)}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, stack: linesToArray(e.target.value) } : d,
                  )
                }
                className={`${inputClass} font-mono text-sm`}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["live", "Live URL"],
                  ["repo", "GitHub URL"],
                  ["prototype", "Prototype URL"],
                  ["caseStudy", "Case study URL"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className={labelClass}>
                  {label}
                  <input
                    value={draft.links[key] ?? ""}
                    onChange={(e) =>
                      setDraft((d) =>
                        d
                          ? {
                              ...d,
                              links: { ...d.links, [key]: e.target.value || undefined },
                            }
                          : d,
                      )
                    }
                    className={inputClass}
                  />
                </label>
              ))}
            </div>

            <ProjectRichContent
              draft={draft}
              setDraft={setDraft}
              projectSlug={(draft.slug.trim() || slugifyTitle(draft.title)).toLowerCase()}
              onUploadError={(msg) => setStatus(msg)}
            />

            {globalDesign && (
              <ProjectDesignSystemFields
                binding={draft.designSystem}
                globalSystem={globalDesign}
                onChange={(binding) =>
                  setDraft((d) => (d ? { ...d, designSystem: binding } : d))
                }
              />
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => void saveDraft()}
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
              >
                Save project
              </button>
              {!isNew && selected && (
                <button
                  type="button"
                  onClick={() => void removeProject(selected.slug)}
                  className="rounded-full border border-rose-500/40 px-5 py-2 text-sm text-rose-200"
                >
                  Delete
                </button>
              )}
              {status && <span className="text-sm text-white/60">{status}</span>}
            </div>
            </div>

            {globalDesign && draft.title.trim() && (
              <ProjectStudioPanel
                project={draft}
                globalDesignSystem={globalDesign}
                onProjectChange={(updated) => {
                  setDraft(updated);
                  setProjects((prev) =>
                    prev.map((p) => (p.slug === updated.slug ? updated : p)),
                  );
                }}
                onSaveNeeded={ensureSavedForStudio}
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
