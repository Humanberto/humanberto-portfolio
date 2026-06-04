const PRODUCTION_ORIGIN = "https://www.humanberto.com";

function isProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

/** Canonical public site origin for OAuth redirects and metadata. */
export function canonicalSiteOrigin(): string {
  if (isProductionDeploy()) return PRODUCTION_ORIGIN;

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured?.startsWith("http://") || configured?.startsWith("https://")) {
    try {
      const { hostname } = new URL(configured);
      if (!isLocalDevHost(hostname)) return configured;
    } catch {
      /* fall through */
    }
  }
  return PRODUCTION_ORIGIN;
}

export function isLocalDevHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** Build absolute callback URL for OAuth — must match Supabase redirect allow-list. */
export function authCallbackAbsoluteUrl(next: string, requestOrigin?: string): string {
  const path = `/auth/callback?next=${encodeURIComponent(next)}`;

  if (requestOrigin) {
    try {
      const { hostname, origin } = new URL(requestOrigin);
      if (isLocalDevHost(hostname)) return `${origin}${path}`;
      if (
        hostname === "humanberto.com" ||
        hostname === "www.humanberto.com" ||
        hostname.endsWith(".vercel.app")
      ) {
        return `${origin}${path}`;
      }
    } catch {
      /* fall through */
    }
  }

  return `${canonicalSiteOrigin()}${path}`;
}
