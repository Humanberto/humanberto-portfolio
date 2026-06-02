import { ContentEditor } from "@/components/myoffice/content-editor";

export default function MyOfficeContentPage() {
  return (
    <div>
      <h2 className="font-display text-2xl">Content</h2>
      <p className="mt-2 text-sm text-white/60">
        Changes save to Supabase and override the defaults in code on the live site.
      </p>
      <div className="mt-8">
        <ContentEditor />
      </div>
    </div>
  );
}
