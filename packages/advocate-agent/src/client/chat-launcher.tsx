"use client";

import { useState } from "react";
import type { AdvocateClientConfig } from "../config";
import { AdvocateChat } from "./advocate-chat";

export interface ChatLauncherProps {
  config: AdvocateClientConfig;
}

export function ChatLauncher({ config }: ChatLauncherProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open AI advocate chat"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 py-3 text-sm font-medium text-ink shadow-[0_8px_30px_-6px_rgba(230,194,96,0.6)] transition-transform hover:-translate-y-0.5"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink/50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
        </span>
        {config.launcherLabel ?? "Talk to my advocate"}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 sm:inset-auto sm:bottom-24 sm:right-5">
          {/* Mobile backdrop */}
          <div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 top-0 mx-auto flex h-full w-full flex-col overflow-hidden border border-line bg-ink/95 shadow-2xl backdrop-blur-xl sm:relative sm:h-[640px] sm:max-h-[80vh] sm:w-[420px] sm:rounded-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/70 text-muted hover:text-fg"
            >
              x
            </button>
            <AdvocateChat config={config} />
          </div>
        </div>
      ) : null}
    </>
  );
}
