import { NextResponse } from "next/server";
import { deleteLlmProvider, updateLlmProvider } from "@/lib/admin/llm-providers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = (await req.json()) as {
    label?: string;
    provider?: "google" | "gateway" | "openai" | "anthropic";
    modelId?: string;
    apiKey?: string;
    enabled?: boolean;
  };

  const ok = await updateLlmProvider(id, body);
  if (!ok) return NextResponse.json({ error: "Update failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const ok = await deleteLlmProvider(id);
  if (!ok) return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
