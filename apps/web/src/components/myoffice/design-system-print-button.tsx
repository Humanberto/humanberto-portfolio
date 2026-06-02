"use client";

export function DesignSystemPrintButton({ label = "Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white/5 print:hidden"
    >
      {label}
    </button>
  );
}
