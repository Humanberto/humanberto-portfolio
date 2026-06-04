import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin/session";

const OFFICE_PREFIX = "/myoffice";
const LOGIN_PATH = `${OFFICE_PREFIX}/login`;
const PUBLIC_OFFICE_API = new Set([
  "/api/myoffice/auth/login",
]);

const PUBLIC_AUTH_PATHS = new Set([
  "/signup",
  "/studio",
  "/build",
  "/onboarding",
  "/auth/callback",
]);

async function hasOfficeAccess(request: NextRequest): Promise<boolean> {
  const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
  if (await verifyAdminSession(adminToken)) return true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const errorDescription = searchParams.get("error_description") ?? "";

  // Supabase OAuth failures redirect to Site URL with ?error=… (blank homepage today).
  if (oauthError && pathname !== "/signup") {
    const signup = new URL("/signup", request.url);
    signup.searchParams.set("error", "oauth");
    if (/exchange external code/i.test(errorDescription)) {
      signup.searchParams.set("reason", "google_exchange");
    } else if (errorDescription) {
      signup.searchParams.set("reason", errorDescription.slice(0, 200));
    }
    return NextResponse.redirect(signup);
  }

  // Supabase sometimes redirects to Site URL root (?code=...) instead of /auth/callback.
  if (code && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!url.searchParams.has("next")) {
      url.searchParams.set("next", "/onboarding");
    }
    return NextResponse.redirect(url);
  }

  if (PUBLIC_AUTH_PATHS.has(pathname) || pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  const isOfficePage = pathname.startsWith(OFFICE_PREFIX);
  const isOfficeApi = pathname.startsWith("/api/myoffice");

  if (!isOfficePage && !isOfficeApi) {
    return NextResponse.next();
  }

  if (PUBLIC_OFFICE_API.has(pathname)) {
    return NextResponse.next();
  }

  if (pathname === LOGIN_PATH || pathname === `${LOGIN_PATH}/`) {
    if (await hasOfficeAccess(request)) {
      return NextResponse.redirect(new URL(OFFICE_PREFIX, request.url));
    }
    return NextResponse.next();
  }

  if (!(await hasOfficeAccess(request))) {
    if (isOfficeApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/signup", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/myoffice/:path*",
    "/api/myoffice/:path*",
    "/signup",
    "/studio",
    "/build",
    "/onboarding",
    "/auth/callback",
  ],
};
