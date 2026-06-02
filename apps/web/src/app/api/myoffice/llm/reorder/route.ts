import { NextResponse } from "next/server";
import { reorderLlmProviders } from "@/lib/admin/llm-providers";

export async function POST(req: Request) {
  const body = (await req.json()) as { ids?: string[] };
  if (!body.ids?.length) {
    return NextResponse.json({ error: "Missing ids." }, { status: 400 });
  }

  const ok = await reorderLlmProviders(body.ids);
  if (!ok) return NextResponse.json({ error: "Reorder failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
