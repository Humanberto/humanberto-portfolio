import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/server";
import { getIntakeAssets, uploadIntakeAsset } from "@/lib/admin/intake-media";
import { getTenantsForUser } from "@/lib/tenant/server";
import { cookies } from "next/headers";
import { TENANT_COOKIE } from "@/lib/tenant/office-context";
import type { IntakeAssetCategory } from "@/lib/platform/intake-assets";

export const runtime = "nodejs";
export const maxDuration = 60;

const CATEGORIES = new Set<IntakeAssetCategory>([
  "resume",
  "portfolio",
  "projects",
  "inspiration",
]);

async function resolveTenantId(userId: string): Promise<string | null> {
  const jar = await cookies();
  const fromCookie = jar.get(TENANT_COOKIE)?.value;
  const memberships = await getTenantsForUser(userId);
  if (fromCookie && memberships.some((t) => t.id === fromCookie)) return fromCookie;
  return memberships[0]?.id ?? null;
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) return NextResponse.json({ error: "No tenant." }, { status: 404 });

  const assets = await getIntakeAssets(tenantId);
  return NextResponse.json({ assets });
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) return NextResponse.json({ error: "No tenant." }, { status: 404 });

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

  const item = await uploadIntakeAsset(tenantId, category, file);
  if (!item) {
    return NextResponse.json(
      { error: "Upload failed. Check file type and size (max 20MB)." },
      { status: 500 },
    );
  }

  return NextResponse.json({ item });
}
