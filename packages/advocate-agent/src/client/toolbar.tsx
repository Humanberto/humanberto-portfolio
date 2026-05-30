"use client";

import { useState } from "react";
import type { UIMessage } from "ai";
import type { AdvocateClientConfig } from "../config";
import { buildTranscript } from "./transcript";
import { exportTranscriptPdf } from "./pdf";

export interface AdvocateToolbarProps {
  config: AdvocateClientConfig;
  messages: UIMessage[];
}

type EmailStatus = "idle" | "sending" | "sent" | "error";

export function AdvocateToolbar({ config, messages }: AdvocateToolbarProps) {
  const [emailing, setEmailing] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<EmailStatus>("idle");

  const hasConversation = messages.some((m) =>
    m.parts.some((p) => p.type === "text" && (p as { text: string }).text),
  );
  const showPdf = config.tools.exportPdf && hasConversation;
  const showEmail = config.tools.emailTranscript && hasConversation;

  async function handlePdf() {
    const markdown = buildTranscript(messages, { ownerName: config.ownerName });
    await exportTranscriptPdf({
      markdown,
      filename: `${config.ownerName.split(" ")[0]}-advocate-chat.pdf`,
    });
  }

  async function handleEmail() {
    if (!email.trim() || !config.emailPath) return;
    setStatus("sending");
    try {
      const res = await fetch(config.emailPath, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          to: email.trim(),
          transcriptMarkdown: buildTranscript(messages, {
            ownerName: config.ownerName,
          }),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (res.ok && data.ok !== false) {
        setStatus("sent");
        setTimeout(() => {
          setEmailing(false);
          setStatus("idle");
          setEmail("");
        }, 1800);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative flex items-center justify-between gap-3 border-b border-line bg-ink/70 px-4 py-3 sm:px-6">
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

      <div className="flex items-center gap-2">
        {showPdf ? (
          <button
            type="button"
            onClick={handlePdf}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-gold/40 hover:text-fg"
          >
            Save PDF
          </button>
        ) : null}
        {showEmail ? (
          <button
            type="button"
            onClick={() => setEmailing((v) => !v)}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-gold/40 hover:text-fg"
          >
            Email
          </button>
        ) : null}
      </div>

      {emailing ? (
        <div className="absolute right-4 top-full z-20 mt-2 w-72 rounded-xl border border-line bg-surface p-3 shadow-2xl">
          {status === "sent" ? (
            <p className="px-1 py-2 text-sm text-gold-bright">
              Sent. Check your inbox.
            </p>
          ) : (
            <>
              <label className="text-xs text-faint">
                Email this conversation to:
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="min-w-0 flex-1 rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-gold/50"
                />
                <button
                  type="button"
                  onClick={handleEmail}
                  disabled={status === "sending" || !email.trim()}
                  className="rounded-lg bg-gradient-to-b from-gold-bright to-gold px-3 text-sm font-medium text-ink disabled:opacity-40"
                >
                  {status === "sending" ? "..." : "Send"}
                </button>
              </div>
              {status === "error" ? (
                <p className="mt-2 text-xs text-red-300">
                  Couldn&apos;t send right now. Try the Save PDF option.
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
