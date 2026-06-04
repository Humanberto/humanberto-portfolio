import { NextResponse } from "next/server";
import { mergeDesignSystem } from "@humanberto/ui";
import { getGlobalDesignSystem, saveGlobalDesignSystem } from "@/lib/design-system.server";

export async function GET() {
  const system = await getGlobalDesignSystem();
  return NextResponse.json({ system });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as { system?: unknown };
  if (!body.system) {
    return NextResponse.json({ error: "Missing system." }, { status: 400 });
  }

  const existing = await getGlobalDesignSystem();
  const system = mergeDesignSystem(existing, body.system as Parameters<typeof mergeDesignSystem>[1]);
  const ok = await saveGlobalDesignSystem(system);
  if (!ok) {
    return NextResponse.json({ error: "Save failed. Check Supabase config." }, { status: 500 });
  }
  return NextResponse.json({ system });
}
