import "server-only";
import { getAdminSupabase } from "./supabase";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { defaultTenantId } from "@/lib/tenant/server";

export type ContentKey =
  | "site"
  | "advocate_prompt"
  | "advocate_facts"
  | "projects"
  | "design_system";

async function resolveTenantId(tenantId?: string): Promise<string> {
  if (tenantId?.trim()) return tenantId.trim();
  const ctx = await resolveOfficeContext();
  return ctx?.tenantId ?? defaultTenantId();
}

export async function getContentOverride<T>(
  key: ContentKey,
  tenantId?: string,
): Promise<T | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;
  const tid = await resolveTenantId(tenantId);

  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("tenant_id", tid)
    .eq("key", key)
    .maybeSingle();

  if (error || !data?.value) return null;
  return data.value as T;
}

export async function setContentOverride(
  key: ContentKey,
  value: unknown,
  tenantId?: string,
): Promise<boolean> {
  const supabase = await getAdminSupabase();
  if (!supabase) return false;
  const tid = await resolveTenantId(tenantId);

  const { error } = await supabase.from("site_content").upsert(
    {
      tenant_id: tid,
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "tenant_id,key" },
  );

  if (error) {
    console.error("[myoffice] save content failed", error);
    return false;
  }
  return true;
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

  if (error || !data) return [];
  return data.map((row) => ({
    key: row.key as string,
    updatedAt: row.updated_at as string,
  }));
}

export async function seedTenantDefaults(tenantId: string): Promise<void> {
  const supabase = await getAdminSupabase();
  if (!supabase) return;

  const keys: ContentKey[] = ["site", "projects", "design_system"];
  for (const key of keys) {
    const { data: existing } = await supabase
      .from("site_content")
      .select("key")
      .eq("tenant_id", tenantId)
      .eq("key", key)
      .maybeSingle();
    if (existing) continue;

    if (key === "projects") {
      await supabase.from("site_content").insert({
        tenant_id: tenantId,
        key,
        value: [],
      });
      continue;
    }

    const { data: template } = await supabase
      .from("site_content")
      .select("value")
      .eq("tenant_id", defaultTenantId())
      .eq("key", key)
      .maybeSingle();

    if (template?.value) {
      await supabase.from("site_content").insert({
        tenant_id: tenantId,
        key,
        value: template.value,
      });
    }
  }
}
