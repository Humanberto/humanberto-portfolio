/** OAuth/email callback URL — must match an entry in Supabase Auth → URL Configuration. */
export function authCallbackUrl(next: string): string {
  const path = `/auth/callback?next=${encodeURIComponent(next)}`;

  if (typeof window === "undefined") return path;

  const { origin, hostname } = window.location;

  // Production hosts: use the exact origin the user is on (www vs apex).
  if (
    hostname === "humanberto.com" ||
    hostname === "www.humanberto.com" ||
    hostname.endsWith(".vercel.app")
  ) {
    return `${origin}${path}`;
  }

  // Local dev: always use current origin/port (e.g. localhost:3006).
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${origin}${path}`;
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured?.startsWith("http")) {
    return `${configured}${path}`;
  }

  return `${origin}${path}`;
}
