import { authCallbackAbsoluteUrl } from "./site-url";

/** OAuth/email callback URL — must match an entry in Supabase Auth → URL Configuration. */
export function authCallbackUrl(next: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : undefined;
  return authCallbackAbsoluteUrl(next, origin);
}
