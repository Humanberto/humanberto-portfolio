import "server-only";

const BUCKET = "project-media";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function uploadProjectMedia(
  file: File,
  projectSlug: string,
  kind: "image" | "video",
): Promise<{ url: string; path: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const allowed = kind === "image" ? IMAGE_TYPES : VIDEO_TYPES;
  const type = file.type || "application/octet-stream";
  if (!allowed.has(type)) return null;

  const maxBytes = kind === "image" ? 12 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > maxBytes) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  const path = `${projectSlug}/${Date.now()}-${safeName}`;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: type,
    upsert: false,
  });

  if (error) {
    console.error("[myoffice] media upload failed", error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
