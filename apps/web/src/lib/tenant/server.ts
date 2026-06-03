import "server-only";
import { getAdminSupabase } from "@/lib/admin/supabase";
import { BOOTSTRAP_TENANT_ID, BOOTSTRAP_TENANT_SLUG, type TenantRow } from "./constants";

export async function getTenantBySlug(slug: string): Promise<TenantRow | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("tenants")
    .select("id, slug, display_name, status, research_completed_at")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  return data as TenantRow | null;
}

export async function getTenantById(id: string): Promise<TenantRow | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("tenants")
    .select("id, slug, display_name, status, research_completed_at")
    .eq("id", id)
    .maybeSingle();
  return data as TenantRow | null;
}

export async function getTenantsForUser(userId: string): Promise<TenantRow[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];
  const { data: memberships } = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", userId);
  if (!memberships?.length) return [];
  const ids = memberships.map((m) => m.tenant_id as string);
  const { data } = await supabase
    .from("tenants")
    .select("id, slug, display_name, status, research_completed_at")
    .in("id", ids);
  return (data ?? []) as TenantRow[];
}

export async function createTenantForUser(input: {
  userId: string;
  slug: string;
  displayName: string;
}): Promise<TenantRow | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;

  const slug = input.slug.toLowerCase().trim();
  if (!/^[a-z0-9-]{3,32}$/.test(slug) || slug === BOOTSTRAP_TENANT_SLUG) {
    return null;
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      slug,
      display_name: input.displayName.trim(),
      status: "onboarding",
    })
    .select("id, slug, display_name, status, research_completed_at")
    .single();

  if (tenantError || !tenant) return null;

  const { error: memberError } = await supabase.from("tenant_members").insert({
    tenant_id: tenant.id,
    user_id: input.userId,
    role: "owner",
  });
  if (memberError) return null;

  return tenant as TenantRow;
}

export function defaultTenantId(): string {
  return process.env.PLATFORM_TENANT_ID?.trim() || BOOTSTRAP_TENANT_ID;
}

export function defaultTenantSlug(): string {
  return process.env.PLATFORM_TENANT_SLUG?.trim() || BOOTSTRAP_TENANT_SLUG;
}
