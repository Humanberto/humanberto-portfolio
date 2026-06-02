"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AdvocateClientConfig } from "../config";
import { AdvocateToolbar } from "./toolbar";

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export interface AdvocateChatProps {
  config: AdvocateClientConfig;
  className?: string;
}

export function AdvocateChat({ config, className }: AdvocateChatProps) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: config.apiPath }),
    [config.apiPath],
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  function submit(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    sendMessage({ text: value });
    setInput("");
  }

  const empty = messages.length === 0;

  return (
    <div className={cx("flex h-full flex-col", className)}>
      <AdvocateToolbar config={config} messages={messages} />

      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6"
      >
        {empty ? (
          <EmptyState config={config} onPick={submit} />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} role={message.role}>
              {message.parts.map((part, i) => (
                <MessagePart
                  key={`${message.id}-${i}`}
                  part={part}
                  schedulingUrl={config.schedulingUrl}
                  ownerEmail={undefined}
                />
              ))}
            </MessageBubble>
          ))
        )}

        {busy ? <TypingDots /> : null}

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Something interrupted the connection. Please try again - or email{" "}
            <span className="font-medium">directly</span> if it persists.
          </div>
        ) : null}
      </div>

      <Composer
        value={input}
        onChange={setInput}
        onSubmit={() => submit(input)}
        busy={busy}
        voice={config.capabilities.voice}
      />
    </div>
  );
}

function EmptyState({
  config,
  onPick,
}: {
  config: AdvocateClientConfig;
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="rounded-2xl border border-line bg-surface/70 px-5 py-4 text-sm leading-relaxed text-fg">
        Hi - I&apos;m {config.ownerName.split(" ")[0]}&apos;s AI advocate. Tell me
        about the role you&apos;re hiring for or the project you have in mind, and
        I&apos;ll give you a straight, honest read on the fit. I can also book an
        intro call.
      </div>
      <div className="flex flex-wrap gap-2">
        {config.suggestedPrompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            className="rounded-full border border-gold/30 bg-gold/5 px-3.5 py-2 text-left text-sm text-gold-bright transition-colors hover:bg-gold/15"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={cx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-purple/25 text-fg"
            : "border border-line bg-surface/70 text-fg/90",
        )}
      >
        {children}
      </div>
    </div>
  );
}

type AnyPart = { type: string; text?: string; state?: string; output?: unknown };

function MessagePart({
  part,
  schedulingUrl,
}: {
  part: AnyPart;
  schedulingUrl?: string;
  ownerEmail?: string;
}) {
  if (part.type === "text") {
    return <p className="whitespace-pre-wrap">{part.text}</p>;
  }

  if (part.type === "tool-scheduleCall" && part.state === "output-available") {
    const output = (part.output ?? {}) as {
      schedulingUrl?: string | null;
      email?: string | null;
    };
    const url = output.schedulingUrl ?? schedulingUrl;
    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 py-2 text-sm font-medium text-ink"
        >
          Book an intro call -&gt;
        </a>
      );
    }
    if (output.email) {
      return (
        <a
          href={`mailto:${output.email}?subject=Intro%20call%20request`}
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-sm text-fg"
        >
          Email to schedule -&gt;
        </a>
      );
    }
    return null;
  }

  // captureLead and other tool parts render silently.
  return null;
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1 rounded-2xl border border-line bg-surface/70 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-bright"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSubmit,
  busy,
  voice,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
  voice: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="border-t border-line bg-ink/60 p-3 sm:p-4"
    >
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface/60 px-3 py-2 focus-within:border-gold/50">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          rows={1}
          placeholder="Ask about a role, a project, or my experience..."
          className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm text-fg outline-none placeholder:text-faint"
        />
        {voice ? (
          <button
            type="button"
            title="Voice (coming soon)"
            disabled
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-faint opacity-50"
            aria-label="Voice input (coming soon)"
          >
            mic
          </button>
        ) : null}
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="flex h-9 items-center rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 text-sm font-medium text-ink disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </form>
  );
}
