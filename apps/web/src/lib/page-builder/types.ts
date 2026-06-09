export type BlockType =
  | "heading"
  | "text"
  | "richtext"
  | "number"
  | "image"
  | "video"
  | "address"
  | "button"
  | "spacer"
  | "divider"
  | "login-form";

export interface PageBlock {
  id: string;
  type: BlockType;
  props: BlockProps;
}

export type BlockProps = {
  heading?: { text: string; level: 1 | 2 | 3 };
  text?: { body: string };
  richtext?: { html: string };
  number?: { label: string; value: string; unit?: string };
  image?: { url: string; alt: string; caption?: string };
  video?: { url: string; caption?: string; posterUrl?: string };
  address?: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postal: string;
    country: string;
  };
  button?: { label: string; href: string; variant: "primary" | "outline" };
  spacer?: { height: number };
  divider?: Record<string, never>;
  "login-form"?: { title: string; subtitle: string; badge: string };
};

export type PageKind = "system" | "custom";
export type PageZone = "public" | "myoffice";

export interface PageDocument {
  id: string;
  title: string;
  slug: string;
  kind: PageKind;
  zone: PageZone;
  /** Public URL path (e.g. /about, /myoffice/login, /pages/pricing) */
  publicPath: string;
  description?: string;
  blocks: PageBlock[];
  updatedAt: string;
}

export interface PageBuilderStore {
  pages: PageDocument[];
}

export type PaletteItem = {
  type: BlockType;
  label: string;
  category: "Content" | "Media" | "Data" | "Layout" | "Widgets";
  description: string;
  icon: string;
};

export const BLOCK_PALETTE: PaletteItem[] = [
  { type: "heading", label: "Heading", category: "Content", description: "Title or section header", icon: "H" },
  { type: "text", label: "Text", category: "Content", description: "Plain paragraph", icon: "¶" },
  { type: "richtext", label: "Rich text", category: "Content", description: "Formatted copy with links", icon: "✦" },
  { type: "number", label: "Number", category: "Data", description: "Stat or metric with label", icon: "#" },
  { type: "address", label: "Address", category: "Data", description: "Structured location block", icon: "⌖" },
  { type: "image", label: "Image", category: "Media", description: "Photo or illustration", icon: "▣" },
  { type: "video", label: "Video", category: "Media", description: "YouTube, Vimeo, or MP4", icon: "▶" },
  { type: "button", label: "Button / link", category: "Content", description: "Call-to-action link", icon: "↗" },
  { type: "spacer", label: "Spacer", category: "Layout", description: "Vertical breathing room", icon: "↕" },
  { type: "divider", label: "Divider", category: "Layout", description: "Horizontal rule", icon: "—" },
  {
    type: "login-form",
    label: "Login form",
    category: "Widgets",
    description: "My Office password sign-in",
    icon: "🔐",
  },
];

export const PALETTE_CATEGORIES = ["Content", "Media", "Data", "Layout", "Widgets"] as const;
