import { NextResponse } from "next/server";
import { buildSiteFromIntakeAssets } from "@/lib/platform/build-from-assets";
import { getAuthUser } from "@/lib/auth/server";
import { getTenantsForUser } from "@/lib/tenant/server";
import { cookies } from "next/headers";
import { TENANT_COOKIE } from "@/lib/tenant/office-context";

export const maxDuration = 120;

async function resolveTenantId(userId: string): Promise<string | null> {
  const jar = await cookies();
  const fromCookie = jar.get(TENANT_COOKIE)?.value;
  const memberships = await getTenantsForUser(userId);
  if (fromCookie && memberships.some((t) => t.id === fromCookie)) return fromCookie;
  return memberships[0]?.id ?? null;
}

export async function POST() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) return NextResponse.json({ error: "No tenant." }, { status: 404 });

  const result = await buildSiteFromIntakeAssets(tenantId, { email: user.email });
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Build failed." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
