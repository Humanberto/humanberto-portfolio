import "server-only";
import type { LanguageModel } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { defaultTenantId } from "@/lib/tenant/server";
import { decryptSecret, encryptSecret, keyHint } from "./crypto";
import { getAdminSupabase } from "./supabase";

export type LlmProviderKind = "google" | "gateway" | "openai" | "anthropic";

export interface LlmProviderRow {
  id: string;
  label: string;
  provider: LlmProviderKind;
  model_id: string;
  encrypted_key: string;
  key_hint: string;
  sort_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface LlmProviderPublic {
  id: string;
  label: string;
  provider: LlmProviderKind;
  modelId: string;
  keyHint: string;
  sortOrder: number;
  enabled: boolean;
}

export interface LlmProviderInput {
  label: string;
  provider: LlmProviderKind;
  modelId: string;
  apiKey: string;
  enabled?: boolean;
}

async function tenantIdForLlm(explicit?: string): Promise<string> {
  if (explicit?.trim()) return explicit.trim();
  const ctx = await resolveOfficeContext();
  return ctx?.tenantId ?? defaultTenantId();
}

function toPublic(row: LlmProviderRow): LlmProviderPublic {
  return {
    id: row.id,
    label: row.label,
    provider: row.provider,
    modelId: row.model_id,
    keyHint: row.key_hint,
    sortOrder: row.sort_order,
    enabled: row.enabled,
  };
}

export async function listLlmProviders(tenantId?: string): Promise<LlmProviderPublic[]> {
  const supabase = await getAdminSupabase();
  if (!supabase) return [];
  const tid = await tenantIdForLlm(tenantId);

  const { data, error } = await supabase
    .from("llm_providers")
    .select("*")
    .eq("tenant_id", tid)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("[myoffice] list llm providers failed", error);
    return [];
  }
  return (data as LlmProviderRow[]).map(toPublic);
}

export async function createLlmProvider(
  input: LlmProviderInput,
  tenantId?: string,
): Promise<LlmProviderPublic | null> {
  const supabase = await getAdminSupabase();
  if (!supabase) return null;
  const tid = await tenantIdForLlm(tenantId);

  const { data: maxRow } = await supabase
    .from("llm_providers")
    .select("sort_order")
    .eq("tenant_id", tid)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("llm_providers")
    .insert({
      tenant_id: tid,
      label: input.label.trim(),
      provider: input.provider,
      model_id: input.modelId.trim(),
      encrypted_key: encryptSecret(input.apiKey.trim()),
      key_hint: keyHint(input.apiKey),
      sort_order: sortOrder,
      enabled: input.enabled ?? true,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[myoffice] create llm provider failed", error);
    return null;
  }
  return toPublic(data as LlmProviderRow);
}

export async function updateLlmProvider(
  id: string,
  patch: Partial<LlmProviderInput> & { enabled?: boolean },
  tenantId?: string,
): Promise<boolean> {
  const supabase = await getAdminSupabase();
  if (!supabase) return false;
  const tid = await tenantIdForLlm(tenantId);

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.label !== undefined) update.label = patch.label.trim();
  if (patch.provider !== undefined) update.provider = patch.provider;
  if (patch.modelId !== undefined) update.model_id = patch.modelId.trim();
  if (patch.enabled !== undefined) update.enabled = patch.enabled;
  if (patch.apiKey !== undefined && patch.apiKey.trim()) {
    update.encrypted_key = encryptSecret(patch.apiKey.trim());
    update.key_hint = keyHint(patch.apiKey);
  }

  const { error } = await supabase
    .from("llm_providers")
    .update(update)
    .eq("id", id)
    .eq("tenant_id", tid);
  if (error) {
    console.error("[myoffice] update llm provider failed", error);
    return false;
  }
  return true;
}

export async function deleteLlmProvider(id: string, tenantId?: string): Promise<boolean> {
  const supabase = await getAdminSupabase();
  if (!supabase) return false;
  const tid = await tenantIdForLlm(tenantId);
  const { error } = await supabase
    .from("llm_providers")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tid);
  if (error) {
    console.error("[myoffice] delete llm provider failed", error);
    return false;
  }
  return true;
}

export async function reorderLlmProviders(
  idsInOrder: string[],
  tenantId?: string,
): Promise<boolean> {
  const supabase = await getAdminSupabase();
  if (!supabase) return false;
  const tid = await tenantIdForLlm(tenantId);

  for (let i = 0; i < idsInOrder.length; i++) {
    const { error } = await supabase
      .from("llm_providers")
      .update({ sort_order: i, updated_at: new Date().toISOString() })
      .eq("id", idsInOrder[i])
      .eq("tenant_id", tid);
    if (error) {
      console.error("[myoffice] reorder llm provider failed", error);
      return false;
    }
  }
  return true;
}

function rowToModel(row: LlmProviderRow): LanguageModel | string {
  const apiKey = decryptSecret(row.encrypted_key);
  switch (row.provider) {
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(row.model_id);
    }
    case "gateway":
      return row.model_id;
    case "openai":
      return `openai/${row.model_id}`;
    case "anthropic":
      return `anthropic/${row.model_id}`;
    default:
      return row.model_id;
  }
}

/** Resolve models in admin-defined priority order. Falls back to env when DB is empty. */
export async function resolveModelChain(
  tenantId?: string,
): Promise<(LanguageModel | string)[]> {
  const supabase = await getAdminSupabase();
  const tid = await tenantIdForLlm(tenantId);
  if (supabase) {
    const { data, error } = await supabase
      .from("llm_providers")
      .select("*")
      .eq("tenant_id", tid)
      .eq("enabled", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && data?.length) {
      return (data as LlmProviderRow[]).map(rowToModel);
    }
  }

  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (googleKey) {
    const google = createGoogleGenerativeAI({ apiKey: googleKey });
    return [google(process.env.ADVOCATE_GOOGLE_MODEL ?? "gemini-2.5-flash")];
  }

  return [process.env.ADVOCATE_MODEL ?? "google/gemini-2.0-flash"];
}

export function isRetryableModelError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /429|rate.?limit|quota|503|502|overloaded|too many requests|resource exhausted/i.test(
    message,
  );
}
