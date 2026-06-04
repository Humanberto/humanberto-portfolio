import type { DesignSystem, ProjectDesignBinding } from "./design-system";

export const MAX_DESIGN_SYSTEM_VERSIONS = 5;
export const SYSTEM_DESIGN_SCOPE = "system";

export function projectDesignScope(slug: string): string {
  return `project:${slug.trim().toLowerCase()}`;
}

export type DesignSystemVersionPayload =
  | { kind: "system"; system: DesignSystem }
  | { kind: "project"; binding: ProjectDesignBinding | null };

export interface DesignSystemVersion {
  id: string;
  label: string;
  savedAt: string;
  payload: DesignSystemVersionPayload;
}

export interface DesignSystemHistory {
  byScope: Record<string, DesignSystemVersion[]>;
}

export function emptyDesignSystemHistory(): DesignSystemHistory {
  return { byScope: {} };
}
