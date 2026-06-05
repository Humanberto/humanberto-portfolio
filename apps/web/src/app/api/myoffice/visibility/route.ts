import { NextResponse } from "next/server";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { BOOTSTRAP_TENANT_SLUG } from "@/lib/tenant/constants";
import { getTenantById } from "@/lib/tenant/server";
import {
  listFeatureDefinitions,
  resolveSiteVisibility,
  type SiteVisibilityOverrides,
} from "@/lib/site-visibility";

export async function GET() {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getTenantById(ctx.tenantId);
  const scope = tenant?.slug === BOOTSTRAP_TENANT_SLUG ? "bootstrap" : "tenant";
  const raw = await getContentOverride<SiteVisibilityOverrides>("site_visibility", ctx.tenantId);
  const visibility = resolveSiteVisibility(scope, raw);

  return NextResponse.json({
    scope,
    visibility,
    features: listFeatureDefinitions(scope),
  });
}

export async function PUT(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { overrides?: SiteVisibilityOverrides };
  if (!body.overrides || typeof body.overrides !== "object") {
    return NextResponse.json({ error: "overrides object required." }, { status: 400 });
  }

  const sanitized: SiteVisibilityOverrides = {};
  for (const [key, value] of Object.entries(body.overrides)) {
    if (typeof value === "boolean" && key.trim()) sanitized[key.trim()] = value;
  }

  const ok = await setContentOverride("site_visibility", sanitized, ctx.tenantId);
  if (!ok) return NextResponse.json({ error: "Save failed." }, { status: 500 });

  const tenant = await getTenantById(ctx.tenantId);
  const scope = tenant?.slug === BOOTSTRAP_TENANT_SLUG ? "bootstrap" : "tenant";

  return NextResponse.json({
    ok: true,
    visibility: resolveSiteVisibility(scope, sanitized),
  });
}
