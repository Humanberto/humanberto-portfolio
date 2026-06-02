import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminCookieOptions,
  createAdminSession,
  isAdminConfigured,
  verifyAdminCredentials,
} from "@/lib/admin/auth";

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin auth is not configured on this server. Set ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET in Vercel, then redeploy.",
      },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!(await verifyAdminCredentials(password))) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const token = await createAdminSession();
  const jar = await cookies();
  jar.set(adminCookieOptions(token));
  return NextResponse.json({ ok: true });
}
