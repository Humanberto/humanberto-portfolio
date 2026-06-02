/**
 * Brand design tokens for the Humanberto system.
 *
 * These are the single source of truth for color, shared between CSS (via the
 * Tailwind @theme block in the web app) and JS/GLSL (the living background
 * shader, OG image generation, PDF export, etc.). Keep the hex values in sync
 * with apps/web/src/app/globals.css.
 */

export const colors = {
  // Backgrounds: near-black -> deep purple
  ink: "#0B0610",
  surface: "#140A24",
  surfaceRaised: "#1A0A2E",
  purpleDeep: "#2A0E45",

  // Purple accents
  purple: "#7B3FE4",
  purpleSoft: "#A06BF0",

  // Gold
  gold: "#C9A227",
  goldBright: "#E6C260",
  goldDust: "#F4E4A6",

  // Text
  text: "#F5F1E6",
  textMuted: "#B7A8C9",
  textFaint: "#6E5F86",

  // Lines / borders
  line: "#2E1F47",
} as const;

export type ColorToken = keyof typeof colors;

/** Normalized [r,g,b] in 0..1 for shader uniforms. */
export function toVec3(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
}

export const fonts = {
  display: "var(--font-display)",
  body: "var(--font-sans)",
  mono: "var(--font-mono)",
} as const;
