"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { PageBlockRenderer } from "@/components/page-builder/block-renderer";
import { createBlock } from "@/lib/page-builder/defaults";
import {
  BLOCK_PALETTE,
  PALETTE_CATEGORIES,
  type BlockType,
  type PageBlock,
  type PageDocument,
} from "@/lib/page-builder/types";

export function PageBuilderWorkspace({
  initialPage,
  previewUrl,
}: {
  initialPage: PageDocument;
  previewUrl: string;
}) {
  const [page, setPage] = useState(initialPage);
  const [selectedId, setSelectedId] = useState<string | null>(page.blocks[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [paletteQuery, setPaletteQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const selected = page.blocks.find((b) => b.id === selectedId) ?? null;

  const filteredPalette = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    if (!q) return BLOCK_PALETTE;
    return BLOCK_PALETTE.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [paletteQuery]);

  const addBlock = useCallback((type: BlockType) => {
    const block = createBlock(type);
    setPage((p) => ({ ...p, blocks: [...p.blocks, block] }));
    setSelectedId(block.id);
  }, []);

  const updateBlock = useCallback((id: string, props: PageBlock["props"]) => {
    setPage((p) => ({
      ...p,
      blocks: p.blocks.map((b) => (b.id === id ? { ...b, props } : b)),
    }));
  }, []);

  const removeBlock = useCallback((id: string) => {
    setPage((p) => {
      const blocks = p.blocks.filter((b) => b.id !== id);
      return { ...p, blocks };
    });
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPage((p) => {
      const oldIndex = p.blocks.findIndex((b) => b.id === active.id);
      const newIndex = p.blocks.findIndex((b) => b.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return p;
      return { ...p, blocks: arrayMove(p.blocks, oldIndex, newIndex) };
    });
  };

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/myoffice/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Saved");
    } catch {
      setMessage("Could not save — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/myoffice/pages" className="text-sm text-white/50 hover:text-white/80">
            ← All pages
          </Link>
          <h2 className="mt-1 font-display text-2xl">{page.title}</h2>
          <p className="text-sm text-white/50">{page.publicPath}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {message ? <span className="text-sm text-emerald-300">{message}</span> : null}
          <Link
            href={previewUrl}
            target="_blank"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            Preview ↗
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save page"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr_280px]">
        {/* Palette */}
        <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">Blocks</p>
          <input
            type="search"
            value={paletteQuery}
            onChange={(e) => setPaletteQuery(e.target.value)}
            placeholder="Search blocks…"
            className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
          />
          <div className="mt-4 space-y-5">
            {PALETTE_CATEGORIES.map((cat) => {
              const items = filteredPalette.filter((p) => p.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat}>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/35">
                    {cat}
                  </p>
                  <ul className="space-y-1.5">
                    {items.map((item) => (
                      <li key={item.type}>
                        <button
                          type="button"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("block-type", item.type);
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                          onClick={() => addBlock(item.type)}
                          className="flex w-full items-start gap-2 rounded-lg border border-transparent px-2 py-2 text-left hover:border-white/10 hover:bg-white/5"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs">
                            {item.icon}
                          </span>
                          <span>
                            <span className="block text-sm text-white/90">{item.label}</span>
                            <span className="block text-[11px] leading-snug text-white/45">
                              {item.description}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Canvas */}
        <section
          className="min-h-[420px] rounded-2xl border border-white/10 bg-[#0f0818] p-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData("block-type") as BlockType;
            if (type) addBlock(type);
          }}
        >
          <p className="mb-4 text-xs text-white/40">
            Drag blocks here or click in the palette · reorder by dragging handles
          </p>
          {page.blocks.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/15 text-sm text-white/40">
              Drop your first block here
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={page.blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-3">
                  {page.blocks.map((block) => (
                    <SortableBlockRow
                      key={block.id}
                      block={block}
                      selected={selectedId === block.id}
                      onSelect={() => setSelectedId(block.id)}
                      onRemove={() => removeBlock(block.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>

        {/* Properties */}
        <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">Properties</p>
          {selected ? (
            <BlockPropertiesEditor
              block={selected}
              onChange={(props) => updateBlock(selected.id, props)}
            />
          ) : (
            <p className="mt-4 text-sm text-white/45">Select a block to edit its fields.</p>
          )}

          <div className="mt-8 border-t border-white/10 pt-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">Preview</p>
            <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <PageBlockRenderer blocks={selected ? [selected] : []} mode="preview" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SortableBlockRow({
  block,
  selected,
  onSelect,
  onRemove,
}: {
  block: PageBlock;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const label =
    BLOCK_PALETTE.find((p) => p.type === block.type)?.label ?? block.type;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border ${selected ? "border-gold/50 bg-gold/5" : "border-white/10 bg-white/[0.02]"}`}
    >
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-white/40 hover:text-white/70 active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 text-left text-sm font-medium text-white/85"
        >
          {label}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded px-2 py-1 text-xs text-rose-300/80 hover:bg-rose-500/10"
        >
          Remove
        </button>
      </div>
      <button type="button" onClick={onSelect} className="w-full px-4 py-3 text-left">
        <PageBlockRenderer blocks={[block]} mode="preview" />
      </button>
    </li>
  );
}

function BlockPropertiesEditor({
  block,
  onChange,
}: {
  block: PageBlock;
  onChange: (props: PageBlock["props"]) => void;
}) {
  const field =
    "mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25";
  const label = "block text-xs text-white/55";

  function patch(partial: Partial<PageBlock["props"]>) {
    onChange({ ...block.props, ...partial });
  }

  switch (block.type) {
    case "heading": {
      const h = block.props.heading ?? { text: "", level: 2 as const };
      return (
        <div className="mt-4 space-y-3">
          <label className={label}>
            Text
            <input
              className={field}
              value={h.text}
              onChange={(e) => patch({ heading: { ...h, text: e.target.value } })}
            />
          </label>
          <label className={label}>
            Level
            <select
              className={field}
              value={h.level}
              onChange={(e) =>
                patch({
                  heading: { ...h, level: Number(e.target.value) as 1 | 2 | 3 },
                })
              }
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
          </label>
        </div>
      );
    }
    case "text":
      return (
        <label className={`${label} mt-4`}>
          Body
          <textarea
            rows={5}
            className={field}
            value={block.props.text?.body ?? ""}
            onChange={(e) => patch({ text: { body: e.target.value } })}
          />
        </label>
      );
    case "richtext":
      return (
        <label className={`${label} mt-4`}>
          HTML
          <textarea
            rows={8}
            className={`${field} font-mono text-xs`}
            value={block.props.richtext?.html ?? ""}
            onChange={(e) => patch({ richtext: { html: e.target.value } })}
          />
        </label>
      );
    case "number": {
      const n = block.props.number ?? { label: "", value: "" };
      return (
        <div className="mt-4 space-y-3">
          <label className={label}>
            Label
            <input
              className={field}
              value={n.label}
              onChange={(e) => patch({ number: { ...n, label: e.target.value } })}
            />
          </label>
          <label className={label}>
            Value
            <input
              className={field}
              value={n.value}
              onChange={(e) => patch({ number: { ...n, value: e.target.value } })}
            />
          </label>
          <label className={label}>
            Unit (optional)
            <input
              className={field}
              value={n.unit ?? ""}
              onChange={(e) => patch({ number: { ...n, unit: e.target.value } })}
            />
          </label>
        </div>
      );
    }
    case "image": {
      const img = block.props.image ?? { url: "", alt: "" };
      return (
        <div className="mt-4 space-y-3">
          <label className={label}>
            Image URL
            <input
              className={field}
              value={img.url}
              onChange={(e) => patch({ image: { ...img, url: e.target.value } })}
            />
          </label>
          <label className={label}>
            Alt text
            <input
              className={field}
              value={img.alt}
              onChange={(e) => patch({ image: { ...img, alt: e.target.value } })}
            />
          </label>
          <label className={label}>
            Caption
            <input
              className={field}
              value={img.caption ?? ""}
              onChange={(e) => patch({ image: { ...img, caption: e.target.value } })}
            />
          </label>
        </div>
      );
    }
    case "video": {
      const v = block.props.video ?? { url: "" };
      return (
        <div className="mt-4 space-y-3">
          <label className={label}>
            Video URL
            <input
              className={field}
              value={v.url}
              onChange={(e) => patch({ video: { ...v, url: e.target.value } })}
            />
          </label>
          <label className={label}>
            Caption
            <input
              className={field}
              value={v.caption ?? ""}
              onChange={(e) => patch({ video: { ...v, caption: e.target.value } })}
            />
          </label>
        </div>
      );
    }
    case "address": {
      const a = block.props.address ?? {
        label: "",
        line1: "",
        city: "",
        region: "",
        postal: "",
        country: "",
      };
      return (
        <div className="mt-4 space-y-2">
          {(
            [
              ["label", "Label"],
              ["line1", "Line 1"],
              ["line2", "Line 2"],
              ["city", "City"],
              ["region", "State / region"],
              ["postal", "Postal code"],
              ["country", "Country"],
            ] as const
          ).map(([key, text]) => (
            <label key={key} className={label}>
              {text}
              <input
                className={field}
                value={(a as Record<string, string>)[key] ?? ""}
                onChange={(e) => patch({ address: { ...a, [key]: e.target.value } })}
              />
            </label>
          ))}
        </div>
      );
    }
    case "button": {
      const b = block.props.button ?? { label: "", href: "/", variant: "primary" as const };
      return (
        <div className="mt-4 space-y-3">
          <label className={label}>
            Label
            <input
              className={field}
              value={b.label}
              onChange={(e) => patch({ button: { ...b, label: e.target.value } })}
            />
          </label>
          <label className={label}>
            Link
            <input
              className={field}
              value={b.href}
              onChange={(e) => patch({ button: { ...b, href: e.target.value } })}
            />
          </label>
          <label className={label}>
            Style
            <select
              className={field}
              value={b.variant}
              onChange={(e) =>
                patch({
                  button: { ...b, variant: e.target.value as "primary" | "outline" },
                })
              }
            >
              <option value="primary">Primary</option>
              <option value="outline">Outline</option>
            </select>
          </label>
        </div>
      );
    }
    case "spacer":
      return (
        <label className={`${label} mt-4`}>
          Height (px)
          <input
            type="number"
            min={8}
            max={160}
            className={field}
            value={block.props.spacer?.height ?? 32}
            onChange={(e) => patch({ spacer: { height: Number(e.target.value) } })}
          />
        </label>
      );
    case "login-form": {
      const lf = block.props["login-form"] ?? { badge: "", title: "", subtitle: "" };
      return (
        <div className="mt-4 space-y-3">
          <label className={label}>
            Badge
            <input
              className={field}
              value={lf.badge}
              onChange={(e) => patch({ "login-form": { ...lf, badge: e.target.value } })}
            />
          </label>
          <label className={label}>
            Title
            <input
              className={field}
              value={lf.title}
              onChange={(e) => patch({ "login-form": { ...lf, title: e.target.value } })}
            />
          </label>
          <label className={label}>
            Subtitle
            <textarea
              rows={3}
              className={field}
              value={lf.subtitle}
              onChange={(e) => patch({ "login-form": { ...lf, subtitle: e.target.value } })}
            />
          </label>
        </div>
      );
    }
    default:
      return <p className="mt-4 text-sm text-white/45">No properties for this block.</p>;
  }
}
