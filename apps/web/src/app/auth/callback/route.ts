import { NextResponse, type NextRequest } from "next/server";
import {
  applyPendingCookies,
  createAuthServerClientForRequest,
} from "@/lib/auth/server";
import { resolvePostAuthPath } from "@/lib/auth/post-auth";
import { getTenantsForUser } from "@/lib/tenant/server";
import { TENANT_COOKIE } from "@/lib/tenant/office-context";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/signup?error=auth_callback`);
  }

  const { supabase, pendingCookies } = createAuthServerClientForRequest(request);
  if (!supabase) {
    return NextResponse.redirect(`${origin}/signup?error=auth_config`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const signup = new URL("/signup", origin);
    signup.searchParams.set("error", "auth_callback");
    signup.searchParams.set("reason", error.message.slice(0, 200));
    return NextResponse.redirect(signup);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let next = resolvePostAuthPath(undefined, searchParams.get("next"));

  if (user) {
    const tenants = await getTenantsForUser(user.id);
    const tenant = tenants[0];
    next = resolvePostAuthPath(tenant, searchParams.get("next"));

    if (tenant) {
      pendingCookies.push({
        name: TENANT_COOKIE,
        value: tenant.id,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 365,
        },
      });
    }
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  return applyPendingCookies(response, pendingCookies);
}
