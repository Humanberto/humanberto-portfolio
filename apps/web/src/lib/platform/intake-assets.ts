/** Categories for intake uploads — stored per tenant in site_content.intake_assets */

export type IntakeAssetCategory = "resume" | "portfolio" | "projects" | "inspiration";

export type IntakeAssetItem = {
  id: string;
  category: IntakeAssetCategory;
  name: string;
  url: string;
  path: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

export type IntakeAssetsRecord = Record<IntakeAssetCategory, IntakeAssetItem[]>;

export const INTAKE_CATEGORIES: {
  id: IntakeAssetCategory;
  label: string;
  hint: string;
  accept: string;
  usableOnSite: boolean;
}[] = [
  {
    id: "resume",
    label: "Resume / CV",
    hint: "PDF or text — used to write your About page, site copy, and advocate facts.",
    accept: ".pdf,.txt,.md,application/pdf,text/plain",
    usableOnSite: true,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    hint: "PDFs or images of past work — used for case study copy and gallery images on your site.",
    accept: ".pdf,.png,.jpg,.jpeg,.webp,.gif,image/*,application/pdf",
    usableOnSite: true,
  },
  {
    id: "projects",
    label: "Projects",
    hint: "Screenshots, decks, or write-ups — each file can become or enrich a project page.",
    accept: ".pdf,.png,.jpg,.jpeg,.webp,.gif,image/*,application/pdf",
    usableOnSite: true,
  },
  {
    id: "inspiration",
    label: "Inspiration (reference only)",
    hint: "Other people's sites, palettes, or layouts you admire. Used only for mood and styling — never copied onto your live site.",
    accept: ".png,.jpg,.jpeg,.webp,.gif,image/*",
    usableOnSite: false,
  },
];

export const INSPIRATION_DISCLAIMER =
  "Inspiration files are reference only. The design agent may borrow colors, typography vibes, and layout feel — but will not copy text, logos, or images from inspiration onto your published portfolio.";

export function emptyIntakeAssets(): IntakeAssetsRecord {
  return { resume: [], portfolio: [], projects: [], inspiration: [] };
}

export function normalizeIntakeAssets(raw: unknown): IntakeAssetsRecord {
  const base = emptyIntakeAssets();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  for (const cat of INTAKE_CATEGORIES) {
    const list = obj[cat.id];
    if (Array.isArray(list)) {
      base[cat.id] = list.filter(
        (item): item is IntakeAssetItem =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as IntakeAssetItem).url === "string",
      );
    }
  }
  return base;
}
