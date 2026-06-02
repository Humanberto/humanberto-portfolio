import Link from "next/link";
import { DesignSystemPresentation } from "@/components/myoffice/design-system-presentation";
import { DesignSystemPrintButton } from "@/components/myoffice/design-system-print-button";
import { DesignSystemStyles } from "@/components/theme/design-system-styles";
import { getGlobalDesignSystem } from "@/lib/design-system.server";

export default async function DesignSystemPreviewPage() {
  const system = await getGlobalDesignSystem();

  return (
    <>
      <DesignSystemStyles system={system} />
      <div className="min-h-dvh bg-ink print:bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4 print:hidden">
          <Link href="/myoffice/design" className="text-sm text-muted hover:text-fg">
            ← Back to editor
          </Link>
          <DesignSystemPrintButton />
        </div>
        <div className="mx-auto max-w-4xl print:max-w-none">
          <DesignSystemPresentation
            system={system}
            subtitle="Brand guidelines — colors, typography, buttons, and radii for Humanberto."
            className="print:text-black"
          />
        </div>
      </div>
      <style>{`
        @media print {
          @page { margin: 1.2cm; size: A4; }
          body { background: white !important; color: #111 !important; }
          .ds-presentation { background: white !important; color: #111 !important; }
          .ds-presentation .text-muted, .ds-presentation .text-faint { color: #444 !important; }
          .ds-presentation .text-gold { color: #8a6d1a !important; }
          .ds-presentation .border-line { border-color: #ddd !important; }
          .ds-presentation .bg-surface\\/50 { background: #f5f5f5 !important; }
        }
      `}</style>
    </>
  );
}
