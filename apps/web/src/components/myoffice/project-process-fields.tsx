"use client";

import type { ProjectProcess } from "@/content/projects";
import { emptyProcess, emptyProcessStep } from "@/lib/projects.media";

const inputClass =
  "mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white text-sm";
const labelClass = "block text-sm text-white/70";

type Props = {
  processes: ProjectProcess[];
  onChange: (processes: ProjectProcess[]) => void;
  projectSlug: string;
  onUpload: (file: File, kind: "image" | "video") => Promise<string | null>;
  onError: (msg: string) => void;
};

export function ProjectProcessFields({
  processes,
  onChange,
  projectSlug,
  onUpload,
  onError,
}: Props) {
  function updateProcess(id: string, patch: Partial<ProjectProcess>) {
    onChange(processes.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function removeProcess(id: string) {
    onChange(processes.filter((p) => p.id !== id));
  }

  function moveProcess(id: string, dir: -1 | 1) {
    const i = processes.findIndex((p) => p.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= processes.length) return;
    const next = [...processes];
    const [item] = next.splice(i, 1);
    next.splice(j, 0, item!);
    onChange(next);
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 className="font-display text-lg">Processes</h4>
          <p className="text-xs text-white/50">
            Named phases (e.g. Discovery → Design → Build) with steps on the case study.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...processes, emptyProcess()])}
          className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/5"
        >
          + Process
        </button>
      </div>

      <ul className="mt-4 space-y-6">
        {processes.length === 0 && (
          <li className="text-sm text-white/40">No process sections yet.</li>
        )}
        {processes.map((proc, pi) => (
          <li key={proc.id} className="rounded-xl border border-white/15 p-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={pi === 0} onClick={() => moveProcess(proc.id, -1)} className="text-xs">↑</button>
              <button type="button" disabled={pi === processes.length - 1} onClick={() => moveProcess(proc.id, 1)} className="text-xs">↓</button>
              <button type="button" onClick={() => removeProcess(proc.id)} className="ml-auto text-xs text-rose-300">Delete process</button>
            </div>
            <label className={`${labelClass} mt-3`}>
              Process title
              <input
                value={proc.title}
                onChange={(e) => updateProcess(proc.id, { title: e.target.value })}
                className={inputClass}
                placeholder="e.g. User research & IA"
              />
            </label>
            <label className={`${labelClass} mt-2`}>
              Summary (optional)
              <textarea
                rows={2}
                value={proc.summary ?? ""}
                onChange={(e) => updateProcess(proc.id, { summary: e.target.value })}
                className={inputClass}
              />
            </label>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-white/50">Steps</span>
              <button
                type="button"
                onClick={() =>
                  updateProcess(proc.id, {
                    steps: [...proc.steps, emptyProcessStep()],
                  })
                }
                className="text-xs text-white/70 hover:text-white"
              >
                + Step
              </button>
            </div>
            <ul className="mt-2 space-y-3">
              {proc.steps.map((step, si) => (
                <li key={step.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex gap-2 text-xs">
                    <span className="text-white/40">{si + 1}.</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateProcess(proc.id, {
                          steps: proc.steps.filter((s) => s.id !== step.id),
                        })
                      }
                      className="ml-auto text-rose-300"
                    >
                      Remove
                    </button>
                  </div>
                  <label className={`${labelClass} mt-1`}>
                    Step title
                    <input
                      value={step.title}
                      onChange={(e) =>
                        updateProcess(proc.id, {
                          steps: proc.steps.map((s) =>
                            s.id === step.id ? { ...s, title: e.target.value } : s,
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} mt-2`}>
                    Detail
                    <textarea
                      rows={2}
                      value={step.detail}
                      onChange={(e) =>
                        updateProcess(proc.id, {
                          steps: proc.steps.map((s) =>
                            s.id === step.id ? { ...s, detail: e.target.value } : s,
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} mt-2`}>
                    Step image URL
                    <input
                      value={step.imageUrl ?? ""}
                      onChange={(e) =>
                        updateProcess(proc.id, {
                          steps: proc.steps.map((s) =>
                            s.id === step.id
                              ? { ...s, imageUrl: e.target.value || undefined }
                              : s,
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="mt-2 inline-block cursor-pointer text-xs text-white/60 hover:text-white">
                    Upload step image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file || !projectSlug) return;
                        void onUpload(file, "image").then((url) => {
                          if (!url) {
                            onError("Upload failed.");
                            return;
                          }
                          updateProcess(proc.id, {
                            steps: proc.steps.map((s) =>
                              s.id === step.id ? { ...s, imageUrl: url } : s,
                            ),
                          });
                          e.target.value = "";
                        });
                      }}
                    />
                  </label>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
