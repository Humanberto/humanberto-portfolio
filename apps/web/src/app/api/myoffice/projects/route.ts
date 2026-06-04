import { NextResponse } from "next/server";
import { getAllProjects, saveAllProjects } from "@/lib/projects.server";
import { parseProjectFields } from "@/lib/projects.parse";
import { snapshotProjectDesignIfChanged } from "@/lib/design-system-versions.server";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import {
  emptyProject,
  slugifyTitle,
  type AdminProject,
} from "@/lib/projects.shared";

function parseProject(raw: unknown): AdminProject | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<AdminProject>;
  if (!p.title?.trim()) return null;

  const slug = (p.slug?.trim() || slugifyTitle(p.title)).toLowerCase();
  if (!slug) return null;

  return {
    slug,
    title: p.title.trim(),
    tagline: p.tagline?.trim() ?? "",
    year: p.year?.trim() ?? String(new Date().getFullYear()),
    role: p.role?.trim() ?? "",
    pillars: Array.isArray(p.pillars) ? p.pillars : [],
    status: p.status ?? "in-progress",
    summary: p.summary?.trim() ?? "",
    problem: p.problem?.trim() ?? "",
    approach: Array.isArray(p.approach) ? p.approach.filter(Boolean) : [],
    outcomes: Array.isArray(p.outcomes) ? p.outcomes.filter(Boolean) : [],
    stack: Array.isArray(p.stack) ? p.stack.filter(Boolean) : [],
    links: {
      live: p.links?.live?.trim() || undefined,
      repo: p.links?.repo?.trim() || undefined,
      caseStudy: p.links?.caseStudy?.trim() || undefined,
      prototype: p.links?.prototype?.trim() || undefined,
    },
    featured: Boolean(p.featured),
    published: typeof p.published === "boolean" ? p.published : false,
    accent: p.accent === "purple" ? "purple" : "gold",
    ...parseProjectFields(p),
  };
}

export async function GET() {
  const projects = await getAllProjects();
  return NextResponse.json({ projects });
}

export async function PUT(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { projects?: unknown[] };
  if (!Array.isArray(body.projects)) {
    return NextResponse.json({ error: "Expected projects array." }, { status: 400 });
  }

  const existing = await getAllProjects(ctx.tenantId);
  const parsed: AdminProject[] = [];
  const slugs = new Set<string>();

  for (const raw of body.projects) {
    const project = parseProject(raw);
    if (!project) {
      return NextResponse.json({ error: "Each project needs at least a title." }, { status: 400 });
    }
    if (slugs.has(project.slug)) {
      return NextResponse.json(
        { error: `Duplicate slug: ${project.slug}` },
        { status: 400 },
      );
    }
    slugs.add(project.slug);
    parsed.push(project);
  }

  for (const project of parsed) {
    const prev = existing.find((p) => p.slug === project.slug);
    await snapshotProjectDesignIfChanged(project, prev, ctx.tenantId);
  }

  const ok = await saveAllProjects(parsed, ctx.tenantId);
  if (!ok) {
    return NextResponse.json({ error: "Save failed. Check Supabase config." }, { status: 500 });
  }
  return NextResponse.json({ projects: parsed });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<AdminProject>;
  const project = parseProject({ ...emptyProject(), ...body, published: body.published ?? false });
  if (!project) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const existing = await getAllProjects();
  if (existing.some((p) => p.slug === project.slug)) {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }

  const next = [project, ...existing];
  const ok = await saveAllProjects(next);
  if (!ok) {
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
  return NextResponse.json({ project });
}
