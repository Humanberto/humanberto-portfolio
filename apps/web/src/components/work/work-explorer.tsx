"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, SectionHeading } from "@humanberto/ui";
import { ProjectCard } from "@/components/work/project-card";
import { PILLARS, type Pillar, type Project } from "@/content/projects";
import { PILLAR_COLORS, hexToRgba } from "@/lib/pillars";
import { fitCheckHref } from "@/lib/site";

function overlapCount(project: Project, selected: Pillar[]) {
  return project.pillars.filter((p) => selected.includes(p)).length;
}

export function WorkExplorer({
  projects,
  projectHref,
  fitCheckHref: fitHref,
}: {
  projects: Project[];
  projectHref?: (slug: string) => string;
  fitCheckHref?: string;
}) {
  const [selected, setSelected] = useState<Pillar[]>([]);

  const counts = useMemo(() => {
    const map = Object.fromEntries(PILLARS.map((p) => [p.name, 0])) as Record<
      Pillar,
      number
    >;
    for (const proj of projects)
      for (const pillar of proj.pillars) map[pillar] += 1;
    return map;
  }, [projects]);

  const toggle = (p: Pillar) =>
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));

  const filtered = useMemo(() => {
    const byRecency = (a: Project, b: Project) =>
      Number(b.featured ?? false) - Number(a.featured ?? false) ||
      b.year.localeCompare(a.year);
    if (selected.length === 0) return [...projects].sort(byRecency);
    return [...projects]
      .filter((p) => overlapCount(p, selected) > 0)
      .sort(
        (a, b) =>
          overlapCount(b, selected) - overlapCount(a, selected) ||
          byRecency(a, b),
      );
  }, [projects, selected]);

  const coveredCount = selected.filter((p) => counts[p] > 0).length;
  const allCovered = selected.length > 0 && coveredCount === selected.length;
  const topProject =
    selected.length > 1
      ? filtered.find((p) => overlapCount(p, selected) > 1)
      : undefined;
  const topOverlap = topProject ? overlapCount(topProject, selected) : 0;

  return (
    <>
      <SectionHeading
        eyebrow="Portfolio"
        title="Find your fit"
        lead="Pick the crafts your role or project needs. Each project appears once, tagged with the skills it actually demonstrates - no padding, no repeats."
      />

      <div
        className="mt-10 flex flex-wrap gap-2.5"
        role="group"
        aria-label="Filter projects by craft"
      >
        {PILLARS.map((p) => {
          const color = PILLAR_COLORS[p.name];
          const active = selected.includes(p.name);
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => toggle(p.name)}
              aria-pressed={active}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all hover:-translate-y-px"
              style={{
                color: active ? color : undefined,
                borderColor: hexToRgba(color, active ? 0.75 : 0.24),
                backgroundColor: hexToRgba(color, active ? 0.16 : 0.04),
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className={active ? "font-medium" : "text-muted"}>
                {p.name}
              </span>
              <span className="text-xs text-faint">{counts[p.name]}</span>
            </button>
          );
        })}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="rounded-full px-3 py-2 text-sm text-faint transition-colors hover:text-fg"
          >
            Clear
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-6 rounded-xl border border-line bg-surface/40 p-4 text-sm leading-relaxed">
          {allCovered ? (
            <p className="text-fg">
              <span className="font-medium text-gold-bright">
                Checks all {selected.length}{" "}
                {selected.length === 1 ? "box" : "boxes"}.
              </span>{" "}
              Roberto has shipped real work in{" "}
              {selected.length === 1
                ? "this craft"
                : "every craft you selected"}
              {" - "}
              {filtered.length}{" "}
              {filtered.length === 1 ? "project" : "projects"} below.
              {topProject && (
                <>
                  {" "}
                  <span className="text-fg">{topProject.title}</span> alone
                  spans {topOverlap} of them.
                </>
              )}
            </p>
          ) : (
            <p className="text-fg">
              Covers{" "}
              <span className="font-medium text-gold-bright">
                {coveredCount} of {selected.length}
              </span>{" "}
              selected crafts - {filtered.length}{" "}
              {filtered.length === 1 ? "project" : "projects"} below.
            </p>
          )}
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            selected={selected}
            href={projectHref?.(project.slug)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-muted">
          No projects match that exact combination yet.
        </p>
      )}

      {fitHref ? (
      <div className="mt-14 rounded-2xl border border-gold/25 bg-gold/5 p-6 text-center sm:p-8">
        <p className="font-display text-xl font-light text-fg">
          Have a specific role or project in mind?
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          Upload the job description or scope and get an honest 0–10 fit score
          — strengths, transferable skills, and gaps included.
        </p>
        <Link href={fitHref} className="mt-5 inline-block">
          <Button>Score my fit</Button>
        </Link>
      </div>
      ) : null}
    </>
  );
}
