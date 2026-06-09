import { NextResponse } from "next/server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import {
  createCustomPage,
  getPageBuilderStore,
  listCatalogWithPages,
} from "@/lib/page-builder/server";

export async function GET() {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await getPageBuilderStore(ctx.isBootstrapOffice);
  const listing = listCatalogWithPages(store, ctx.isBootstrapOffice);
  return NextResponse.json({ ...listing, store });
}

export async function POST(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { title?: string };
  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Title required." }, { status: 400 });
  }

  const page = await createCustomPage(title, ctx.isBootstrapOffice);
  if (!page) {
    return NextResponse.json({ error: "Could not create page (duplicate slug?)." }, { status: 409 });
  }

  return NextResponse.json({ page });
}
