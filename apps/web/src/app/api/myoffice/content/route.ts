import { NextResponse } from "next/server";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";
import { defaultSite } from "@/lib/site";

export async function GET() {
  const [site, advocate_prompt, advocate_facts] = await Promise.all([
    getContentOverride("site"),
    getContentOverride("advocate_prompt"),
    getContentOverride("advocate_facts"),
  ]);

  return NextResponse.json({
    site: site ?? defaultSite,
    advocate_prompt: advocate_prompt ?? "",
    advocate_facts: advocate_facts ?? null,
  });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as {
    site?: unknown;
    advocate_prompt?: string;
    advocate_facts?: unknown;
  };

  if (body.site !== undefined) {
    const ok = await setContentOverride("site", body.site);
    if (!ok) return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
  if (body.advocate_prompt !== undefined) {
    const ok = await setContentOverride("advocate_prompt", body.advocate_prompt);
    if (!ok) return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
  if (body.advocate_facts !== undefined) {
    const ok = await setContentOverride("advocate_facts", body.advocate_facts);
    if (!ok) return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
