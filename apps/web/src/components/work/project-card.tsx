import Link from "next/link";
import { Card, cn } from "@humanberto/ui";
import type { Pillar, Project } from "@/content/projects";
import { PILLAR_COLORS, hexToRgba } from "@/lib/pillars";
import { StatusPill } from "./status-pill";

export function ProjectCard({
  project,
  selected = [],
  href,
}: {
  project: Project;
  selected?: Pillar[];
  /** Override link target (tenant sites use /s/{slug}/work/...) */
  href?: string;
}) {
  const accentGlow =
    project.accent === "purple"
      ? "from-purple/25"
      : "from-gold/20";

  return (
    <Link href={href ?? `/work/${project.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col p-6 transition-transform duration-300 group-hover:-translate-y-1">
        <div
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
            accentGlow,
          )}
        />
        {project.coverImage && (
          <div className="-mx-2 -mt-2 mb-4 overflow-hidden rounded-xl border border-line/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverImage}
              alt=""
              className="aspect-[16/10] w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <StatusPill status={project.status} />
          <span className="text-xs text-faint">{project.year}</span>
        </div>

        <h3 className="mt-5 font-display text-2xl font-light tracking-tight">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-muted">{project.tagline}</p>

        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted/80">
          {project.summary}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {project.pillars.map((p) => {
            const color = PILLAR_COLORS[p];
            const active = selected.includes(p);
            return (
              <span
                key={p}
                className="rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors"
                style={{
                  color,
                  borderColor: hexToRgba(color, active ? 0.7 : 0.26),
                  backgroundColor: hexToRgba(color, active ? 0.18 : 0.07),
                  opacity: selected.length > 0 && !active ? 0.55 : 1,
                }}
              >
                {p}
              </span>
            );
          })}
        </div>

        <span className="mt-5 inline-flex items-center gap-1 text-sm text-gold-bright">
          View case study
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            -&gt;
          </span>
        </span>
      </Card>
    </Link>
  );
}
