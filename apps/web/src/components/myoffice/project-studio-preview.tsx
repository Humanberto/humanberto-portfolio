"use client";

import { DesignSystemPresentation } from "@/components/myoffice/design-system-presentation";
import { ProjectCoverImage } from "@/components/work/project-image-lightbox";
import type { AdminProject } from "@/lib/projects.shared";
import type { DesignSystem } from "@humanberto/ui";

export function ProjectStudioPreview({
  project,
  designSystem,
  compact = false,
}: {
  project: AdminProject;
  designSystem: DesignSystem;
  compact?: boolean;
}) {
  const useCustomTheme = project.designSystem?.mode === "custom";

  if (compact) {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-xs uppercase tracking-widest text-gold">{project.status}</p>
        <p className="font-display text-base leading-snug">{project.title || "Untitled"}</p>
        {project.tagline && <p className="text-white/60">{project.tagline}</p>}
        {project.summary && (
          <p className="line-clamp-3 text-xs text-white/50">{project.summary}</p>
        )}
        {useCustomTheme && (
          <p className="text-xs text-purple-soft">Custom design system active</p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink">
      <div className="border-b border-line px-6 py-8">
        <p className="text-xs uppercase tracking-widest text-gold">{project.status}</p>
        <h2 className="mt-2 font-display text-2xl font-light">{project.title}</h2>
        <p className="mt-2 text-muted">{project.tagline}</p>
        {project.role && <p className="mt-2 text-xs text-faint">{project.role}</p>}
      </div>

      {project.coverImage && (
        <div className="border-b border-line">
          <ProjectCoverImage src={project.coverImage} alt={project.title} className="rounded-none border-0" />
        </div>
      )}

      <div className="space-y-6 px-6 py-6 text-sm">
        {project.summary && (
          <section>
            <h3 className="text-xs uppercase tracking-widest text-gold">Overview</h3>
            <p className="mt-2 text-muted">{project.summary}</p>
          </section>
        )}
        {project.problem && (
          <section>
            <h3 className="text-xs uppercase tracking-widest text-gold">Problem</h3>
            <p className="mt-2 text-muted">{project.problem}</p>
          </section>
        )}
        {project.approach.length > 0 && (
          <section>
            <h3 className="text-xs uppercase tracking-widest text-gold">Approach</h3>
            <ul className="mt-2 space-y-1 text-muted">
              {project.approach.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {project.outcomes.length > 0 && (
          <section>
            <h3 className="text-xs uppercase tracking-widest text-gold">Outcomes</h3>
            <ul className="mt-2 space-y-1 text-muted">
              {project.outcomes.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {useCustomTheme && (
        <DesignSystemPresentation
          system={designSystem}
          title="Project design system"
          subtitle="Per-project overrides"
          className="border-t border-line"
        />
      )}
    </div>
  );
}
