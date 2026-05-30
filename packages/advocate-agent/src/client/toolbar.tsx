"use client";

import type { AdvocateClientConfig } from "../config";
import type { UIMessage } from "ai";

export interface AdvocateToolbarProps {
  config: AdvocateClientConfig;
  messages: UIMessage[];
}

export function AdvocateToolbar({ config }: AdvocateToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line bg-ink/70 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-bright opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-medium text-fg">
            {config.ownerName.split(" ")[0]}&apos;s AI Advocate
          </p>
          <p className="text-[0.7rem] text-faint">Honest by design</p>
        </div>
      </div>
      {/* Transcript actions (PDF / email) are added in the agent-tools phase. */}
      <div id="advocate-toolbar-actions" className="flex items-center gap-2" />
    </div>
  );
}
