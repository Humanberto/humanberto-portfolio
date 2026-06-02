import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin/session";

const OFFICE_PREFIX = "/myoffice";
const LOGIN_PATH = `${OFFICE_PREFIX}/login`;
const PUBLIC_API = new Set([
  "/api/myoffice/auth/login",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isOfficePage = pathname.startsWith(OFFICE_PREFIX);
  const isOfficeApi = pathname.startsWith("/api/myoffice");

  if (!isOfficePage && !isOfficeApi) {
    return NextResponse.next();
  }

  if (PUBLIC_API.has(pathname)) {
    return NextResponse.next();
  }

  if (pathname === LOGIN_PATH || pathname === `${LOGIN_PATH}/`) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (await verifyAdminSession(token)) {
      return NextResponse.redirect(new URL(OFFICE_PREFIX, request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminSession(token))) {
    if (isOfficeApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL(LOGIN_PATH, request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/myoffice/:path*", "/api/myoffice/:path*"],
};
