import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { withModelChain } from "@/lib/advocate-model";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { getAdminSupabase } from "@/lib/admin/supabase";
import {
  STUDIO_SYSTEM_PROMPT,
  applyStudioPatch,
  loadStudioState,
  type StudioPatch,
} from "@/lib/studio/agent";

export const maxDuration = 60;

export async function POST(req: Request) {
  const ctx = await resolveOfficeContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { message?: string };
  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message required." }, { status: 400 });
  }

  const state = await loadStudioState(ctx.tenantId);
  let appliedPatch: StudioPatch | null = null;

  const result = await withModelChain(
    async (model) =>
      generateText({
      model,
      system: `${STUDIO_SYSTEM_PROMPT}

Current design system name: ${state.designSystem.name}
Current site tagline: ${state.site.tagline}
Current site role: ${state.site.role}`,
      prompt: message,
      tools: {
        applyStudioPatch: tool({
          description: "Apply design system and/or site copy changes",
          inputSchema: z.object({
            designSystem: z
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
              .optional(),
            site: z
              .object({
                name: z.string().optional(),
                tagline: z.string().optional(),
                role: z.string().optional(),
                shortName: z.string().optional(),
              })
              .optional(),
          }),
          execute: async (patch) => {
            appliedPatch = patch as StudioPatch;
            return { ok: true };
          },
        }),
      },
      stopWhen: stepCountIs(3),
    }),
    ctx.tenantId,
  );

  let preview = state;
  if (appliedPatch) {
    preview = await applyStudioPatch(ctx.tenantId, appliedPatch);
  }

  const supabase = await getAdminSupabase();
  if (supabase && ctx.userId) {
    await supabase.from("studio_messages").insert([
      { tenant_id: ctx.tenantId, user_id: ctx.userId, role: "user", content: message },
      {
        tenant_id: ctx.tenantId,
        user_id: ctx.userId,
        role: "assistant",
        content: result.text,
        patches: appliedPatch,
      },
    ]);
  }

  return NextResponse.json({
    reply: result.text,
    patch: appliedPatch,
    preview,
  });
}
