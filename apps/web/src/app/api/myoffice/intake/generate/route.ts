import { NextResponse } from "next/server";
import { buildSiteFromIntakeAssets } from "@/lib/platform/build-from-assets";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { getAuthUser } from "@/lib/auth/server";

export const maxDuration = 120;

export async function POST() {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getAuthUser();
  const result = await buildSiteFromIntakeAssets(ctx.tenantId, {
    email: user?.email,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Build failed." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
