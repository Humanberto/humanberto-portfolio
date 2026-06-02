import { LlmManager } from "@/components/myoffice/llm-manager";

export default function MyOfficeLlmPage() {
  return (
    <div>
      <h2 className="font-display text-2xl">LLM keys</h2>
      <p className="mt-2 text-sm text-white/60">
        Keys never leave the server. They are AES-256 encrypted before storage. The public site
        has no link to this page.
      </p>
      <div className="mt-8">
        <LlmManager />
      </div>
    </div>
  );
}
