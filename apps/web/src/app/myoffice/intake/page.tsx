import { MyOfficeIntakePanel } from "@/components/myoffice/intake-panel";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { redirect } from "next/navigation";

export default async function MyOfficeIntakePage() {
  const ctx = await resolveOfficeContext();
  if (!ctx) redirect("/myoffice/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Intake uploads</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Add or replace resume, portfolio, project, and inspiration files anytime. Re-run the
          design agent after uploading to refresh your site from the latest materials.
        </p>
      </div>

      <MyOfficeIntakePanel />
    </div>
  );
}
