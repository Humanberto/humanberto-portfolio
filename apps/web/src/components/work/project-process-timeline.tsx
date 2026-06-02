import type { ProjectProcess } from "@/content/projects";

export function ProjectProcessTimeline({ processes }: { processes: ProjectProcess[] }) {
  if (!processes.length) return null;

  return (
    <section className="space-y-12">
      {processes.map((proc) => (
        <div key={proc.id}>
          <h2 className="font-display text-sm font-medium uppercase tracking-[0.2em] text-gold">
            {proc.title}
          </h2>
          {proc.summary && (
            <p className="mt-3 text-base leading-relaxed text-muted">{proc.summary}</p>
          )}
          {proc.steps.length > 0 && (
            <ol className="mt-6 space-y-8 border-l border-line pl-6">
              {proc.steps.map((step, i) => (
                <li key={step.id} className="relative">
                  <span className="absolute -left-[calc(1.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-gold bg-bg" />
                  <span className="text-xs font-medium uppercase tracking-wider text-faint">
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                  {step.title && (
                    <h3 className="mt-1 font-display text-xl font-light">{step.title}</h3>
                  )}
                  {step.detail && (
                    <p className="mt-2 text-base leading-relaxed text-muted">{step.detail}</p>
                  )}
                  {step.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={step.imageUrl}
                      alt=""
                      className="mt-4 max-h-80 w-full rounded-xl border border-line object-cover"
                      loading="lazy"
                    />
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      ))}
    </section>
  );
}
