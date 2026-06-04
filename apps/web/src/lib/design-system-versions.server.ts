import "server-only";
import { randomUUID } from "node:crypto";
import {
  defaultDesignSystem,
  emptyDesignSystemHistory,
  MAX_DESIGN_SYSTEM_VERSIONS,
  projectDesignScope,
  sanitizeDesignSystem,
  sanitizeProjectDesignBinding,
  SYSTEM_DESIGN_SCOPE,
  type DesignSystem,
  type DesignSystemHistory,
  type DesignSystemVersion,
  type DesignSystemVersionPayload,
  type ProjectDesignBinding,
} from "@humanberto/ui";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";
import { getGlobalDesignSystem, saveGlobalDesignSystem } from "@/lib/design-system.server";
import { getAllProjects, saveAllProjects } from "@/lib/projects.server";
import type { AdminProject } from "@/lib/projects.shared";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { defaultTenantId } from "@/lib/tenant/server";

const HISTORY_KEY = "design_system_history" as const;

async function tenantIdFor(explicit?: string): Promise<string> {
  if (explicit?.trim()) return explicit.trim();
  const ctx = await resolveOfficeContext();
  return ctx?.tenantId ?? defaultTenantId();
}

function sanitizeHistory(raw: unknown): DesignSystemHistory {
  if (!raw || typeof raw !== "object") return emptyDesignSystemHistory();
  const o = raw as Partial<DesignSystemHistory>;
  const byScope: DesignSystemHistory["byScope"] = {};
  if (o.byScope && typeof o.byScope === "object") {
    for (const [scope, versions] of Object.entries(o.byScope)) {
      if (!Array.isArray(versions)) continue;
      byScope[scope] = versions
        .filter(
          (v): v is DesignSystemVersion =>
            Boolean(v && typeof v === "object" && typeof (v as DesignSystemVersion).id === "string"),
        )
        .slice(0, MAX_DESIGN_SYSTEM_VERSIONS);
    }
  }
  return { byScope };
}

async function getHistory(tenantId?: string): Promise<DesignSystemHistory> {
  const tid = await tenantIdFor(tenantId);
  const stored = await getContentOverride<unknown>(HISTORY_KEY, tid);
  return sanitizeHistory(stored);
}

async function saveHistory(history: DesignSystemHistory, tenantId?: string): Promise<boolean> {
  const tid = await tenantIdFor(tenantId);
  return setContentOverride(HISTORY_KEY, history, tid);
}

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

export async function listDesignSystemVersions(
  scopeKey: string,
  tenantId?: string,
): Promise<DesignSystemVersion[]> {
  const history = await getHistory(tenantId);
  return history.byScope[scopeKey] ?? [];
}

export async function pushDesignSystemVersion(
  scopeKey: string,
  label: string,
  payload: DesignSystemVersionPayload,
  tenantId?: string,
): Promise<DesignSystemVersion> {
  const history = await getHistory(tenantId);
  const existing = history.byScope[scopeKey] ?? [];

  const sanitizedPayload: DesignSystemVersionPayload =
    payload.kind === "system"
      ? { kind: "system", system: sanitizeDesignSystem(payload.system) }
      : {
          kind: "project",
          binding: payload.binding
            ? sanitizeProjectDesignBinding(payload.binding) ?? null
            : null,
        };

  const fingerprint = stableJson(sanitizedPayload);
  if (existing[0] && stableJson(existing[0].payload) === fingerprint) {
    return existing[0];
  }

  const version: DesignSystemVersion = {
    id: randomUUID(),
    label: label.trim() || "Saved version",
    savedAt: new Date().toISOString(),
    payload: sanitizedPayload,
  };

  const next = [version, ...existing].slice(0, MAX_DESIGN_SYSTEM_VERSIONS);
  history.byScope[scopeKey] = next;
  await saveHistory(history, tenantId);
  return version;
}

