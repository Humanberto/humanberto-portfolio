import type {
  ProjectImage,
  ProjectProcess,
  ProjectProcessStep,
  ProjectVideo,
} from "@/content/projects";

export function newMediaId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyProcess(): ProjectProcess {
  return { id: newMediaId(), title: "New process", summary: "", steps: [] };
}

export function emptyProcessStep(): ProjectProcessStep {
  return { id: newMediaId(), title: "", detail: "" };
}

export function emptyImage(url = ""): ProjectImage {
  return { id: newMediaId(), url, alt: "", caption: "" };
}

export function emptyVideo(url = ""): ProjectVideo {
  return { id: newMediaId(), url, caption: "" };
}

export function sanitizeImages(raw: unknown): ProjectImage[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Partial<ProjectImage>;
      if (!o.url?.trim()) return null;
      return {
        id: o.id?.trim() || newMediaId(),
        url: o.url.trim(),
        alt: o.alt?.trim() || undefined,
        caption: o.caption?.trim() || undefined,
      };
    })
    .filter(Boolean) as ProjectImage[];
  return items.length ? items : undefined;
}

export function sanitizeVideos(raw: unknown): ProjectVideo[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Partial<ProjectVideo>;
      if (!o.url?.trim()) return null;
      return {
        id: o.id?.trim() || newMediaId(),
        url: o.url.trim(),
        caption: o.caption?.trim() || undefined,
        posterUrl: o.posterUrl?.trim() || undefined,
      };
    })
    .filter(Boolean) as ProjectVideo[];
  return items.length ? items : undefined;
}

export function sanitizeProcesses(raw: unknown): ProjectProcess[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const items = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Partial<ProjectProcess>;
      if (!o.title?.trim()) return null;
      const steps = Array.isArray(o.steps)
        ? (o.steps
            .map((s) => {
              if (!s || typeof s !== "object") return null;
              const step = s as Partial<ProjectProcessStep>;
              if (!step.title?.trim() && !step.detail?.trim()) return null;
              return {
                id: step.id?.trim() || newMediaId(),
                title: step.title?.trim() ?? "",
                detail: step.detail?.trim() ?? "",
                imageUrl: step.imageUrl?.trim() || undefined,
              };
            })
            .filter(Boolean) as ProjectProcessStep[])
        : [];
      return {
        id: o.id?.trim() || newMediaId(),
        title: o.title.trim(),
        summary: o.summary?.trim() || undefined,
        steps,
      };
    })
    .filter(Boolean) as ProjectProcess[];
  return items.length ? items : undefined;
}
