import "server-only";
import { generateObject, type ModelMessage } from "ai";
import { z } from "zod";
import { withModelChain } from "@/lib/advocate-model";
import { getIntakeAssets } from "@/lib/admin/intake-media";
import { setContentOverride } from "@/lib/admin/content";
import { saveAllProjects } from "@/lib/projects.server";
import { slugifyTitle } from "@/lib/projects.shared";
import type { AdminProject } from "@/lib/projects.shared";
import { applyStudioPatch } from "@/lib/studio/agent";
import type { SiteConfig } from "@/lib/site";
import { getTenantById } from "@/lib/tenant/server";
import {
  INSPIRATION_DISCLAIMER,
  type IntakeAssetCategory,
  type IntakeAssetItem,
} from "@/lib/platform/intake-assets";
import { advocateEnabledFromIntake } from "@/lib/tenant/public-site";
import { buildInitialSiteFromIntake } from "@/lib/platform/seed-from-intake";
import { getAdminSupabase } from "@/lib/admin/supabase";

export const maxDuration = 120;

const BuildSchema = z.object({
  site: z.object({
    name: z.string(),
    shortName: z.string().optional(),
    role: z.string(),
    tagline: z.string(),
    email: z.string().optional(),
  }),
  about: z.object({
    intro: z.string(),
    focus: z.string(),
    audience: z.string(),
  }),
  designSystem: z
    .object({
      colors: z
        .object({
          ink: z.string().optional(),
          surface: z.string().optional(),
          gold: z.string().optional(),
          goldBright: z.string().optional(),
          purple: z.string().optional(),
          purpleSoft: z.string().optional(),
          text: z.string().optional(),
          textMuted: z.string().optional(),
          line: z.string().optional(),
        })
        .optional(),
      typography: z
        .object({
          displayWeight: z.string().optional(),
          eyebrowTracking: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  inspirationMoodNotes: z.string().optional(),
  projects: z.array(
    z.object({
      title: z.string(),
      tagline: z.string(),
      summary: z.string(),
      problem: z.string(),
      approach: z.array(z.string()).min(1),
      outcomes: z.array(z.string()).min(1),
      stack: z.array(z.string()).min(1),
      coverImageUrl: z.string().optional(),
      featured: z.boolean().optional(),
    }),
  ),
  advocateHighlights: z.array(z.string()).optional(),
});

const BUILD_SYSTEM = `You are Humanberto Studio — building a user's portfolio from their uploaded materials.

RULES:
- Use ONLY resume, portfolio, and projects uploads for factual copy, project titles, outcomes, and images on the live site.
- Inspiration uploads are REFERENCE ONLY: extract mood, color palette ideas, typography feel, spacing rhythm — NEVER copy their text, logos, screenshots, or proprietary content onto the site.
- ${INSPIRATION_DISCLAIMER}
- Do not invent employers, clients, or metrics not supported by the uploads or intake answers.
- Use hex colors only in designSystem.colors.
- Keep project count proportional to uploads (typically 2–6 projects).
- coverImageUrl must be a URL from the user's projects/portfolio uploads when assigning gallery images — never from inspiration.`;

async function fetchFileBytes(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function listForPrompt(
  items: IntakeAssetItem[],
  label: string,
): string {
  if (!items.length) return `${label}: (none)`;
  return `${label}:\n${items.map((i) => `- ${i.name} (${i.mimeType}) ${i.url}`).join("\n")}`;
}

async function buildMessageParts(
  assets: Awaited<ReturnType<typeof getIntakeAssets>>,
  answers: Record<string, string>,
  displayName: string,
): Promise<ModelMessage[]> {
  const textBlock = [
    `Build a portfolio for ${displayName}.`,
    `Intake answers: ${JSON.stringify(answers, null, 2)}`,
    listForPrompt(assets.resume, "Resume / CV (USE on site)"),
    listForPrompt(assets.portfolio, "Portfolio files (USE on site)"),
    listForPrompt(assets.projects, "Project files (USE on site)"),
    listForPrompt(assets.inspiration, "Inspiration (REFERENCE ONLY — mood/colors, NOT content)"),
  ].join("\n\n");

  const content: Array<
    | { type: "text"; text: string }
    | { type: "file"; data: Uint8Array; mediaType: string }
    | { type: "image"; image: Uint8Array; mimeType?: string }
  > = [{ type: "text", text: textBlock }];

  const attach = async (items: IntakeAssetItem[], cap: number) => {
    for (const item of items.slice(0, cap)) {
      const bytes = await fetchFileBytes(item.url);
      if (!bytes) continue;
      if (item.mimeType === "application/pdf") {
        content.push({ type: "file", data: bytes, mediaType: "application/pdf" });
      } else if (item.mimeType.startsWith("image/")) {
        content.push({ type: "image", image: bytes, mimeType: item.mimeType });
      } else if (item.mimeType.startsWith("text/")) {
        content.push({
          type: "text",
          text: `[${item.name}]\n${new TextDecoder().decode(bytes).slice(0, 12000)}`,
        });
      }
    }
  };

  await attach(assets.resume, 3);
  await attach(assets.portfolio, 4);
  await attach(assets.projects, 6);
  await attach(assets.inspiration, 4);

  return [{ role: "user", content }] as ModelMessage[];
}

function toAdminProjects(
  built: z.infer<typeof BuildSchema>["projects"],
  role: string,
): AdminProject[] {
  const year = String(new Date().getFullYear());
  const used = new Set<string>();

  return built.map((p, i) => {
    let slug = slugifyTitle(p.title) || `project-${i + 1}`;
    while (used.has(slug)) slug = `${slug}-${i + 1}`;
    used.add(slug);

    return {
      slug,
      title: p.title,
      tagline: p.tagline,
      year,
      role,
      pillars: ["Product Design"],
      status: "case-study" as const,
      summary: p.summary,
      problem: p.problem,
      approach: p.approach,
      outcomes: p.outcomes,
      stack: p.stack,
      links: {},
      featured: p.featured ?? i < 2,
      published: true,
      accent: i % 2 === 0 ? "gold" : "purple",
      coverImage: p.coverImageUrl,
    } satisfies AdminProject;
  });
}

/** Auto-build site from uploaded intake assets + research answers using the design agent. */
export async function buildSiteFromIntakeAssets(
  tenantId: string,
  opts?: { email?: string },
): Promise<{ ok: boolean; error?: string }> {
  const tenant = await getTenantById(tenantId);
  if (!tenant) return { ok: false, error: "Tenant not found." };

  const assets = await getIntakeAssets(tenantId);
  const answers = (tenant.research_responses ?? {}) as Record<string, string>;
  const displayName = tenant.display_name;
  const totalUsable =
    assets.resume.length + assets.portfolio.length + assets.projects.length;

  if (totalUsable === 0 && !assets.inspiration.length) {
    await buildInitialSiteFromIntake(tenantId, displayName, opts?.email, answers);
    await markTenantActive(tenantId);
    return { ok: true };
  }

  try {
    const messages = await buildMessageParts(assets, answers, displayName);
    const { object } = await withModelChain(
      (model) =>
        generateObject({
          model,
          schema: BuildSchema,
          system: BUILD_SYSTEM,
          messages,
        }),
      tenantId,
    );

    await applyStudioPatch(tenantId, {
      designSystem: object.designSystem ?? undefined,
      site: {
        name: object.site.name,
        shortName: object.site.shortName ?? object.site.name.split(" ")[0],
        role: object.site.role,
        tagline: object.site.tagline,
        email: object.site.email ?? opts?.email ?? "",
      } as Partial<SiteConfig>,
    });

    if (object.projects.length > 0) {
      await saveAllProjects(toAdminProjects(object.projects, object.site.role), tenantId);
    }

    await setContentOverride("about", object.about, tenantId);

    if (advocateEnabledFromIntake(answers)) {
      await setContentOverride(
        "advocate_facts",
        {
          ownerName: object.site.name,
          headline: object.site.role,
          goal: answers.goal ?? object.about.focus,
          audience: object.about.audience,
          highlights: object.advocateHighlights ?? [],
          inspirationMood: object.inspirationMoodNotes ?? "",
        },
        tenantId,
      );
    }

    await markTenantActive(tenantId);
    return { ok: true };
  } catch (err) {
    console.error("[intake] auto-build failed", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Auto-build failed.",
    };
  }
}

async function markTenantActive(tenantId: string): Promise<void> {
  const supabase = await getAdminSupabase();
  if (!supabase) return;
  await supabase
    .from("tenants")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", tenantId);
}
