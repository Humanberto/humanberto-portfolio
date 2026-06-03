import { ProjectCrm } from "@/components/myoffice/project-crm";

export default function MyOfficeProjectsPage() {
  return (
    <div>
      <h2 className="font-display text-2xl">Projects</h2>
      <p className="mt-2 text-sm text-white/60">
        Show, hide, edit, and reorder portfolio work. Each project has its own Studio agent
        on the right — chat while case study copy and design update live.
      </p>
      <div className="mt-8">
        <ProjectCrm />
      </div>
    </div>
  );
}
