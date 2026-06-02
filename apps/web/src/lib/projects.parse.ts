import type { AdminProject } from "@/lib/projects.shared";
import {
  sanitizeImages,
  sanitizeProcesses,
  sanitizeVideos,
} from "@/lib/projects.media";

export function parseProjectFields(p: Partial<AdminProject>): Pick<
  AdminProject,
  | "coverImage"
  | "images"
  | "videos"
  | "processes"
> {
  return {
    coverImage: p.coverImage?.trim() || undefined,
    images: sanitizeImages(p.images),
    videos: sanitizeVideos(p.videos),
    processes: sanitizeProcesses(p.processes),
  };
}
