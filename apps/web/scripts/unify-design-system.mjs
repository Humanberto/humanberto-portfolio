/**
 * One-time restore: heal global design system and reset all projects to inherit it.
 * Usage: node apps/web/scripts/unify-design-system.mjs [tenantId]
 */
import { createClient } from "@supabase/supabase-js";
import { readEnvLocal } from "./supabase-utils.mjs";

const DEFAULT_TENANT = "00000000-0000-4000-8000-000000000001";
const MAX_VERSIONS = 5;

const defaultDesignSystem = {
  name: "Humanberto",
  version: "1.0.0",
  colors: {
    ink: "#0B0610",
    surface: "#140A24",
    surfaceRaised: "#1A0A2E",
    purpleDeep: "#2A0E45",
    purple: "#7B3FE4",
    purpleSoft: "#A06BF0",
    gold: "#C9A227",
    goldBright: "#E6C260",
    goldDust: "#F4E4A6",
    text: "#F5F1E6",
    textMuted: "#B7A8C9",
    textFaint: "#6E5F86",
    line: "#2E1F47",
  },
  typography: {
    displayFont: 'var(--font-display-face), "Fraunces", Georgia, serif',
    bodyFont: 'var(--font-body-face), ui-sans-serif, system-ui, sans-serif',
    monoFont: 'var(--font-mono-face), ui-monospace, SFMono-Regular, monospace',
    displaySize: "3rem",
    h1Size: "2.25rem",
    h2Size: "1.5rem",
    h3Size: "1.25rem",
    bodySize: "1rem",
    smallSize: "0.875rem",
    eyebrowSize: "0.75rem",
    displayWeight: "300",
    headingWeight: "500",
    bodyWeight: "400",
    tightLeading: "1.1",
    normalLeading: "1.5",
    relaxedLeading: "1.625",
    displayTracking: "-0.02em",
    eyebrowTracking: "0.2em",
  },
  buttons: {
    borderRadius: "9999px",
    sm: { height: "2.25rem", paddingX: "1rem", fontSize: "0.875rem" },
    md: { height: "2.75rem", paddingX: "1.5rem", fontSize: "0.875rem" },
    lg: { height: "3.5rem", paddingX: "2rem", fontSize: "1rem" },
  },
  radii: {
    sm: "0.375rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
};

function mergeDesignSystem(base, patch) {
  if (!patch || typeof patch !== "object") return base;
  return {
    name: patch.name?.trim() || base.name,
    version: patch.version?.trim() || base.version,
    colors: { ...base.colors, ...(patch.colors ?? {}) },
    typography: { ...base.typography, ...(patch.typography ?? {}) },
    buttons: {
      ...base.buttons,
      ...(patch.buttons ?? {}),
      sm: { ...base.buttons.sm, ...(patch.buttons?.sm ?? {}) },
      md: { ...base.buttons.md, ...(patch.buttons?.md ?? {}) },
      lg: { ...base.buttons.lg, ...(patch.buttons?.lg ?? {}) },
    },
    radii: { ...base.radii, ...(patch.radii ?? {}) },
  };
}

function sanitizeDesignSystem(raw) {
  if (!raw || typeof raw !== "object") return structuredClone(defaultDesignSystem);
  return mergeDesignSystem(defaultDesignSystem, raw);
}

const url = readEnvLocal("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = readEnvLocal("SUPABASE_SERVICE_ROLE_KEY");
const tenantId = process.argv[2]?.trim() || DEFAULT_TENANT;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function readContent(key) {
  const scoped = await supabase
    .from("site_content")
    .select("value")
    .eq("tenant_id", tenantId)
    .eq("key", key)
    .maybeSingle();
  if (!scoped.error && scoped.data?.value != null) return scoped.data.value;

  const legacy = await supabase.from("site_content").select("value").eq("key", key).maybeSingle();
  if (!legacy.error && legacy.data?.value != null) return legacy.data.value;
  return null;
}

async function writeContent(key, value) {
  const updatedAt = new Date().toISOString();
  const scoped = await supabase.from("site_content").upsert(
    { tenant_id: tenantId, key, value, updated_at: updatedAt },
    { onConflict: "tenant_id,key" },
  );
  if (!scoped.error) return true;

  const legacy = await supabase.from("site_content").upsert(
    { key, value, updated_at: updatedAt },
    { onConflict: "key" },
  );
  return !legacy.error;
}

async function main() {
  const rawGlobal = await readContent("design_system");
  const healedGlobal = sanitizeDesignSystem(rawGlobal);

  const history = (await readContent("design_system_history")) ?? { byScope: {} };
  if (!history.byScope) history.byScope = {};

  const pushVersion = (scopeKey, label, payload) => {
    const existing = history.byScope[scopeKey] ?? [];
    history.byScope[scopeKey] = [
      {
        id: crypto.randomUUID(),
        label,
        savedAt: new Date().toISOString(),
        payload,
      },
      ...existing,
    ].slice(0, MAX_VERSIONS);
  };

  if (rawGlobal) {
    pushVersion("system", "Before unify restore (script)", {
      kind: "system",
      system: sanitizeDesignSystem(rawGlobal),
    });
  }

  await writeContent("design_system", healedGlobal);
  console.log("Healed site system:", healedGlobal.name);

  const projects = (await readContent("projects")) ?? [];
  if (!Array.isArray(projects)) {
    console.error("projects content is not an array");
    process.exit(1);
  }

  let updated = 0;
  const nextProjects = projects.map((project) => {
    if (project?.designSystem?.mode === "custom") {
      pushVersion(`project:${project.slug}`, "Before unify restore (script)", {
        kind: "project",
        binding: project.designSystem,
      });
      updated += 1;
      const { designSystem, ...rest } = project;
      void designSystem;
      return rest;
    }
    return project;
  });

  if (updated > 0) {
    await writeContent("projects", nextProjects);
  }

  await writeContent("design_system_history", history);

  console.log(`Done. ${updated} project(s) reset to site system.`);
  console.log("Tenant:", tenantId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
