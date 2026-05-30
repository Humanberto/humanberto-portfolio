import { cn } from "@humanberto/ui";
import type { ProjectStatus } from "@/content/projects";

const LABELS: Record<ProjectStatus, string> = {
  live: "Live",
  "in-progress": "Building now",
  prototype: "Prototype",
  "case-study": "Case study",
};

export function StatusPill({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const live = status === "live";
  const building = status === "in-progress";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.12em]",
        live && "border-gold/40 bg-gold/10 text-gold-bright",
        building && "border-purple/50 bg-purple/15 text-purple-soft",
        !live && !building && "border-line bg-white/5 text-muted",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          live && "bg-gold-bright",
          building && "animate-pulse bg-purple-soft",
          !live && !building && "bg-faint",
        )}
      />
      {LABELS[status]}
    </span>
  );
}
