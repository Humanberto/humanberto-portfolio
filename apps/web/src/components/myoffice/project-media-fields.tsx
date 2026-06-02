"use client";

import type { ProjectImage, ProjectVideo } from "@/content/projects";

const inputClass =
  "mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white text-sm";
const labelClass = "block text-sm text-white/70";

type Item = ProjectImage | ProjectVideo;

type Props = {
  title: string;
  items: Item[];
  kind: "image" | "video";
  urlPlaceholder?: string;
  onChange: (items: Item[]) => void;
  onUpload: (file: File) => Promise<string | null>;
  onError: (msg: string) => void;
  empty: () => Item;
};

export function ProjectMediaFields({
  title,
  items,
  kind,
  urlPlaceholder,
  onChange,
  onUpload,
  onError,
  empty,
}: Props) {
  const accept =
    kind === "image"
      ? "image/jpeg,image/png,image/webp,image/gif"
      : "video/mp4,video/webm,video/quicktime";

  function update(id: string, patch: Partial<Item>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function move(id: string, dir: -1 | 1) {
    const i = items.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    const [item] = next.splice(i, 1);
    next.splice(j, 0, item!);
    onChange(next);
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-display text-lg">{title}</h4>
        <button
          type="button"
          onClick={() => onChange([...items, empty()])}
          className="rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/5"
        >
          + Add
        </button>
      </div>
      <ul className="mt-3 space-y-4">
        {items.length === 0 && (
          <li className="text-sm text-white/40">No {kind === "image" ? "images" : "videos"} yet.</li>
        )}
        {items.map((item, i) => (
          <li key={item.id} className="rounded-xl border border-white/10 p-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={i === 0} onClick={() => move(item.id, -1)} className="text-xs opacity-60 disabled:opacity-20">↑</button>
              <button type="button" disabled={i === items.length - 1} onClick={() => move(item.id, 1)} className="text-xs opacity-60 disabled:opacity-20">↓</button>
              <button type="button" onClick={() => remove(item.id)} className="ml-auto text-xs text-rose-300">Remove</button>
            </div>
            <label className={`${labelClass} mt-2`}>
              URL
              <input
                value={item.url}
                onChange={(e) => update(item.id, { url: e.target.value })}
                className={inputClass}
                placeholder={urlPlaceholder}
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <label className="cursor-pointer rounded-full border border-white/15 px-3 py-1 text-xs">
                Upload file
                <input
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void onUpload(file).then((url) => {
                      if (url) update(item.id, { url });
                      else onError("Upload failed.");
                      e.target.value = "";
                    });
                  }}
                />
              </label>
            </div>
            {"alt" in item && (
              <label className={`${labelClass} mt-2`}>
                Alt text
                <input
                  value={item.alt ?? ""}
                  onChange={(e) => update(item.id, { alt: e.target.value })}
                  className={inputClass}
                />
              </label>
            )}
            <label className={`${labelClass} mt-2`}>
              Caption
              <input
                value={item.caption ?? ""}
                onChange={(e) => update(item.id, { caption: e.target.value })}
                className={inputClass}
              />
            </label>
            {"posterUrl" in item && kind === "video" && (
              <label className={`${labelClass} mt-2`}>
                Poster image URL (optional)
                <input
                  value={(item as ProjectVideo).posterUrl ?? ""}
                  onChange={(e) => update(item.id, { posterUrl: e.target.value || undefined })}
                  className={inputClass}
                />
              </label>
            )}
            {item.url && kind === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt="" className="mt-2 max-h-28 rounded-lg object-cover" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
