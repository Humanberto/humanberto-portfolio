import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { getGlobalDesignSystem } from "@/lib/design-system.server";
import {
  listDesignSystemVersions,
  pushDesignSystemVersion,
  restoreDesignSystemVersion,
  resetGlobalDesignToDefaults,
  unifyAllProjectsToGlobalDesign,
} from "@/lib/design-system-versions.server";
import { getAllProjects } from "@/lib/projects.server";
import {
  projectDesignScope,
  sanitizeProjectDesignBinding,
  SYSTEM_DESIGN_SCOPE,
} from "@humanberto/ui";

function scopeKey(scope: "system" | "project", slug?: string): string | null {
  if (scope === "system") return SYSTEM_DESIGN_SCOPE;
  if (!slug?.trim()) return null;
  return projectDesignScope(slug);
}

export async function GET(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") === "project" ? "project" : "system";
  const slug = url.searchParams.get("slug") ?? undefined;
  const key = scopeKey(scope, slug);
  if (!key) return NextResponse.json({ error: "Project slug required." }, { status: 400 });

  const versions = await listDesignSystemVersions(key, ctx.tenantId);
  return NextResponse.json({ versions, scopeKey: key });
}

const postSchema = z.object({
  scope: z.enum(["system", "project"]),
  slug: z.string().optional(),
  label: z.string().optional(),
});

export async function POST(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = postSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const key = scopeKey(body.data.scope, body.data.slug);
  if (!key) return NextResponse.json({ error: "Project slug required." }, { status: 400 });

  if (body.data.scope === "system") {
    const system = await getGlobalDesignSystem(ctx.tenantId);
    const version = await pushDesignSystemVersion(
      key,
      body.data.label ?? "Manual save",
      { kind: "system", system },
      ctx.tenantId,
    );
    return NextResponse.json({ version });
  }

  const projects = await getAllProjects(ctx.tenantId);
  const project = projects.find((p) => p.slug === body.data.slug?.trim().toLowerCase());
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const version = await pushDesignSystemVersion(
    key,
    body.data.label ?? "Project theme save",
    { kind: "project", binding: project.designSystem ?? null },
    ctx.tenantId,
  );
  return NextResponse.json({ version });
}

const patchSchema = z.object({
  scope: z.enum(["system", "project"]),
  slug: z.string().optional(),
  versionId: z.string().uuid(),
});

export async function PATCH(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const key = scopeKey(body.data.scope, body.data.slug);
  if (!key) return NextResponse.json({ error: "Project slug required." }, { status: 400 });

  const result = await restoreDesignSystemVersion(key, body.data.versionId, ctx.tenantId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  if (body.data.scope === "system") {
    const system = await getGlobalDesignSystem(ctx.tenantId);
    return NextResponse.json({ version: result.version, system });
  }

  const projects = await getAllProjects(ctx.tenantId);
  const project = projects.find((p) => p.slug === body.data.slug?.trim().toLowerCase());
  return NextResponse.json({
    version: result.version,
    binding: sanitizeProjectDesignBinding(project?.designSystem) ?? { mode: "inherit" as const },
  });
}

const actionSchema = z.object({
  action: z.enum(["unify", "reset-defaults"]),
});

/** POST /api/myoffice/design/versions — bulk restore actions */
export async function PUT(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = actionSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  if (body.data.action === "unify") {
    const result = await unifyAllProjectsToGlobalDesign(ctx.tenantId);
    return NextResponse.json(result);
  }

  const system = await resetGlobalDesignToDefaults(ctx.tenantId);
  return NextResponse.json({ system });
}
