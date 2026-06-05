import { VisibilityEditor } from "@/components/myoffice/visibility-editor";
import { resolveOfficeContext } from "@/lib/tenant/office-context";
import { redirect } from "next/navigation";

export default async function MyOfficeVisibilityPage() {
  const ctx = await resolveOfficeContext();
  if (!ctx) redirect("/myoffice/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Site visibility</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Show or hide navigation items, buttons, text blocks, and entire pages on your live
          website — without deleting content from My Office.
        </p>
      </div>
      <VisibilityEditor />
    </div>
  );
}
