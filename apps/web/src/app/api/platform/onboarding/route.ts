import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthUser } from "@/lib/auth/server";
import { seedTenantDefaults } from "@/lib/admin/content";
import { getAdminSupabase } from "@/lib/admin/supabase";
import { createTenantForUser, getTenantsForUser } from "@/lib/tenant/server";
import { TENANT_COOKIE } from "@/lib/tenant/office-context";
import { buildInitialSiteFromIntake } from "@/lib/platform/seed-from-intake";

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await req.json()) as {
    displayName?: string;
    slug?: string;
    answers?: Record<string, string>;
  };

  const displayName = body.displayName?.trim();
  const slug = body.slug?.trim().toLowerCase();
  const answers = body.answers ?? {};
  if (!displayName || !slug) {
    return NextResponse.json({ error: "Name and URL slug required." }, { status: 400 });
  }

  let tenant = (await getTenantsForUser(user.id))[0] ?? null;
  if (!tenant) {
    tenant = await createTenantForUser({ userId: user.id, slug, displayName });
    if (!tenant) {
      return NextResponse.json({ error: "Slug taken or invalid." }, { status: 409 });
    }
    await seedTenantDefaults(tenant.id);
    await buildInitialSiteFromIntake(
      tenant.id,
      displayName,
      user.email,
      answers,
    );
  }

  const supabase = await getAdminSupabase();
  if (supabase && Object.keys(answers).length > 0) {
    await supabase.from("tenant_research").insert({
      tenant_id: tenant.id,
      user_id: user.id,
      answers,
    });
    await supabase
      .from("tenants")
      .update({
        research_completed_at: new Date().toISOString(),
        research_responses: answers,
        status: "active",
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenant.id);
  }

  const jar = await cookies();
  jar.set(TENANT_COOKIE, tenant.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({
    tenant: { id: tenant.id, slug: tenant.slug, displayName: tenant.display_name },
  });
}
