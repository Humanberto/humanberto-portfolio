import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAuthServerClient, getAuthUser } from "@/lib/auth/server";
import { getTenantsForUser } from "@/lib/tenant/server";
import { TENANT_COOKIE } from "@/lib/tenant/office-context";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await createAuthServerClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/signup?error=auth_config`);
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const user = await getAuthUser();
      if (user) {
        const tenants = await getTenantsForUser(user.id);
        if (tenants[0]) {
          const jar = await cookies();
          jar.set(TENANT_COOKIE, tenants[0].id, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365,
          });
          if (next === "/onboarding") next = "/myoffice/studio";
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/signup?error=auth_callback`);
}
