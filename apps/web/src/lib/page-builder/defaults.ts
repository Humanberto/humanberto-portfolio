import type { BlockType, PageBlock, PageDocument } from "./types";

export function newBlockId(): string {
  return `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function defaultBlockProps(type: BlockType): PageBlock["props"] {
  switch (type) {
    case "heading":
      return { heading: { text: "Section heading", level: 2 } };
    case "text":
      return { text: { body: "Add your paragraph text here." } };
    case "richtext":
      return {
        richtext: {
          html: "<p><strong>Rich text</strong> supports basic HTML for emphasis and links.</p>",
        },
      };
    case "number":
      return { number: { label: "Metric", value: "42", unit: "%" } };
    case "image":
      return { image: { url: "", alt: "Describe the image", caption: "" } };
    case "video":
      return { video: { url: "", caption: "" } };
    case "address":
      return {
        address: {
          label: "Office",
          line1: "123 Main St",
          line2: "",
          city: "Berkeley",
          region: "CA",
          postal: "94704",
          country: "USA",
        },
      };
    case "button":
      return { button: { label: "Learn more", href: "/", variant: "primary" } };
    case "spacer":
      return { spacer: { height: 32 } };
    case "divider":
      return { divider: {} };
    case "login-form":
      return {
        "login-form": {
          badge: "Humanberto",
          title: "Back office",
          subtitle: "Sign in to manage content, pages, and LLM keys.",
        },
      };
    default:
      return {};
  }
}

export function createBlock(type: BlockType): PageBlock {
  return { id: newBlockId(), type, props: defaultBlockProps(type) };
}

export const DEFAULT_MYOFFICE_LOGIN: PageDocument = {
  id: "myoffice-login",
  title: "My Office login",
  slug: "myoffice-login",
  kind: "system",
  zone: "myoffice",
  publicPath: "/myoffice/login",
  description: "Password gate for the Humanberto back office.",
  updatedAt: new Date(0).toISOString(),
  blocks: [
    createBlock("login-form"),
  ],
};

export const DEFAULT_CUSTOM_PAGE_TEMPLATE: Omit<PageDocument, "id" | "slug" | "updatedAt"> = {
  title: "New page",
  kind: "custom",
  zone: "public",
  publicPath: "/pages/new-page",
  description: "",
  blocks: [
    {
      id: newBlockId(),
      type: "heading",
      props: { heading: { text: "New page", level: 1 } },
    },
    {
      id: newBlockId(),
      type: "text",
      props: { text: { body: "Start building by dragging blocks from the left panel." } },
    },
  ],
};