export async function restoreDesignSystemVersion(
  scopeKey: string,
  versionId: string,
  tenantId?: string,
): Promise<{ ok: true; version: DesignSystemVersion } | { ok: false; error: string }> {
  const history = await getHistory(tenantId);
  const versions = history.byScope[scopeKey] ?? [];
  const version = versions.find((v) => v.id === versionId);
  if (!version) return { ok: false, error: "Version not found." };

  if (version.payload.kind === "system") {
    const current = await getGlobalDesignSystem(tenantId);
    await pushDesignSystemVersion(
      SYSTEM_DESIGN_SCOPE,
      "Before restore",
      { kind: "system", system: current },
      tenantId,
    );
    await saveGlobalDesignSystem(version.payload.system, tenantId);
    return { ok: true, version };
  }

  const slug = scopeKey.startsWith("project:") ? scopeKey.slice("project:".length) : "";
  if (!slug) return { ok: false, error: "Invalid project scope." };

  const projects = await getAllProjects(tenantId);
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx < 0) return { ok: false, error: "Project not found." };

  const current = projects[idx]!;
  await pushDesignSystemVersion(
    projectDesignScope(slug),
    "Before restore",
    { kind: "project", binding: current.designSystem ?? null },
    tenantId,
  );

  const next = [...projects];
  const { designSystem, ...rest } = current;
  void designSystem;
  if (!version.payload.binding || version.payload.binding.mode === "inherit") {
    next[idx] = rest;
  } else {
    next[idx] = {
      ...rest,
      designSystem: version.payload.binding,
    };
  }
  await saveAllProjects(next, tenantId);
  return { ok: true, version };
}

function bindingFingerprint(binding?: ProjectDesignBinding | null): string {
  if (!binding || binding.mode === "inherit") return "inherit";
  return stableJson(binding);
}

export async function snapshotProjectDesignIfChanged(
  project: AdminProject,
  previous?: AdminProject,
  tenantId?: string,
): Promise<void> {
  const prevFp = bindingFingerprint(previous?.designSystem);
  const nextFp = bindingFingerprint(project.designSystem);
  if (prevFp === nextFp) return;

  await pushDesignSystemVersion(
    projectDesignScope(project.slug),
    project.designSystem?.mode === "custom" ? "Custom project theme" : "System theme",
    {
      kind: "project",
      binding: project.designSystem ?? null,
    },
    tenantId,
  );
}

export async function snapshotGlobalDesignIfChanged(
  next: DesignSystem,
  tenantId?: string,
): Promise<void> {
  const current = await getGlobalDesignSystem(tenantId);
  if (stableJson(sanitizeDesignSystem(current)) === stableJson(sanitizeDesignSystem(next))) {
    return;
  }
  await pushDesignSystemVersion(
    SYSTEM_DESIGN_SCOPE,
    current.name ? `${current.name} (auto)` : "Previous system",
    { kind: "system", system: current },
    tenantId,
  );
}

/** Heal global tokens and remove per-project overrides so everything uses the site system. */
export async function unifyAllProjectsToGlobalDesign(tenantId?: string): Promise<{
  global: DesignSystem;
  projectsUpdated: number;
}> {
  const tid = await tenantIdFor(tenantId);
  const rawStored = await getContentOverride<unknown>("design_system", tid);
  const currentGlobal = await getGlobalDesignSystem(tid);
  const healedGlobal = sanitizeDesignSystem(rawStored ?? currentGlobal);

  await pushDesignSystemVersion(
    SYSTEM_DESIGN_SCOPE,
    "Before unify restore",
    { kind: "system", system: currentGlobal },
    tid,
  );

  await saveGlobalDesignSystem(healedGlobal, tid);

  const projects = await getAllProjects(tid);
  let projectsUpdated = 0;
  const nextProjects: AdminProject[] = [];

  for (const project of projects) {
    if (project.designSystem?.mode === "custom") {
      await pushDesignSystemVersion(
        projectDesignScope(project.slug),
        "Before unify restore",
        { kind: "project", binding: project.designSystem },
        tid,
      );
      projectsUpdated += 1;
    }
    const { designSystem, ...rest } = project;
    void designSystem;
    nextProjects.push(rest);
  }

  if (projectsUpdated > 0) {
    await saveAllProjects(nextProjects, tid);
  }

  return { global: healedGlobal, projectsUpdated };
}

/** Reset global design to code defaults (after snapshot). */
export async function resetGlobalDesignToDefaults(tenantId?: string): Promise<DesignSystem> {
  const current = await getGlobalDesignSystem(tenantId);
  await pushDesignSystemVersion(
    SYSTEM_DESIGN_SCOPE,
    "Before code defaults reset",
    { kind: "system", system: current },
    tenantId,
  );
  await saveGlobalDesignSystem(defaultDesignSystem, tenantId);
  return defaultDesignSystem;
}
