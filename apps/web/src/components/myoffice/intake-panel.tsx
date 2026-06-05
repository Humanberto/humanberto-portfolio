"use client";

import { useRouter } from "next/navigation";
import { IntakeUploadPanel } from "@/components/platform/intake-upload-panel";

export function MyOfficeIntakePanel() {
  const router = useRouter();

  return (
    <IntakeUploadPanel
      apiBase="/api/myoffice/intake"
      buildLabel="Rebuild site from uploads"
      skipLabel="Rebuild from answers only"
      onBuilt={() => {
        router.refresh();
      }}
    />
  );
}
