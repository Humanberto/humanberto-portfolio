import "server-only";
import {
  defaultDesignSystem,
  sanitizeDesignSystem,
  type DesignSystem,
} from "@humanberto/ui";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";

export async function getGlobalDesignSystem(): Promise<DesignSystem> {
  const stored = await getContentOverride<unknown>("design_system");
  if (!stored) return defaultDesignSystem;
  return sanitizeDesignSystem(stored);
}

export async function saveGlobalDesignSystem(system: DesignSystem): Promise<boolean> {
  const sanitized = sanitizeDesignSystem(system);
  return setContentOverride("design_system", sanitized);
}
