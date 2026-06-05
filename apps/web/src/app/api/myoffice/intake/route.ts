import { NextResponse } from "next/server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { getIntakeAssets, uploadIntakeAsset } from "@/lib/admin/intake-media";
import type { IntakeAssetCategory } from "@/lib/platform/intake-assets";

export const runtime = "nodejs";
export const maxDuration = 60;

const CATEGORIES = new Set<IntakeAssetCategory>([
  "resume",
  "portfolio",
  "projects",
  "inspiration",
]);

export async function GET() {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assets = await getIntakeAssets(ctx.tenantId);
  return NextResponse.json({ assets });
}

export async function POST(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const category = String(form.get("category") ?? "") as IntakeAssetCategory;
  if (!CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a file." }, { status: 400 });
  }

  const item = await uploadIntakeAsset(ctx.tenantId, category, file);
  if (!item) {
    return NextResponse.json(
      { error: "Upload failed. Check file type and size (max 20MB)." },
      { status: 500 },
    );
  }

  return NextResponse.json({ item });
}
