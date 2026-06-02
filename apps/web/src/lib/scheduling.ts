/**
 * Resolve the live Cal.com booking URL from NEXT_PUBLIC_CAL_LINK.
 * Returns undefined when scheduling isn't configured — never a placeholder URL.
 *
 * Env format: `username/event-slug` (e.g. `humanberto/intro`) or full
 * `https://cal.com/username/event-slug`.
 */
export function getSchedulingUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_CAL_LINK?.trim();
  if (!raw) return undefined;

  if (/^https?:\/\//i.test(raw)) return raw;

  const slug = raw.replace(/^\/+|\/+$/g, "");
  return slug ? `https://cal.com/${slug}` : undefined;
}

/** Cal embed slug (username/event) for @calcom/embed-react. */
export function getCalEmbedLink(): string | undefined {
  const url = getSchedulingUrl();
  if (!url) return undefined;
  try {
    const path = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
    return path || undefined;
  } catch {
    return undefined;
  }
}
