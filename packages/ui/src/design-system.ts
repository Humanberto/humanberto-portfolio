import { colors as defaultColors } from "./tokens";

/** Full editable design system — stored in Supabase and applied via CSS variables. */
export interface DesignSystemColors {
  ink: string;
  surface: string;
  surfaceRaised: string;
  purpleDeep: string;
  purple: string;
  purpleSoft: string;
  gold: string;
  goldBright: string;
  goldDust: string;
  text: string;
  textMuted: string;
  textFaint: string;
  line: string;
}

export interface DesignSystemTypography {
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  displaySize: string;
  h1Size: string;
  h2Size: string;
  h3Size: string;
  bodySize: string;
  smallSize: string;
  eyebrowSize: string;
  displayWeight: string;
  headingWeight: string;
  bodyWeight: string;
  tightLeading: string;
  normalLeading: string;
  relaxedLeading: string;
  displayTracking: string;
  eyebrowTracking: string;
}

export interface DesignSystemButtonSize {
  height: string;
  paddingX: string;
  fontSize: string;
}

export interface DesignSystemButtons {
  borderRadius: string;
  sm: DesignSystemButtonSize;
  md: DesignSystemButtonSize;
  lg: DesignSystemButtonSize;
}

export interface DesignSystemRadii {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface DesignSystem {
  name: string;
  version: string;
  colors: DesignSystemColors;
  typography: DesignSystemTypography;
  buttons: DesignSystemButtons;
  radii: DesignSystemRadii;
}

export type DesignSystemPatch = {
  name?: string;
  version?: string;
  colors?: Partial<DesignSystemColors>;
  typography?: Partial<DesignSystemTypography>;
  buttons?: Partial<
    DesignSystemButtons & {
      sm?: Partial<DesignSystemButtonSize>;
      md?: Partial<DesignSystemButtonSize>;
      lg?: Partial<DesignSystemButtonSize>;
    }
  >;
  radii?: Partial<DesignSystemRadii>;
};

export interface ProjectDesignBinding {
  /** inherit = site-wide system; custom = merge overrides on top of global */
  mode: "inherit" | "custom";
  overrides?: DesignSystemPatch;
}

export const COLOR_TOKEN_LABELS: Record<keyof DesignSystemColors, string> = {
  ink: "Ink (page background)",
  surface: "Surface",
  surfaceRaised: "Surface raised",
  purpleDeep: "Purple deep",
  purple: "Purple",
  purpleSoft: "Purple soft",
  gold: "Gold",
  goldBright: "Gold bright",
  goldDust: "Gold dust",
  text: "Text primary",
  textMuted: "Text muted",
  textFaint: "Text faint",
  line: "Border / line",
};

export const defaultDesignSystem: DesignSystem = {
  name: "Humanberto",
  version: "1.0.0",
  colors: {
    ink: defaultColors.ink,
    surface: defaultColors.surface,
    surfaceRaised: defaultColors.surfaceRaised,
    purpleDeep: defaultColors.purpleDeep,
    purple: defaultColors.purple,
    purpleSoft: defaultColors.purpleSoft,
    gold: defaultColors.gold,
    goldBright: defaultColors.goldBright,
    goldDust: defaultColors.goldDust,
    text: defaultColors.text,
    textMuted: defaultColors.textMuted,
    textFaint: defaultColors.textFaint,
    line: defaultColors.line,
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

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isHexColor(value: string): boolean {
  return HEX_RE.test(value.trim());
}

function nonEmptyStringPatch<T extends Record<string, string>>(
  patch?: Partial<T> | null,
): Partial<T> | undefined {
  if (!patch) return undefined;
  const out: Partial<T> = {};
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const trimmed = patch[key]?.trim();
    if (trimmed) out[key] = trimmed as T[keyof T];
  }
  return Object.keys(out).length ? out : undefined;
}

function mergeButtonSize(
  base: DesignSystemButtonSize,
  patch?: Partial<DesignSystemButtonSize>,
): DesignSystemButtonSize {
  if (!patch) return base;
  return {
    height: patch.height?.trim() || base.height,
    paddingX: patch.paddingX?.trim() || base.paddingX,
    fontSize: patch.fontSize?.trim() || base.fontSize,
  };
}

/** Deep-merge a patch onto the base design system. Never removes existing tokens. */
export function mergeDesignSystem(
  base: DesignSystem,
  patch?: DesignSystemPatch | null,
): DesignSystem {
  if (!patch) return base;

  return {
    name: patch.name?.trim() || base.name,
    version: patch.version?.trim() || base.version,
    colors: { ...base.colors, ...filterColorPatch(patch.colors) },
    typography: { ...base.typography, ...nonEmptyStringPatch(patch.typography) },
    buttons: {
      borderRadius: patch.buttons?.borderRadius?.trim() || base.buttons.borderRadius,
      sm: mergeButtonSize(base.buttons.sm, patch.buttons?.sm),
      md: mergeButtonSize(base.buttons.md, patch.buttons?.md),
      lg: mergeButtonSize(base.buttons.lg, patch.buttons?.lg),
    },
    radii: { ...base.radii, ...nonEmptyStringPatch(patch.radii) },
  };
}

function filterColorPatch(
  patch?: Partial<DesignSystemColors> | null,
): Partial<DesignSystemColors> | undefined {
  if (!patch) return undefined;
  const colors: Partial<DesignSystemColors> = {};
  for (const [key, value] of Object.entries(patch) as [
    keyof DesignSystemColors,
    string | undefined,
  ][]) {
    if (value?.trim() && isHexColor(value)) colors[key] = value.trim();
  }
  return Object.keys(colors).length ? colors : undefined;
}

/** Merge partial patches — Studio agent uses this for per-project overrides. */
export function mergeDesignSystemPatch(
  base: DesignSystemPatch | undefined,
  patch: DesignSystemPatch | undefined,
): DesignSystemPatch | undefined {
  if (!patch) return base;
  if (!base) return patch;

  const colors = filterColorPatch(patch.colors);
  return {
    name: patch.name?.trim() || base.name,
    version: patch.version?.trim() || base.version,
    colors: colors ? { ...base.colors, ...colors } : base.colors,
    typography: patch.typography
      ? { ...(base.typography ?? {}), ...nonEmptyStringPatch(patch.typography) }
      : base.typography,
    buttons: patch.buttons
      ? {
          ...base.buttons,
          ...(patch.buttons.borderRadius?.trim()
            ? { borderRadius: patch.buttons.borderRadius.trim() }
            : {}),
          sm:
            patch.buttons.sm || base.buttons?.sm
              ? mergeButtonSize(
                  base.buttons?.sm ?? defaultDesignSystem.buttons.sm,
                  patch.buttons.sm ?? base.buttons?.sm,
                )
              : base.buttons?.sm,
          md:
            patch.buttons.md || base.buttons?.md
              ? mergeButtonSize(
                  base.buttons?.md ?? defaultDesignSystem.buttons.md,
                  patch.buttons.md ?? base.buttons?.md,
                )
              : base.buttons?.md,
          lg:
            patch.buttons.lg || base.buttons?.lg
              ? mergeButtonSize(
                  base.buttons?.lg ?? defaultDesignSystem.buttons.lg,
                  patch.buttons.lg ?? base.buttons?.lg,
                )
              : base.buttons?.lg,
        }
      : base.buttons,
    radii: patch.radii
      ? { ...(base.radii ?? {}), ...nonEmptyStringPatch(patch.radii) }
      : base.radii,
  };
}

export function resolveProjectDesignSystem(
  global: DesignSystem,
  binding?: ProjectDesignBinding | null,
): DesignSystem {
  if (!binding || binding.mode === "inherit") return global;
  return mergeDesignSystem(global, binding.overrides);
}

/** Sanitize stored JSON into a valid DesignSystem (falls back to defaults). */
export function sanitizeDesignSystem(raw: unknown): DesignSystem {
  if (!raw || typeof raw !== "object") return defaultDesignSystem;
  return mergeDesignSystem(defaultDesignSystem, raw as DesignSystemPatch);
}

export function sanitizeProjectDesignBinding(raw: unknown): ProjectDesignBinding | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Partial<ProjectDesignBinding>;
  if (o.mode !== "inherit" && o.mode !== "custom") return undefined;
  return {
    mode: o.mode,
    overrides: o.mode === "custom" && o.overrides ? (o.overrides as DesignSystemPatch) : undefined,
  };
}

/** CSS custom properties for :root or a scoped wrapper. */
export function designSystemToCssVars(ds: DesignSystem): Record<string, string> {
  const { colors: c, typography: t, buttons: b, radii: r } = ds;
  return {
    "--color-ink": c.ink,
    "--color-surface": c.surface,
    "--color-raised": c.surfaceRaised,
    "--color-purple-deep": c.purpleDeep,
    "--color-purple": c.purple,
    "--color-purple-soft": c.purpleSoft,
    "--color-gold": c.gold,
    "--color-gold-bright": c.goldBright,
    "--color-gold-dust": c.goldDust,
    "--color-fg": c.text,
    "--color-muted": c.textMuted,
    "--color-faint": c.textFaint,
    "--color-line": c.line,
    "--font-display": t.displayFont,
    "--font-sans": t.bodyFont,
    "--font-mono": t.monoFont,
    "--ds-display-size": t.displaySize,
    "--ds-h1-size": t.h1Size,
    "--ds-h2-size": t.h2Size,
    "--ds-h3-size": t.h3Size,
    "--ds-body-size": t.bodySize,
    "--ds-small-size": t.smallSize,
    "--ds-eyebrow-size": t.eyebrowSize,
    "--ds-display-weight": t.displayWeight,
    "--ds-heading-weight": t.headingWeight,
    "--ds-body-weight": t.bodyWeight,
    "--ds-leading-tight": t.tightLeading,
    "--ds-leading-normal": t.normalLeading,
    "--ds-leading-relaxed": t.relaxedLeading,
    "--ds-display-tracking": t.displayTracking,
    "--ds-eyebrow-tracking": t.eyebrowTracking,
    "--btn-radius": b.borderRadius,
    "--btn-sm-height": b.sm.height,
    "--btn-sm-px": b.sm.paddingX,
    "--btn-sm-text": b.sm.fontSize,
    "--btn-md-height": b.md.height,
    "--btn-md-px": b.md.paddingX,
    "--btn-md-text": b.md.fontSize,
    "--btn-lg-height": b.lg.height,
    "--btn-lg-px": b.lg.paddingX,
    "--btn-lg-text": b.lg.fontSize,
    "--radius-sm": r.sm,
    "--radius-md": r.md,
    "--radius-lg": r.lg,
    "--radius-xl": r.xl,
    "--radius-full": r.full,
  };
}

export function designSystemToCssBlock(ds: DesignSystem, selector = ":root"): string {
  const vars = designSystemToCssVars(ds);
  const lines = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `${selector} {\n${lines}\n}`;
}
