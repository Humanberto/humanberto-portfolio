import type { AdminProject } from "@/lib/projects.shared";
import { sanitizeProjectDesignBinding } from "@humanberto/ui";
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
  | "designSystem"
> {
  return {
    coverImage: p.coverImage?.trim() || undefined,
    images: sanitizeImages(p.images),
    videos: sanitizeVideos(p.videos),
    processes: sanitizeProcesses(p.processes),
    designSystem: sanitizeProjectDesignBinding(p.designSystem),
  };
}
