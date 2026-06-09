import type { PageDocument, PageZone } from "./types";

export type SystemPageDef = {
  id: string;
  title: string;
  publicPath: string;
  zone: PageZone;
  description: string;
  /** Dedicated editor elsewhere in My Office */
  dedicatedEditor?: string;
  scopes: ("bootstrap" | "tenant")[];
};

export const SYSTEM_PAGE_CATALOG: SystemPageDef[] = [
  {
    id: "home",
    title: "Home",
    publicPath: "/",
    zone: "public",
    description: "Landing hero, pillars, featured projects, advocate band.",
    dedicatedEditor: "/myoffice/content",
    scopes: ["bootstrap", "tenant"],
  },
  {
    id: "work",
    title: "Work",
    publicPath: "/work",
    zone: "public",
    description: "Portfolio explorer and case studies.",
    dedicatedEditor: "/myoffice/projects",
    scopes: ["bootstrap", "tenant"],
  },
  {
    id: "about",
    title: "About",
    publicPath: "/about",
    zone: "public",
    description: "Bio, timeline, and focus areas.",
    dedicatedEditor: "/myoffice/pages/about",
    scopes: ["bootstrap", "tenant"],
  },
  {
    id: "contact",
    title: "Contact",
    publicPath: "/contact",
    zone: "public",
    description: "Email, scheduling, and connect links.",
    dedicatedEditor: "/myoffice/content",
    scopes: ["bootstrap", "tenant"],
  },
  {
    id: "chat",
    title: "AI Advocate",
    publicPath: "/chat",
    zone: "public",
    description: "Chat UI and fit-check entry.",
    dedicatedEditor: "/myoffice/content",
    scopes: ["bootstrap", "tenant"],
  },
  {
    id: "studio",
    title: "Studio",
    publicPath: "/studio",
    zone: "public",
    description: "Humanberto Studio marketing page.",
    dedicatedEditor: "/myoffice/pages/studio",
    scopes: ["bootstrap"],
  },
  {
    id: "privacy",
    title: "Privacy",
    publicPath: "/privacy",
    zone: "public",
    description: "Privacy policy.",
    dedicatedEditor: "/myoffice/pages/privacy",
    scopes: ["bootstrap", "tenant"],
  },
  {
    id: "terms",
    title: "Terms",
    publicPath: "/terms",
    zone: "public",
    description: "Terms of service.",
    dedicatedEditor: "/myoffice/pages/terms",
    scopes: ["bootstrap", "tenant"],
  },
  {
    id: "myoffice-login",
    title: "My Office login",
    publicPath: "/myoffice/login",
    zone: "myoffice",
    description: "Back office sign-in screen.",
    dedicatedEditor: "/myoffice/pages/myoffice-login",
    scopes: ["bootstrap", "tenant"],
  },
];

export function catalogForScope(isBootstrap: boolean): SystemPageDef[] {
  const scope = isBootstrap ? "bootstrap" : "tenant";
  return SYSTEM_PAGE_CATALOG.filter((p) => p.scopes.includes(scope));
}

export function slugifyPageTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "page";
}

export function tenantPublicPathPrefix(tenantSlug: string): string {
  return `/s/${tenantSlug}`;
}

export function resolvePublicUrl(
  page: Pick<PageDocument, "publicPath" | "kind" | "slug">,
  isBootstrap: boolean,
  tenantSlug?: string,
): string {
  if (page.kind === "custom") {
    const base = isBootstrap ? "" : tenantPublicPathPrefix(tenantSlug ?? "");
    return `${base}/pages/${page.slug}`;
  }
  if (!isBootstrap && tenantSlug) {
    if (page.publicPath === "/") return tenantPublicPathPrefix(tenantSlug);
    return `${tenantPublicPathPrefix(tenantSlug)}${page.publicPath}`;
  }
  return page.publicPath;
}
