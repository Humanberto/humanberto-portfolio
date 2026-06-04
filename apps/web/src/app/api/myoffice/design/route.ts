import { NextResponse } from "next/server";
import { mergeDesignSystem } from "@humanberto/ui";
import { getGlobalDesignSystem, saveGlobalDesignSystem } from "@/lib/design-system.server";
import { snapshotGlobalDesignIfChanged } from "@/lib/design-system-versions.server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";

export async function GET() {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const system = await getGlobalDesignSystem(ctx.tenantId);
  return NextResponse.json({ system });
}

export async function PUT(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { system?: unknown };
  if (!body.system) {
    return NextResponse.json({ error: "Missing system." }, { status: 400 });
  }

  const existing = await getGlobalDesignSystem(ctx.tenantId);
  const system = mergeDesignSystem(existing, body.system as Parameters<typeof mergeDesignSystem>[1]);
  await snapshotGlobalDesignIfChanged(system, ctx.tenantId);
  const ok = await saveGlobalDesignSystem(system, ctx.tenantId);
  if (!ok) {
    return NextResponse.json({ error: "Save failed. Check Supabase config." }, { status: 500 });
  }
  return NextResponse.json({ system });
}
