import "server-only";
import { getContentOverride, setContentOverride } from "@/lib/admin/content";
import { DEFAULT_MYOFFICE_LOGIN, createBlock, defaultBlockProps, newBlockId } from "./defaults";
import { SYSTEM_PAGE_CATALOG, catalogForScope, slugifyPageTitle } from "./registry";
import type { PageBlock, PageBuilderStore, PageDocument } from "./types";

const EMPTY_STORE: PageBuilderStore = { pages: [] };

function seedSystemPages(isBootstrap: boolean): PageDocument[] {
  const catalog = catalogForScope(isBootstrap);
  const seeds: PageDocument[] = [DEFAULT_MYOFFICE_LOGIN];

  for (const def of catalog) {
    if (def.id === "myoffice-login") continue;
    if (!def.dedicatedEditor?.includes("/myoffice/pages/")) continue;

    seeds.push({
      id: def.id,
      title: def.title,
      slug: def.id,
      kind: "system",
      zone: def.zone,
      publicPath: def.publicPath,
      description: def.description,
      updatedAt: new Date(0).toISOString(),
      blocks: [
        {
          id: newBlockId(),
          type: "heading",
          props: { heading: { text: def.title, level: 1 } },
        },
        {
          id: newBlockId(),
          type: "text",
          props: {
            text: {
              body: `${def.description} Edit blocks here, then preview on the live site.`,
            },
          },
        },
      ],
    });
  }

  return seeds;
}

function mergeStore(raw: PageBuilderStore | null, isBootstrap: boolean): PageBuilderStore {
  const seeds = seedSystemPages(isBootstrap);
  const byId = new Map<string, PageDocument>();

  for (const seed of seeds) {
    byId.set(seed.id, seed);
  }

  for (const page of raw?.pages ?? []) {
    byId.set(page.id, page);
  }

  return { pages: Array.from(byId.values()) };
}

export async function getPageBuilderStore(isBootstrap: boolean): Promise<PageBuilderStore> {
  const raw = await getContentOverride<PageBuilderStore>("page_builder");
  return mergeStore(raw, isBootstrap);
}

export async function savePageBuilderStore(store: PageBuilderStore): Promise<boolean> {
  return setContentOverride("page_builder", store);
}

export async function getPageDocument(
  pageId: string,
  isBootstrap: boolean,
): Promise<PageDocument | null> {
  const store = await getPageBuilderStore(isBootstrap);
  return store.pages.find((p) => p.id === pageId) ?? null;
}

export async function savePageDocument(
  page: PageDocument,
  isBootstrap: boolean,
): Promise<boolean> {
  const store = await getPageBuilderStore(isBootstrap);
  const idx = store.pages.findIndex((p) => p.id === page.id);
  const next = { ...page, updatedAt: new Date().toISOString() };
  if (idx >= 0) store.pages[idx] = next;
  else store.pages.push(next);
  return savePageBuilderStore(store);
}

export async function createCustomPage(
  title: string,
  isBootstrap: boolean,
): Promise<PageDocument | null> {
  const store = await getPageBuilderStore(isBootstrap);
  const slug = slugifyPageTitle(title);
  const id = `custom-${slug}-${newBlockId().slice(-4)}`;

  if (store.pages.some((p) => p.slug === slug && p.kind === "custom")) {
    return null;
  }

  const page: PageDocument = {
    id,
    title: title.trim() || "New page",
    slug,
    kind: "custom",
    zone: "public",
    publicPath: `/pages/${slug}`,
    description: "",
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: newBlockId(),
        type: "heading",
        props: { heading: { text: title.trim() || "New page", level: 1 } },
      },
      {
        id: newBlockId(),
        type: "text",
        props: { text: { body: "Drag blocks from the palette to build this page." } },
      },
    ],
  };

  store.pages.push(page);
  const ok = await savePageBuilderStore(store);
  return ok ? page : null;
}

export async function deleteCustomPage(pageId: string, isBootstrap: boolean): Promise<boolean> {
  const store = await getPageBuilderStore(isBootstrap);
  const page = store.pages.find((p) => p.id === pageId);
  if (!page || page.kind !== "custom") return false;
  store.pages = store.pages.filter((p) => p.id !== pageId);
  return savePageBuilderStore(store);
}

export async function getCustomPageBySlug(
  slug: string,
  tenantId?: string,
): Promise<PageDocument | null> {
  const raw = await getContentOverride<PageBuilderStore>("page_builder", tenantId);
  const page = raw?.pages?.find((p) => p.kind === "custom" && p.slug === slug);
  return page ?? null;
}

export async function getBlocksForSystemPage(
  pageId: string,
  isBootstrap: boolean,
  tenantId?: string,
): Promise<PageBlock[] | null> {
  const raw = await getContentOverride<PageBuilderStore>("page_builder", tenantId);
  const merged = mergeStore(raw, isBootstrap);
  const page = merged.pages.find((p) => p.id === pageId);
  return page?.blocks ?? null;
}

export function listCatalogWithPages(
  store: PageBuilderStore,
  isBootstrap: boolean,
) {
  const catalog = catalogForScope(isBootstrap);
  const custom = store.pages.filter((p) => p.kind === "custom");

  const system = catalog.map((def) => {
    const doc = store.pages.find((p) => p.id === def.id);
    const blockEditor = def.dedicatedEditor?.includes("/myoffice/pages/");
    return {
      ...def,
      blockCount: doc?.blocks.length ?? 0,
      updatedAt: doc?.updatedAt,
      editorHref: blockEditor ? `/myoffice/pages/${def.id}` : def.dedicatedEditor,
    };
  });

  return { system, custom };
}

export async function getPublishedBuilderPage(
  pageId: string,
  isBootstrap: boolean,
  tenantId?: string,
): Promise<PageDocument | null> {
  const raw = await getContentOverride<PageBuilderStore>("page_builder", tenantId);
  const merged = mergeStore(raw, isBootstrap);
  const page = merged.pages.find((p) => p.id === pageId);
  if (!page || !page.blocks.length) return null;
  if (new Date(page.updatedAt).getTime() <= 0) return null;
  return page;
}
