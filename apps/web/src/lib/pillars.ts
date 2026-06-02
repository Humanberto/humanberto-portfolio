import type { Pillar } from "@/content/projects";

/**
 * One accent color per craft. Tuned to sit beside the gold/purple brand
 * without clashing: the two design crafts lean into the brand gold/purple,
 * the engineering crafts use cooler distinct hues.
 */
export const PILLAR_COLORS: Record<Pillar, string> = {
  "Product Design": "#e6c260", // gold-bright
  "UX/UI Design": "#a06bf0", // purple-soft
  "Python": "#54cbb8", // teal
  "Data Engineering": "#6f9bff", // blue
  "AI/ML": "#ef88b3", // rose
};

/** Convert a #RRGGBB hex to an rgba() string at the given alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
