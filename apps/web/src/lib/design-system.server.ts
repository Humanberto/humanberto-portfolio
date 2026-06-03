import "server-only";
import {
  defaultDesignSystem,
  sanitizeDesignSystem,
  type DesignSystem,
} from "@humanberto/ui";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";
import { defaultTenantId } from "@/lib/tenant/server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";

async function tenantIdForRead(explicit?: string): Promise<string> {
  if (explicit) return explicit;
  const ctx = await resolveOfficeContext();
  return ctx?.tenantId ?? defaultTenantId();
}

export async function getGlobalDesignSystem(tenantId?: string): Promise<DesignSystem> {
  const tid = tenantId ?? (await tenantIdForRead());
  const stored = await getContentOverride<unknown>("design_system", tid);
  if (!stored) return defaultDesignSystem;
  return sanitizeDesignSystem(stored);
}

export async function saveGlobalDesignSystem(
  system: DesignSystem,
  tenantId?: string,
): Promise<boolean> {
  const tid = tenantId ?? (await tenantIdForRead());
  const sanitized = sanitizeDesignSystem(system);
  return setContentOverride("design_system", sanitized, tid);
}
