import { NextResponse } from "next/server";
import {
  createLlmProvider,
  listLlmProviders,
  type LlmProviderKind,
} from "@/lib/admin/llm-providers";

export async function GET() {
  const providers = await listLlmProviders();
  return NextResponse.json({ providers });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    label?: string;
    provider?: LlmProviderKind;
    modelId?: string;
    apiKey?: string;
  };

  if (!body.label?.trim() || !body.provider || !body.modelId?.trim() || !body.apiKey?.trim()) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const created = await createLlmProvider({
    label: body.label,
    provider: body.provider,
    modelId: body.modelId,
    apiKey: body.apiKey,
  });

  if (!created) {
    return NextResponse.json(
      { error: "Could not save. Check Supabase and ADMIN_ENCRYPTION_KEY." },
      { status: 500 },
    );
  }

  return NextResponse.json({ provider: created });
}
