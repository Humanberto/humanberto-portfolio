"use client";

import { Button } from "@humanberto/ui";
import type { DesignSystem } from "@humanberto/ui";

type Props = {
  system: DesignSystem;
  title?: string;
  subtitle?: string;
  className?: string;
};

export function DesignSystemPresentation({
  system,
  title = "Design System",
  subtitle,
  className = "",
}: Props) {
  const { colors, typography: t, buttons: b, radii } = system;
  const colorEntries = Object.entries(colors) as [keyof typeof colors, string][];

  return (
    <div className={`ds-presentation bg-ink text-fg ${className}`}>
      <header className="border-b border-line px-8 py-10 print:px-0 print:py-6">
        <p
          className="uppercase text-gold"
          style={{
            fontSize: "var(--ds-eyebrow-size)",
            letterSpacing: "var(--ds-eyebrow-tracking)",
          }}
        >
          {system.name} · v{system.version}
        </p>
        <h1
          className="mt-3 font-display"
          style={{
            fontSize: "var(--ds-h1-size)",
            fontWeight: "var(--ds-display-weight)",
            letterSpacing: "var(--ds-display-tracking)",
            lineHeight: "var(--ds-leading-tight)",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-muted" style={{ fontSize: "var(--ds-body-size)" }}>
            {subtitle}
          </p>
        )}
      </header>

      <section className="border-b border-line px-8 py-10 print:break-inside-avoid print:px-0">
        <SectionLabel>Color palette</SectionLabel>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {colorEntries.map(([name, hex]) => (
            <div key={name} className="overflow-hidden rounded-[var(--radius-lg)] border border-line">
              <div className="aspect-[4/3]" style={{ backgroundColor: hex }} />
              <div className="p-3">
                <p className="text-sm font-medium capitalize">{name.replace(/([A-Z])/g, " $1")}</p>
                <p className="font-mono text-xs text-faint">{hex.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-line px-8 py-10 print:break-inside-avoid print:px-0">
        <SectionLabel>Typography</SectionLabel>
        <div className="mt-6 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-faint">Display</p>
            <p
              className="mt-2 font-display"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--ds-display-size)",
                fontWeight: "var(--ds-display-weight)",
                letterSpacing: "var(--ds-display-tracking)",
                lineHeight: "var(--ds-leading-tight)",
              }}
            >
              Turning messy processes into clean experiences.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-faint">Heading 1</p>
            <p
              className="mt-2 font-display"
              style={{
                fontSize: "var(--ds-h1-size)",
                fontWeight: "var(--ds-heading-weight)",
              }}
            >
              Case study title
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-faint">Heading 2</p>
            <p
              className="mt-2 font-display"
              style={{
                fontSize: "var(--ds-h2-size)",
                fontWeight: "var(--ds-heading-weight)",
              }}
            >
              Section heading
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-faint">Body</p>
            <p
              className="mt-2 text-muted"
              style={{
                fontSize: "var(--ds-body-size)",
                fontWeight: "var(--ds-body-weight)",
                lineHeight: "var(--ds-leading-relaxed)",
              }}
            >
              Product designer and Python developer who works across data, design, and AI to ship
              products people actually understand.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-faint">Eyebrow / label</p>
            <p
              className="mt-2 uppercase text-gold"
              style={{
                fontSize: "var(--ds-eyebrow-size)",
                letterSpacing: "var(--ds-eyebrow-tracking)",
              }}
            >
              Selected work
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-line bg-surface/50 p-4">
            <p className="text-xs text-faint">Font stacks</p>
            <dl className="mt-2 space-y-2 font-mono text-xs text-muted">
              <div>
                <dt className="text-faint">Display</dt>
                <dd>{t.displayFont}</dd>
              </div>
              <div>
                <dt className="text-faint">Body</dt>
                <dd>{t.bodyFont}</dd>
              </div>
              <div>
                <dt className="text-faint">Mono</dt>
                <dd>{t.monoFont}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="border-b border-line px-8 py-10 print:break-inside-avoid print:px-0">
        <SectionLabel>Buttons</SectionLabel>
        <p className="mt-2 text-sm text-muted">
          Radius: <span className="font-mono text-fg">{b.borderRadius}</span>
        </p>
        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div className="space-y-2 text-center">
            <Button variant="gold" size="sm">
              Small
            </Button>
            <p className="text-xs text-faint">
              {b.sm.height} · {b.sm.fontSize}
            </p>
          </div>
          <div className="space-y-2 text-center">
            <Button variant="gold" size="md">
              Medium
            </Button>
            <p className="text-xs text-faint">
              {b.md.height} · {b.md.fontSize}
            </p>
          </div>
          <div className="space-y-2 text-center">
            <Button variant="gold" size="lg">
              Large
            </Button>
            <p className="text-xs text-faint">
              {b.lg.height} · {b.lg.fontSize}
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="gold">Gold</Button>
          <Button variant="purple">Purple</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section className="px-8 py-10 print:break-inside-avoid print:px-0">
        <SectionLabel>Border radius</SectionLabel>
        <div className="mt-6 flex flex-wrap gap-6">
          {Object.entries(radii).map(([name, value]) => (
            <div key={name} className="text-center">
              <div
                className="mx-auto h-16 w-16 border-2 border-gold bg-surface"
                style={{ borderRadius: value }}
              />
              <p className="mt-2 text-sm capitalize">{name}</p>
              <p className="font-mono text-xs text-faint">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="uppercase text-gold"
      style={{
        fontSize: "var(--ds-eyebrow-size)",
        letterSpacing: "var(--ds-eyebrow-tracking)",
      }}
    >
      {children}
    </h2>
  );
}
