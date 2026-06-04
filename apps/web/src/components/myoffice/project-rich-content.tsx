"use client";

import type { AdminProject } from "@/lib/projects.shared";
import { emptyImage, emptyVideo } from "@/lib/projects.media";
import { ProjectMediaFields } from "./project-media-fields";
import { ProjectProcessFields } from "./project-process-fields";

const inputClass =
  "mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white";
const labelClass = "block text-sm text-white/70";

type Props = {
  draft: AdminProject;
  setDraft: React.Dispatch<React.SetStateAction<AdminProject | null>>;
  projectSlug: string;
  onUploadError: (msg: string) => void;
};

export function ProjectRichContent({ draft, setDraft, projectSlug, onUploadError }: Props) {
  async function uploadFile(file: File, kind: "image" | "video") {
    if (!projectSlug) {
      onUploadError("Set a slug and save once before uploading.");
      return null;
    }
    const body = new FormData();
    body.set("file", file);
    body.set("projectSlug", projectSlug);
    body.set("kind", kind);
    const res = await fetch("/api/myoffice/media/upload", { method: "POST", body });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      onUploadError(err.error ?? "Upload failed.");
      return null;
    }
    const data = (await res.json()) as { url: string };
    return data.url;
  }

  return (
    <div className="space-y-8 border-t border-white/10 pt-8">
      <section>
        <h4 className="font-display text-lg">Cover image</h4>
        <p className="mt-1 text-xs text-white/50">Shown on the case study hero and work cards.</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className={`${labelClass} min-w-[200px] flex-1`}>
            URL
            <input
              value={draft.coverImage ?? ""}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, coverImage: e.target.value || undefined } : d))
              }
              className={inputClass}
              placeholder="https://… or upload below"
            />
          </label>
          <label className="cursor-pointer rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
            Upload
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void uploadFile(file, "image").then((url) => {
                  if (url) setDraft((d) => (d ? { ...d, coverImage: url } : d));
                  e.target.value = "";
                });
              }}
            />
          </label>
        </div>
        {draft.coverImage && (
          <div className="mt-3 max-h-48 overflow-hidden rounded-xl border border-white/10 bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.coverImage}
              alt=""
              className="mx-auto max-h-48 w-full object-contain"
            />
          </div>
        )}
      </section>

      <ProjectMediaFields
        title="Gallery images"
        items={draft.images ?? []}
        kind="image"
        onChange={(images) => setDraft((d) => (d ? { ...d, images } : d))}
        onUpload={(file) => uploadFile(file, "image")}
        onError={onUploadError}
        empty={() => emptyImage()}
      />

      <ProjectMediaFields
        title="Videos"
        items={draft.videos ?? []}
        kind="video"
        onChange={(videos) => setDraft((d) => (d ? { ...d, videos } : d))}
        onUpload={(file) => uploadFile(file, "video")}
        onError={onUploadError}
        empty={() => emptyVideo()}
        urlPlaceholder="YouTube, Vimeo, or direct .mp4 URL"
      />

      <ProjectProcessFields
        processes={draft.processes ?? []}
        onChange={(processes) => setDraft((d) => (d ? { ...d, processes } : d))}
        projectSlug={projectSlug}
        onUpload={uploadFile}
        onError={onUploadError}
      />
    </div>
  );
}
