import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAdminCookieOptions } from "@/lib/admin/auth";
import { createAuthServerClient } from "@/lib/auth/server";
import { TENANT_COOKIE } from "@/lib/tenant/office-context";

export async function POST(req: Request) {
  const jar = await cookies();
  jar.set(clearAdminCookieOptions());
  jar.delete(TENANT_COOKIE);

  const supabase = await createAuthServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/signup", req.url));
}
