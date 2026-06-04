import { NextResponse } from "next/server";
import { getAllProjects, saveAllProjects } from "@/lib/projects.server";
import { parseProjectFields } from "@/lib/projects.parse";
import { snapshotProjectDesignIfChanged } from "@/lib/design-system-versions.server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { slugifyTitle } from "@/lib/projects.shared";
import type { AdminProject } from "@/lib/projects.shared";

type Params = { params: Promise<{ slug: string }> };

function parsePatch(raw: unknown, current: AdminProject): AdminProject | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<AdminProject>;
  const title = (p.title ?? current.title).trim();
  if (!title) return null;

  const slug =
    p.slug?.trim() ||
    (p.title ? slugifyTitle(p.title) : current.slug);

  const published =
    typeof p.published === "boolean" ? p.published : current.published;
  const featured =
    typeof p.featured === "boolean" ? p.featured : current.featured;

  return {
    ...current,
    slug: slug.toLowerCase(),
    title,
    tagline: (p.tagline ?? current.tagline).trim(),
    year: (p.year ?? current.year).trim(),
    role: (p.role ?? current.role).trim(),
    pillars: Array.isArray(p.pillars) ? p.pillars : current.pillars,
    approach: Array.isArray(p.approach) ? p.approach : current.approach,
    outcomes: Array.isArray(p.outcomes) ? p.outcomes : current.outcomes,
    stack: Array.isArray(p.stack) ? p.stack : current.stack,
    links: { ...current.links, ...(p.links ?? {}) },
    accent: p.accent === "purple" ? "purple" : p.accent === "gold" ? "gold" : current.accent,
    ...parseProjectFields({ ...current, ...p }),
    published,
    featured,
  };
}

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const projects = await getAllProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(req: Request, { params }: Params) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();
  const existing = await getAllProjects(ctx.tenantId);
  const idx = existing.findIndex((p) => p.slug === slug);
  if (idx < 0) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const updated = parsePatch(body, existing[idx]!);
  if (!updated) {
    return NextResponse.json({ error: "Invalid project data." }, { status: 400 });
  }

  if (updated.slug !== slug && existing.some((p) => p.slug === updated.slug)) {
    return NextResponse.json({ error: "Slug already in use." }, { status: 409 });
  }

  await snapshotProjectDesignIfChanged(updated, existing[idx], ctx.tenantId);

  const next = [...existing];
  next[idx] = updated;
  const ok = await saveAllProjects(next, ctx.tenantId);
  if (!ok) return NextResponse.json({ error: "Save failed." }, { status: 500 });
  return NextResponse.json({ project: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { slug } = await params;
  const existing = await getAllProjects();
  const next = existing.filter((p) => p.slug !== slug);
  if (next.length === existing.length) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const ok = await saveAllProjects(next);
  if (!ok) return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
