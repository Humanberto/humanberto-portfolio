import {
  SITE_FEATURES,
  featureById,
  featuresForScope,
  type SiteFeatureDef,
  type SiteFeatureId,
} from "./registry";

export * from "./registry";

/** Saved overrides — false hides, true shows, omitted uses default. */
export type SiteVisibilityOverrides = Record<string, boolean>;

export type ResolvedSiteVisibility = {
  scope: "bootstrap" | "tenant";
  /** Effective visibility per feature id. */
  features: Record<string, boolean>;
  /** Raw overrides from site_content (includes custom keys). */
  overrides: SiteVisibilityOverrides;
};

export function defaultVisibilityForScope(
  scope: "bootstrap" | "tenant",
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const def of featuresForScope(scope)) {
    out[def.id] = def.defaultVisible;
  }
  return out;
}

export function resolveSiteVisibility(
  scope: "bootstrap" | "tenant",
  overrides: SiteVisibilityOverrides | null | undefined,
): ResolvedSiteVisibility {
  const base = defaultVisibilityForScope(scope);
  const merged = { ...base };

  if (overrides && typeof overrides === "object") {
    for (const [key, value] of Object.entries(overrides)) {
      if (typeof value === "boolean") merged[key] = value;
    }
  }

  return {
    scope,
    features: merged,
    overrides: overrides ?? {},
  };
}

export function isFeatureVisible(
  visibility: ResolvedSiteVisibility,
  featureId: SiteFeatureId | string,
): boolean {
  const map = visibility.features;
  if (Object.prototype.hasOwnProperty.call(map, featureId)) return map[featureId]!;
  const def = featureById(featureId);
  return def?.defaultVisible ?? true;
}

export function isFeatureVisibleMap(
  features: Record<string, boolean>,
  featureId: SiteFeatureId | string,
): boolean {
  if (Object.prototype.hasOwnProperty.call(features, featureId)) return features[featureId]!;
  const def = featureById(featureId);
  return def?.defaultVisible ?? true;
}

export function listFeatureDefinitions(scope: "bootstrap" | "tenant"): SiteFeatureDef[] {
  return featuresForScope(scope);
}

/** Unknown override keys saved by owners (custom toggles for future wiring). */
export function customOverrideEntries(
  visibility: ResolvedSiteVisibility,
): { id: string; visible: boolean }[] {
  const known = new Set(SITE_FEATURES.map((f) => f.id));
  return Object.entries(visibility.overrides)
    .filter(([id]) => !known.has(id))
    .map(([id, visible]) => ({ id, visible }));
}
