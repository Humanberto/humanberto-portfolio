import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/server";
import { getTenantsForUser } from "@/lib/tenant/server";
import { TENANT_COOKIE } from "@/lib/tenant/office-context";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const tenants = await getTenantsForUser(user.id);
  const tenant = tenants[0];
  if (!tenant) {
    return NextResponse.json({ error: "No portfolio yet." }, { status: 404 });
  }

  const jar = await cookies();
  jar.set(TENANT_COOKIE, tenant.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      displayName: tenant.display_name,
      status: tenant.status,
    },
  });
}
