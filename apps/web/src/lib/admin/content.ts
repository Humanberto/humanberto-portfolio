import "server-only";
import { getAdminSupabase } from "./supabase";

export type ContentKey = "site" | "advocate_prompt" | "advocate_facts" | "projects";

export async function getContentOverride<T>(key: ContentKey): Promise<T | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error || !data?.value) return null;
  return data.value as T;
}

export async function setContentOverride(key: ContentKey, value: unknown): Promise<boolean> {
  const supabase = await getAdminSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from("site_content").upsert(
    {
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    console.error("[myoffice] save content failed", error);
    return false;
  }
  return true;
}

export async function listContentKeys(): Promise<{ key: string; updatedAt: string }[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("site_content")
    .select("key, updated_at")
    .order("key");

  if (error || !data) return [];
  return data.map((row) => ({
    key: row.key as string,
    updatedAt: row.updated_at as string,
  }));
}
