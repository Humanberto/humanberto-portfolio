import "server-only";
import { randomUUID } from "node:crypto";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";
import {
  emptyIntakeAssets,
  normalizeIntakeAssets,
  type IntakeAssetCategory,
  type IntakeAssetItem,
  type IntakeAssetsRecord,
} from "@/lib/platform/intake-assets";

const BUCKET = "tenant-intake";
const MAX_BYTES = 20 * 1024 * 1024;

const CATEGORY_MIMES: Record<IntakeAssetCategory, Set<string>> = {
  resume: new Set(["application/pdf", "text/plain", "text/markdown"]),
  portfolio: new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]),
  projects: new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]),
  inspiration: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
};

function guessMime(name: string, fallback: string): string {
  if (fallback && fallback !== "application/octet-stream") return fallback;
  if (/\.pdf$/i.test(name)) return "application/pdf";
  if (/\.(txt|md)$/i.test(name)) return "text/plain";
  if (/\.(jpe?g)$/i.test(name)) return "image/jpeg";
  if (/\.png$/i.test(name)) return "image/png";
  if (/\.webp$/i.test(name)) return "image/webp";
  if (/\.gif$/i.test(name)) return "image/gif";
  return fallback;
}

export async function getIntakeAssets(tenantId: string): Promise<IntakeAssetsRecord> {
  const raw = await getContentOverride<unknown>("intake_assets", tenantId);
  return normalizeIntakeAssets(raw ?? emptyIntakeAssets());
}

export async function saveIntakeAssets(
  tenantId: string,
  assets: IntakeAssetsRecord,
): Promise<boolean> {
  return setContentOverride("intake_assets", assets, tenantId);
}

export async function uploadIntakeAsset(
  tenantId: string,
  category: IntakeAssetCategory,
  file: File,
): Promise<IntakeAssetItem | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const mime = guessMime(file.name, file.type || "application/octet-stream");
  if (!CATEGORY_MIMES[category].has(mime)) return null;
  if (file.size > MAX_BYTES) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  const path = `${tenantId}/${category}/${Date.now()}-${safeName}`;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    upsert: false,
  });
  if (error) {
    console.error("[intake] upload failed", error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const item: IntakeAssetItem = {
    id: randomUUID(),
    category,
    name: file.name,
    url: data.publicUrl,
    path,
    mimeType: mime,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };

  const assets = await getIntakeAssets(tenantId);
  assets[category].push(item);
  const ok = await saveIntakeAssets(tenantId, assets);
  return ok ? item : null;
}
