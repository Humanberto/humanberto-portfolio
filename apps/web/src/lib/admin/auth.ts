import "server-only";
import { cookies } from "next/headers";
import { verifyAdminPassword } from "./crypto";
import {
  ADMIN_COOKIE,
  createAdminSession,
  verifyAdminSession,
  adminCookieOptions,
  clearAdminCookieOptions,
} from "./session";

export {
  ADMIN_COOKIE,
  createAdminSession,
  verifyAdminSession,
  adminCookieOptions,
  clearAdminCookieOptions,
};

function adminPasswordHash(): string | null {
  return process.env.ADMIN_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD ?? null;
}

export function isAdminConfigured(): boolean {
  return Boolean(adminPasswordHash() && process.env.ADMIN_SESSION_SECRET);
}

export async function verifyAdminCredentials(password: string): Promise<boolean> {
  const stored = adminPasswordHash();
  if (!stored) return false;
  return verifyAdminPassword(password, stored);
}

export async function getAdminSessionFromCookies(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  return verifyAdminSession(token);
}
