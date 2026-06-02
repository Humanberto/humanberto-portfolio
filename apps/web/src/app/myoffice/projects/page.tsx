import { ProjectCrm } from "@/components/myoffice/project-crm";

export default function MyOfficeProjectsPage() {
  return (
    <div>
      <h2 className="font-display text-2xl">Projects</h2>
      <p className="mt-2 text-sm text-white/60">
        Show, hide, edit, and reorder portfolio work. Changes appear on the live site
        immediately — no redeploy needed.
      </p>
      <div className="mt-8">
        <ProjectCrm />
      </div>
    </div>
  );
}
