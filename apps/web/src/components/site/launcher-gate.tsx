"use client";

import { usePathname } from "next/navigation";
import { ChatLauncher } from "@humanberto/advocate-agent";
import { advocateClient } from "@/content/advocate.client";

/** Floating advocate launcher everywhere except the dedicated /chat page. */
export function LauncherGate() {
  const pathname = usePathname();
  if (pathname === "/chat") return null;
  return <ChatLauncher config={advocateClient} />;
}
