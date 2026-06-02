import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAdminCookieOptions } from "@/lib/admin/auth";

export async function POST(req: Request) {
  const jar = await cookies();
  jar.set(clearAdminCookieOptions());
  return NextResponse.redirect(new URL("/myoffice/login", req.url));
}
