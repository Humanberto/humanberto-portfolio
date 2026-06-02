import "server-only";
import { NextResponse } from "next/server";
import { getAdminSessionFromCookies } from "./auth";

export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await getAdminSessionFromCookies();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
