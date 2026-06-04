import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { withModelChain } from "@/lib/advocate-model";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { getAdminSupabase } from "@/lib/admin/supabase";
import {
  PROJECT_STUDIO_SYSTEM_PROMPT,
  STUDIO_SYSTEM_PROMPT,
  applyProjectStudioPatch,
  applyStudioPatch,
  loadProjectStudioState,
  loadStudioState,
  normalizeProjectStudioPatch,
  type ProjectStudioPatch,
  type StudioPatch,
} from "@/lib/studio/agent";

export const maxDuration = 60;

const designSystemPatchSchema = z
  .object({
    name: z.string().optional(),
    colors: z.record(z.string(), z.string()).optional(),
    typography: z.record(z.string(), z.string()).optional(),
    buttons: z
      .object({
        borderRadius: z.string().optional(),
      })
      .optional(),
  })
  .optional();

const sitePatchSchema = z
  .object({
    name: z.string().optional(),
    tagline: z.string().optional(),
    role: z.string().optional(),
    shortName: z.string().optional(),
  })
  .optional();

const projectPatchSchema = z
  .object({
    title: z.string().optional(),
    tagline: z.string().optional(),
    summary: z.string().optional(),
    problem: z.string().optional(),
    approach: z.array(z.string()).optional(),
    outcomes: z.array(z.string()).optional(),
    stack: z.array(z.string()).optional(),
    role: z.string().optional(),
    year: z.string().optional(),
    accent: z.enum(["gold", "purple"]).optional(),
    designSystem: z
      .object({
        mode: z.enum(["inherit", "custom"]).optional(),
        overrides: designSystemPatchSchema,
      })
      .optional(),
  })
  .optional();

const studioPatchSchema = z.object({
  designSystem: designSystemPatchSchema,
  site: sitePatchSchema,
  project: projectPatchSchema,
});

export async function POST(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { message?: string; projectSlug?: string };
  const message = body.message?.trim();
  const projectSlug = body.projectSlug?.trim().toLowerCase();

  if (!message) {
    return NextResponse.json({ error: "Message required." }, { status: 400 });
  }

  const isProjectMode = Boolean(projectSlug);
  let state = isProjectMode
    ? await loadProjectStudioState(ctx.tenantId, projectSlug!)
    : await loadStudioState(ctx.tenantId);

  if (isProjectMode && !state) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  let appliedSitePatch: StudioPatch | null = null;
  let appliedProjectPatch: ProjectStudioPatch | null = null;

  const systemPrompt = isProjectMode
    ? `${PROJECT_STUDIO_SYSTEM_PROMPT}

Project: ${(state as Awaited<ReturnType<typeof loadProjectStudioState>>)!.project.title}
Slug: ${projectSlug}
Tagline: ${(state as Awaited<ReturnType<typeof loadProjectStudioState>>)!.project.tagline}
Summary: ${(state as Awaited<ReturnType<typeof loadProjectStudioState>>)!.project.summary.slice(0, 200)}`
    : `${STUDIO_SYSTEM_PROMPT}

Current design system name: ${(state as Awaited<ReturnType<typeof loadStudioState>>).designSystem.name}
Current site tagline: ${(state as Awaited<ReturnType<typeof loadStudioState>>).site.tagline}
Current site role: ${(state as Awaited<ReturnType<typeof loadStudioState>>).site.role}`;

  const result = await withModelChain(
    async (model) =>
      generateText({
        model,
        system: systemPrompt,
        prompt: message,
        tools: {
          applyStudioPatch: tool({
            description: isProjectMode
              ? "Apply case study copy and/or per-project design overrides only. Put all design token changes under project.designSystem.overrides — never at the root designSystem key."
              : "Apply design system and/or site copy changes. Only include design tokens you want to change — never omit or clear unchanged tokens.",
            inputSchema: studioPatchSchema,
            execute: async (patch) => {
              if (isProjectMode) {
                if (patch.designSystem && !patch.project?.designSystem) {
                  console.warn(
                    "[studio] Routed root designSystem patch to project overrides (project mode)",
                  );
                }
                if (patch.site) {
                  console.warn("[studio] Ignored site patch in project mode");
                }
                const normalized = normalizeProjectStudioPatch(patch as StudioPatch);
                if (normalized) {
                  appliedProjectPatch = normalized;
                }
              } else {
                appliedSitePatch = patch as StudioPatch;
              }
              return { ok: true };
            },
          }),
        },
        stopWhen: stepCountIs(3),
      }),
    ctx.tenantId,
  );

  if (appliedProjectPatch && isProjectMode) {
    state =
      (await applyProjectStudioPatch(ctx.tenantId, projectSlug!, appliedProjectPatch)) ?? state;
  } else if (appliedSitePatch && !isProjectMode) {
    state = await applyStudioPatch(ctx.tenantId, appliedSitePatch);
  }

  const patchForLog = appliedProjectPatch
    ? { project: appliedProjectPatch }
    : appliedSitePatch;

  const supabase = await getAdminSupabase();
  if (supabase && ctx.userId) {
    await supabase.from("studio_messages").insert([
      {
        tenant_id: ctx.tenantId,
        user_id: ctx.userId,
        role: "user",
        content: message,
        patches: projectSlug ? { projectSlug } : null,
      },
      {
        tenant_id: ctx.tenantId,
        user_id: ctx.userId,
        role: "assistant",
        content: result.text,
        patches: patchForLog,
      },
    ]);
  }

  return NextResponse.json({
    reply: result.text,
    patch: patchForLog,
    preview: state,
  });
}
