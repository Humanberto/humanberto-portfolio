import "server-only";
import { getAdminSupabase } from "./supabase";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { defaultTenantId } from "@/lib/tenant/server";

export type ContentKey =
  | "site"
  | "advocate_prompt"
  | "advocate_facts"
  | "projects"
  | "design_system"
  | "design_system_history";

async function resolveTenantId(tenantId?: string): Promise<string> {
  if (tenantId?.trim()) return tenantId.trim();
  const ctx = await resolveOfficeContext();
  return ctx?.tenantId ?? defaultTenantId();
}

function isMissingTenantColumn(message: string | undefined): boolean {
  if (!message) return false;
  return /tenant_id|column.*does not exist|Could not find the 'tenant_id'/i.test(message);
}

/** Read site_content — tenant-scoped when migration 0004 is applied, else legacy key-only. */
async function readSiteContentValue(
  key: ContentKey,
  tenantId: string,
): Promise<unknown | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;

  const scoped = await supabase
    .from("site_content")
    .select("value")
    .eq("tenant_id", tenantId)
    .eq("key", key)
    .maybeSingle();

  if (!scoped.error && scoped.data?.value != null) {
    return scoped.data.value;
  }

  if (isMissingTenantColumn(scoped.error?.message)) {
    const legacy = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (!legacy.error && legacy.data?.value != null) {
      return legacy.data.value;
    }
  }

  return null;
}

/** Write site_content — tenant-scoped when available, else legacy key-only upsert. */
async function writeSiteContentValue(
  key: ContentKey,
  value: unknown,
  tenantId: string,
): Promise<boolean> {
  const supabase = await getAdminSupabase();
  if (!supabase) return false;

  const updatedAt = new Date().toISOString();

  const scoped = await supabase.from("site_content").upsert(
    {
      tenant_id: tenantId,
      key,
      value,
      updated_at: updatedAt,
    },
    { onConflict: "tenant_id,key" },
  );

  if (!scoped.error) return true;

  if (isMissingTenantColumn(scoped.error.message)) {
    const legacy = await supabase.from("site_content").upsert(
      {
        key,
        value,
        updated_at: updatedAt,
      },
      { onConflict: "key" },
    );
    if (!legacy.error) return true;
    console.error("[myoffice] legacy save content failed", legacy.error);
    return false;
  }

  console.error("[myoffice] save content failed", scoped.error);
  return false;
}

export async function getContentOverride<T>(
  key: ContentKey,
  tenantId?: string,
): Promise<T | null> {
  const tid = await resolveTenantId(tenantId);
  const value = await readSiteContentValue(key, tid);
  if (value == null) return null;
  return value as T;
}

export async function setContentOverride(
  key: ContentKey,
  value: unknown,
  tenantId?: string,
): Promise<boolean> {
  const tid = await resolveTenantId(tenantId);
  return writeSiteContentValue(key, value, tid);
}

export async function listContentKeys(
  tenantId?: string,
): Promise<{ key: string; updatedAt: string }[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];
  const tid = await resolveTenantId(tenantId);

  const { data, error } = await supabase
    .from("site_content")
    .select("key, updated_at")
    .eq("tenant_id", tid)
    .order("key");

  if (!error && data) {
    return data.map((row) => ({
      key: row.key as string,
      updatedAt: row.updated_at as string,
    }));
  }

  const legacy = await supabase
    .from("site_content")
    .select("key, updated_at")
    .order("key");

  if (legacy.error || !legacy.data) return [];
  return legacy.data.map((row) => ({
    key: row.key as string,
    updatedAt: row.updated_at as string,
  }));
}

export async function seedTenantDefaults(tenantId: string): Promise<void> {
  const supabase = await getAdminSupabase();
  if (!supabase) return;

  const keys: ContentKey[] = ["site", "projects", "design_system"];
  for (const key of keys) {
    const existing = await readSiteContentValue(key, tenantId);
    if (existing != null) continue;

    if (key === "projects") {
      await writeSiteContentValue(key, [], tenantId);
      continue;
    }

    const template = await readSiteContentValue(key, defaultTenantId());
    if (template != null) {
      await writeSiteContentValue(key, template, tenantId);
    }
  }
}
