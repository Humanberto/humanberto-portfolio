"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  COLOR_TOKEN_LABELS,
  defaultDesignSystem,
  mergeDesignSystem,
  type DesignSystem,
  type DesignSystemButtonSize,
  type DesignSystemColors,
  type DesignSystemPatch,
  type DesignSystemTypography,
} from "@humanberto/ui";
import { DesignSystemPresentation } from "./design-system-presentation";
import { DesignSystemPrintButton } from "./design-system-print-button";
import { DesignSystemVersionPanel } from "./design-system-version-panel";

type Tab = "colors" | "typography" | "buttons" | "radii" | "preview";

const inputClass =
  "mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white text-sm";
const labelClass = "block text-sm text-white/70";

export function DesignSystemEditor() {
  const [draft, setDraft] = useState<DesignSystem>(defaultDesignSystem);
  const [tab, setTab] = useState<Tab>("colors");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/myoffice/design");
    if (res.ok) {
      const data = (await res.json()) as { system: DesignSystem };
      setDraft(data.system);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function setColor(key: keyof DesignSystemColors, value: string) {
    setDraft((d) => ({
      ...d,
      colors: { ...d.colors, [key]: value },
    }));
  }

  function setTypo(key: keyof DesignSystemTypography, value: string) {
    setDraft((d) => ({
      ...d,
      typography: { ...d.typography, [key]: value },
    }));
  }

  function setButtonSize(size: "sm" | "md" | "lg", key: keyof DesignSystemButtonSize, value: string) {
    setDraft((d) => ({
      ...d,
      buttons: {
        ...d.buttons,
        [size]: { ...d.buttons[size], [key]: value },
      },
    }));
  }

  async function save() {
    setStatus("Saving…");
    const res = await fetch("/api/myoffice/design", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: draft }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setStatus(err.error ?? "Save failed.");
      return;
    }
    const data = (await res.json()) as { system: DesignSystem };
    setDraft(data.system);
    setStatus("Saved. Refresh the public site to see changes.");
  }

  async function unifyAllProjects() {
    if (
      !confirm(
        "Heal the site-wide design system and reset every project to use it? Custom project themes will be removed (saved as versions first).",
      )
    ) {
      return;
    }
    setStatus("Unifying all projects to system…");
    const res = await fetch("/api/myoffice/design/versions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unify" }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setStatus(err.error ?? "Unify failed.");
      return;
    }
    const data = (await res.json()) as { global: DesignSystem; projectsUpdated: number };
    setDraft(data.global);
    setStatus(
      `Unified. ${data.projectsUpdated} project(s) now use the site system. Refresh the public site to see changes.`,
    );
  }

  function resetDefaults() {
    if (!confirm("Reset the global design system to code defaults? A version snapshot is saved first when you save.")) return;
    setDraft(defaultDesignSystem);
    setStatus("Reset to code defaults in editor — click Save system to persist.");
  }

  async function resetToCodeDefaultsNow() {
    if (!confirm("Reset the live site-wide system to code defaults? Current system is snapshotted first.")) return;
    setStatus("Resetting…");
    const res = await fetch("/api/myoffice/design/versions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-defaults" }),
    });
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setStatus(err.error ?? "Reset failed.");
      return;
    }
    const data = (await res.json()) as { system: DesignSystem };
    setDraft(data.system);
    setStatus("Reset to code defaults.");
  }

  if (loading) return <p className="text-white/60">Loading design system…</p>;

  const tabs: { id: Tab; label: string }[] = [
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "buttons", label: "Buttons" },
    { id: "radii", label: "Radii" },
    { id: "preview", label: "Preview" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Site system</h2>
          <p className="mt-1 text-sm text-white/60">
            The overall website design. Projects inherit this unless they use a custom theme.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/myoffice/design/preview"
            target="_blank"
            className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            Full preview ↗
          </Link>
          <DesignSystemPrintButton />
          <button
            type="button"
            onClick={() => void unifyAllProjects()}
            className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            Unify all projects
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            Edit → code defaults
          </button>
          <button
            type="button"
            onClick={() => void resetToCodeDefaultsNow()}
            className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            Reset to code defaults
          </button>
          <button
            type="button"
            onClick={() => void save()}
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
          >
            Save system
          </button>
        </div>
      </div>

      <DesignSystemVersionPanel scope="system" onRestored={() => void refresh()} />

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === t.id ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          {tab === "colors" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.keys(COLOR_TOKEN_LABELS) as (keyof DesignSystemColors)[]).map((key) => (
                <label key={key} className={labelClass}>
                  {COLOR_TOKEN_LABELS[key]}
                  <div className="mt-1 flex gap-2">
                    <input
                      type="color"
                      value={draft.colors[key]}
                      onChange={(e) => setColor(key, e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded border border-white/15 bg-transparent"
                    />
                    <input
                      value={draft.colors[key]}
                      onChange={(e) => setColor(key, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </label>
              ))}
            </div>
          )}

          {tab === "typography" && (
            <div className="space-y-4">
              <MetaFields draft={draft} setDraft={setDraft} />
              {(
                [
                  ["displayFont", "Display font stack"],
                  ["bodyFont", "Body font stack"],
                  ["monoFont", "Mono font stack"],
                  ["displaySize", "Display size"],
                  ["h1Size", "H1 size"],
                  ["h2Size", "H2 size"],
                  ["h3Size", "H3 size"],
                  ["bodySize", "Body size"],
                  ["smallSize", "Small size"],
                  ["eyebrowSize", "Eyebrow size"],
                  ["displayWeight", "Display weight"],
                  ["headingWeight", "Heading weight"],
                  ["bodyWeight", "Body weight"],
                  ["tightLeading", "Tight line height"],
                  ["normalLeading", "Normal line height"],
                  ["relaxedLeading", "Relaxed line height"],
                  ["displayTracking", "Display letter-spacing"],
                  ["eyebrowTracking", "Eyebrow letter-spacing"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className={labelClass}>
                  {label}
                  <input
                    value={draft.typography[key]}
                    onChange={(e) => setTypo(key, e.target.value)}
                    className={inputClass}
                  />
                </label>
              ))}
            </div>
          )}

          {tab === "buttons" && (
            <div className="space-y-6">
              <label className={labelClass}>
                Border radius (all buttons)
                <input
                  value={draft.buttons.borderRadius}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      buttons: { ...d.buttons, borderRadius: e.target.value },
                    }))
                  }
                  className={inputClass}
                  placeholder="9999px or 0.75rem"
                />
              </label>
              {(["sm", "md", "lg"] as const).map((size) => (
                <fieldset key={size} className="rounded-xl border border-white/10 p-4">
                  <legend className="px-1 text-sm capitalize text-white/80">{size} button</legend>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {(["height", "paddingX", "fontSize"] as const).map((field) => (
                      <label key={field} className={labelClass}>
                        {field}
                        <input
                          value={draft.buttons[size][field]}
                          onChange={(e) => setButtonSize(size, field, e.target.value)}
                          className={inputClass}
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          {tab === "radii" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.keys(draft.radii) as (keyof typeof draft.radii)[]).map((key) => (
                <label key={key} className={labelClass}>
                  {key} radius
                  <input
                    value={draft.radii[key]}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        radii: { ...d.radii, [key]: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </label>
              ))}
            </div>
          )}

          {tab === "preview" && (
            <p className="text-sm text-white/60">
              Live preview is on the right. Open{" "}
              <Link href="/myoffice/design/preview" className="text-white underline">
                full preview
              </Link>{" "}
              for print / PDF export.
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10">
          <div className="border-b border-white/10 px-4 py-2 text-xs text-white/50">
            Live preview
          </div>
          <div className="max-h-[720px] overflow-y-auto">
            <DesignSystemPresentation
              system={draft}
              subtitle="Global site design system"
            />
          </div>
        </section>
      </div>

      {status && <p className="text-sm text-white/60">{status}</p>}
    </div>
  );
}

function MetaFields({
  draft,
  setDraft,
}: {
  draft: DesignSystem;
  setDraft: React.Dispatch<React.SetStateAction<DesignSystem>>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        System name
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Version
        <input
          value={draft.version}
          onChange={(e) => setDraft((d) => ({ ...d, version: e.target.value }))}
          className={inputClass}
        />
      </label>
    </div>
  );
}

/** Compact override editor for project CRM */
export function ProjectDesignSystemFields({
  binding,
  globalSystem,
  projectSlug,
  onChange,
  onRestored,
}: {
  binding?: { mode: "inherit" | "custom"; overrides?: DesignSystemPatch };
  globalSystem: DesignSystem;
  projectSlug: string;
  onChange: (binding: { mode: "inherit" | "custom"; overrides?: DesignSystemPatch }) => void;
  onRestored?: () => void;
}) {
  const mode = binding?.mode ?? "inherit";
  const overrides = binding?.overrides;
  const effective = mergeDesignSystem(globalSystem, overrides);

  function setMode(next: "inherit" | "custom") {
    if (next === "inherit") onChange({ mode: "inherit" });
    else onChange({ mode: "custom", overrides: overrides ?? {} });
  }

  function patchColors(key: keyof DesignSystemColors, value: string) {
    onChange({
      mode: "custom",
      overrides: {
        ...overrides,
        colors: { ...(overrides?.colors ?? {}), [key]: value },
      },
    });
  }

  function patchButtonRadius(value: string) {
    onChange({
      mode: "custom",
      overrides: {
        ...overrides,
        buttons: { ...(overrides?.buttons ?? {}), borderRadius: value },
      },
    });
  }

  return (
    <div className="space-y-4 border-t border-white/10 pt-6">
      <h4 className="font-display text-lg">Design system</h4>
      <p className="text-xs text-white/50">
        Inherit the global system or define project-specific colors and button radius.
      </p>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ds-mode"
            checked={mode === "inherit"}
            onChange={() => setMode("inherit")}
          />
          System (site-wide)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ds-mode"
            checked={mode === "custom"}
            onChange={() => setMode("custom")}
          />
          Custom for this project
        </label>
        {mode === "custom" && (
          <button
            type="button"
            onClick={() => setMode("inherit")}
            className="rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/5"
          >
            Reset to system
          </button>
        )}
      </div>
      {mode === "custom" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["gold", "purple", "ink", "text"] as const).map((key) => (
              <label key={key} className={labelClass}>
                {COLOR_TOKEN_LABELS[key]}
                <div className="mt-1 flex gap-2">
                  <input
                    type="color"
                    value={effective.colors[key]}
                    onChange={(e) => patchColors(key, e.target.value)}
                    className="h-9 w-10 rounded border border-white/15"
                  />
                  <input
                    value={effective.colors[key]}
                    onChange={(e) => patchColors(key, e.target.value)}
                    className={inputClass}
                  />
                </div>
              </label>
            ))}
          </div>
          <label className={labelClass}>
            Button radius
            <input
              value={effective.buttons.borderRadius}
              onChange={(e) => patchButtonRadius(e.target.value)}
              className={inputClass}
            />
          </label>
          <Link
            href="/myoffice/design"
            className="inline-block text-xs text-white/50 underline hover:text-white"
          >
            Edit full site system →
          </Link>
        </>
      )}

      <DesignSystemVersionPanel
        scope="project"
        projectSlug={projectSlug}
        onRestored={onRestored}
      />
    </div>
  );
}
