import { NextResponse, type NextRequest } from "next/server";
import {
  applyPendingCookies,
  createAuthServerClientForRequest,
} from "@/lib/auth/server";
import { getTenantsForUser } from "@/lib/tenant/server";
import { TENANT_COOKIE } from "@/lib/tenant/office-context";

function safeNextPath(raw: string | null): string {
  const next = raw ?? "/onboarding";
  if (!next.startsWith("/") || next.startsWith("//")) return "/onboarding";
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  let next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/signup?error=auth_callback`);
  }

  const { supabase, pendingCookies } = createAuthServerClientForRequest(request);
  if (!supabase) {
    return NextResponse.redirect(`${origin}/signup?error=auth_config`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/signup?error=auth_callback`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const tenants = await getTenantsForUser(user.id);
    if (tenants[0]) {
      pendingCookies.push({
        name: TENANT_COOKIE,
        value: tenants[0].id,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 365,
        },
      });
      if (next === "/onboarding") next = "/myoffice/studio";
    }
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  return applyPendingCookies(response, pendingCookies);
}
