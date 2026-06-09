import { NextResponse } from "next/server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import {
  deleteCustomPage,
  getPageDocument,
  savePageDocument,
} from "@/lib/page-builder/server";
import type { PageDocument } from "@/lib/page-builder/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pageId } = await params;
  const page = await getPageDocument(pageId, ctx.isBootstrapOffice);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pageId } = await params;
  const body = (await req.json()) as PageDocument;
  if (body.id !== pageId) {
    return NextResponse.json({ error: "Page id mismatch." }, { status: 400 });
  }

  const ok = await savePageDocument(body, ctx.isBootstrapOffice);
  if (!ok) return NextResponse.json({ error: "Save failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pageId } = await params;
  const ok = await deleteCustomPage(pageId, ctx.isBootstrapOffice);
  if (!ok) return NextResponse.json({ error: "Delete failed." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
