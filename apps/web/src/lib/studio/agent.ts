import "server-only";
import {
  mergeDesignSystem,
  sanitizeDesignSystem,
  type DesignSystem,
  type DesignSystemPatch,
} from "@humanberto/ui";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";
import { getGlobalDesignSystem, saveGlobalDesignSystem } from "@/lib/design-system.server";
import { defaultSite, type SiteConfig } from "@/lib/site";

export type StudioPatch = {
  designSystem?: DesignSystemPatch;
  site?: Partial<SiteConfig>;
};

export async function loadStudioState(tenantId: string) {
  const [designSystem, siteOverride] = await Promise.all([
    getGlobalDesignSystem(tenantId),
    getContentOverride<Partial<SiteConfig>>("site", tenantId),
  ]);
  return {
    designSystem,
    site: { ...defaultSite, ...siteOverride },
  };
}

export async function applyStudioPatch(
  tenantId: string,
  patch: StudioPatch,
): Promise<{ designSystem: DesignSystem; site: SiteConfig }> {
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

  return { designSystem: sanitizeDesignSystem(designSystem), site };
}

export const STUDIO_SYSTEM_PROMPT = `You are Humanberto Studio Agent — a product design and copy partner inside a portfolio builder.

Help the user refine their design system (colors, typography, button radii) and site copy (tagline, role, name).

When you have concrete changes, call applyStudioPatch with a JSON patch. Use hex colors only.
Keep suggestions focused and shippable. Ask clarifying questions when needed.

Do not invent projects or experience — only edit what they ask for.`;
