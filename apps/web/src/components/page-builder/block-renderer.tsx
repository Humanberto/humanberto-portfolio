"use client";

import type { PageBlock } from "@/lib/page-builder/types";
import { MyOfficeLoginWidget } from "./login-widget";

export function PageBlockRenderer({
  blocks,
  mode = "public",
}: {
  blocks: PageBlock[];
  mode?: "public" | "preview";
}) {
  return (
    <div className={mode === "preview" ? "space-y-4" : "space-y-6"}>
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} mode={mode} />
      ))}
    </div>
  );
}

function BlockView({ block, mode }: { block: PageBlock; mode: "public" | "preview" }) {
  switch (block.type) {
    case "heading": {
      const h = block.props.heading;
      if (!h?.text) return null;
      const Tag = h.level === 1 ? "h1" : h.level === 3 ? "h3" : "h2";
      const size =
        h.level === 1
          ? "text-4xl font-light sm:text-5xl"
          : h.level === 3
            ? "text-xl font-medium"
            : "text-2xl font-light sm:text-3xl";
      return (
        <Tag className={`font-display leading-tight text-fg ${size}`}>{h.text}</Tag>
      );
    }
    case "text": {
      const body = block.props.text?.body;
      if (!body) return null;
      return <p className="max-w-2xl text-base leading-relaxed text-muted">{body}</p>;
    }
    case "richtext": {
      const html = block.props.richtext?.html;
      if (!html) return null;
      return (
        <div
          className="prose prose-invert max-w-2xl text-muted [&_a]:text-gold [&_strong]:text-fg"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    case "number": {
      const n = block.props.number;
      if (!n) return null;
      return (
        <div className="rounded-2xl border border-line bg-surface/40 px-6 py-5">
          <p className="font-display text-4xl font-light text-gold">
            {n.value}
            {n.unit ? <span className="ml-1 text-2xl text-muted">{n.unit}</span> : null}
          </p>
          <p className="mt-2 text-sm text-muted">{n.label}</p>
        </div>
      );
    }
    case "image": {
      const img = block.props.image;
      if (!img?.url) {
        return mode === "preview" ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-line text-sm text-faint">
            Image — add URL in properties
          </div>
        ) : null;
      }
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.alt || ""}
            className="w-full rounded-xl border border-line object-cover"
          />
          {img.caption ? (
            <figcaption className="mt-2 text-sm text-faint">{img.caption}</figcaption>
          ) : null}
        </figure>
      );
    }
    case "video": {
      const v = block.props.video;
      if (!v?.url) {
        return mode === "preview" ? (
          <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-line text-sm text-faint">
            Video — add URL in properties
          </div>
        ) : null;
      }
      const embed = videoEmbedUrl(v.url);
      if (embed) {
        return (
          <figure>
            <div className="aspect-video overflow-hidden rounded-xl border border-line">
              <iframe
                src={embed}
                title={v.caption || "Video"}
                className="h-full w-full border-0"
                allowFullScreen
              />
            </div>
            {v.caption ? (
              <figcaption className="mt-2 text-sm text-faint">{v.caption}</figcaption>
            ) : null}
          </figure>
        );
      }
      return (
        <video
          src={v.url}
          poster={v.posterUrl}
          controls
          className="w-full rounded-xl border border-line"
        />
      );
    }
    case "address": {
      const a = block.props.address;
      if (!a) return null;
      const lines = [
        a.label,
        a.line1,
        a.line2,
        [a.city, a.region, a.postal].filter(Boolean).join(", "),
        a.country,
      ].filter(Boolean);
      return (
        <address className="not-italic rounded-2xl border border-line bg-surface/40 px-5 py-4 text-sm leading-relaxed text-muted">
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </address>
      );
    }
    case "button": {
      const b = block.props.button;
      if (!b?.label) return null;
      const cls =
        b.variant === "outline"
          ? "border border-line text-fg hover:border-gold"
          : "bg-gold text-ink hover:bg-gold-bright";
      return (
        <a
          href={b.href || "#"}
          className={`inline-flex rounded-full px-6 py-3 text-sm font-medium transition ${cls}`}
        >
          {b.label}
        </a>
      );
    }
    case "spacer": {
      const h = block.props.spacer?.height ?? 24;
      return <div aria-hidden style={{ height: h }} />;
    }
    case "divider":
      return <hr className="border-line" />;
    case "login-form": {
      const lf = block.props["login-form"];
      return (
        <MyOfficeLoginWidget
          badge={lf?.badge ?? "Humanberto"}
          title={lf?.title ?? "Back office"}
          subtitle={lf?.subtitle ?? "Sign in to manage your site."}
        />
      );
    }
    default:
      return null;
  }
}

function videoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id =
        u.searchParams.get("v") ??
        (u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.pathname.split("/").pop());
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
