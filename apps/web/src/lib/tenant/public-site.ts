import { BOOTSTRAP_TENANT_SLUG, tenantPublicPath } from "@/lib/tenant/constants";

export type TenantNavLink = { href: string; label: string };

/** Public path under a tenant site (bootstrap uses root paths). */
export function tenantPagePath(tenantSlug: string, segment: string): string {
  const base = tenantPublicPath(tenantSlug);
  if (!segment || segment === "/") return base;
  const path = segment.startsWith("/") ? segment : `/${segment}`;
  return base === "/" ? path : `${base}${path}`;
}

export function tenantWorkPath(tenantSlug: string, projectSlug?: string): string {
  if (projectSlug) {
    return tenantPagePath(tenantSlug, `/work/${projectSlug}`);
  }
  return tenantPagePath(tenantSlug, "/work");
}

export function tenantFitCheckHref(tenantSlug: string): string {
  return `${tenantPagePath(tenantSlug, "/chat")}#fit-check`;
}

/** Nav links for tenant portfolios — same structure as humanberto.com minus Studio. */
export function tenantNavLinks(
  tenantSlug: string,
  opts?: { advocate?: boolean },
): TenantNavLink[] {
  if (tenantSlug === BOOTSTRAP_TENANT_SLUG) {
    throw new Error("Use marketing nav for bootstrap tenant");
  }

  const links: TenantNavLink[] = [
    { href: tenantPagePath(tenantSlug, "/work"), label: "Work" },
    { href: tenantPagePath(tenantSlug, "/about"), label: "About" },
  ];

  if (opts?.advocate !== false) {
    links.push(
      { href: tenantPagePath(tenantSlug, "/chat"), label: "AI Advocate" },
      { href: tenantFitCheckHref(tenantSlug), label: "Score my fit" },
    );
  }

  links.push({ href: tenantPagePath(tenantSlug, "/contact"), label: "Contact" });
  return links;
}

export function advocateEnabledFromIntake(answers?: Record<string, string>): boolean {
  const v = answers?.advocate?.toLowerCase() ?? "";
  return v !== "no";
}
