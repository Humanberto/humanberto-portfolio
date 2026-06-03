import "server-only";
import {
  mergeDesignSystem,
  resolveProjectDesignSystem,
  sanitizeDesignSystem,
  sanitizeProjectDesignBinding,
  type DesignSystem,
  type DesignSystemPatch,
  type ProjectDesignBinding,
} from "@humanberto/ui";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";
import { getGlobalDesignSystem, saveGlobalDesignSystem } from "@/lib/design-system.server";
import { getAllProjects, saveAllProjects } from "@/lib/projects.server";
import type { AdminProject } from "@/lib/projects.shared";
import { defaultSite, type SiteConfig } from "@/lib/site";

export type ProjectStudioPatch = {
  title?: string;
  tagline?: string;
  summary?: string;
  problem?: string;
  approach?: string[];
  outcomes?: string[];
  stack?: string[];
  role?: string;
  year?: string;
  accent?: "gold" | "purple";
  designSystem?: ProjectDesignBinding;
};

export type StudioPatch = {
  designSystem?: DesignSystemPatch;
  site?: Partial<SiteConfig>;
  project?: ProjectStudioPatch;
};

export type SiteStudioState = {
  scope: "site";
  designSystem: DesignSystem;
  site: SiteConfig;
};

export type ProjectStudioState = {
  scope: "project";
  designSystem: DesignSystem;
  globalDesignSystem: DesignSystem;
  site: SiteConfig;
  project: AdminProject;
};

export async function loadStudioState(tenantId: string): Promise<SiteStudioState> {
  const [designSystem, siteOverride] = await Promise.all([
    getGlobalDesignSystem(tenantId),
    getContentOverride<Partial<SiteConfig>>("site", tenantId),
  ]);
  return {
    scope: "site",
    designSystem,
    site: { ...defaultSite, ...siteOverride },
  };
}

export async function loadProjectStudioState(
  tenantId: string,
  projectSlug: string,
): Promise<ProjectStudioState | null> {
  const [globalDesignSystem, siteOverride, projects] = await Promise.all([
    getGlobalDesignSystem(tenantId),
    getContentOverride<Partial<SiteConfig>>("site", tenantId),
    getAllProjects(tenantId),
  ]);

  const project = projects.find((p) => p.slug === projectSlug);
  if (!project) return null;

  const designSystem = resolveProjectDesignSystem(globalDesignSystem, project.designSystem);

  return {
    scope: "project",
    designSystem,
    globalDesignSystem,
    site: { ...defaultSite, ...siteOverride },
    project,
  };
}

function mergeProjectPatch(project: AdminProject, patch: ProjectStudioPatch): AdminProject {
  const next: AdminProject = { ...project, ...patch };
  if (patch.designSystem) {
    const current = project.designSystem;
    const binding = patch.designSystem;
    next.designSystem = sanitizeProjectDesignBinding({
      mode: binding.mode ?? current?.mode ?? "inherit",
      overrides:
        binding.mode === "custom" || current?.mode === "custom"
          ? {
              ...(current?.mode === "custom" ? current.overrides : {}),
              ...binding.overrides,
            }
          : undefined,
    });
  }
  return next;
}

export async function applyProjectStudioPatch(
  tenantId: string,
  projectSlug: string,
  patch: ProjectStudioPatch,
): Promise<ProjectStudioState | null> {
  const projects = await getAllProjects(tenantId);
  const idx = projects.findIndex((p) => p.slug === projectSlug);
  if (idx < 0) return null;

  const updated = mergeProjectPatch(projects[idx]!, patch);
  const next = [...projects];
  next[idx] = updated;
  await saveAllProjects(next, tenantId);

  return loadProjectStudioState(tenantId, projectSlug);
}

export async function applyStudioPatch(
  tenantId: string,
  patch: StudioPatch,
): Promise<SiteStudioState> {
  let designSystem = await getGlobalDesignSystem(tenantId);
  if (patch.designSystem) {
    designSystem = mergeDesignSystem(designSystem, patch.designSystem);
    await saveGlobalDesignSystem(designSystem, tenantId);
  }

  let site = { ...defaultSite, ...(await getContentOverride<Partial<SiteConfig>>("site", tenantId)) };
  if (patch.site) {
    site = { ...site, ...patch.site };
    await setContentOverride("site", site, tenantId);
  }

  return {
    scope: "site",
    designSystem: sanitizeDesignSystem(designSystem),
    site,
  };
}

export const STUDIO_SYSTEM_PROMPT = `You are Humanberto Studio Agent — a product design and copy partner inside a portfolio builder.

Help the user refine their design system (colors, typography, button radii) and site copy (tagline, role, name).

When you have concrete changes, call applyStudioPatch with a JSON patch. Use hex colors only.
Keep suggestions focused and shippable. Ask clarifying questions when needed.

Do not invent projects or experience — only edit what they ask for.`;

export const PROJECT_STUDIO_SYSTEM_PROMPT = `You are Humanberto Studio Agent — helping refine a single portfolio case study project.

You can edit project copy (title, tagline, summary, problem, approach, outcomes, stack, role) and per-project design overrides (set designSystem.mode to "custom" with color/typography overrides for a distinct case study look).

When you have concrete changes, call applyStudioPatch with a project patch. Use hex colors only for design overrides.
Keep copy honest — do not invent metrics, clients, or outcomes the user did not describe.
For approach and outcomes, provide full string arrays when updating those fields.`;
