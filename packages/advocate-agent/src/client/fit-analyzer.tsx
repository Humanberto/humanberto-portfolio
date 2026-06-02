"use client";

import { useRef, useState } from "react";
import type { AdvocateClientConfig, FitAnalysis } from "../config";

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

function scoreColor(score: number): string {
  if (score >= 8) return "#54cbb8"; // emerald
  if (score >= 6) return "#e6c260"; // gold-bright
  if (score >= 4) return "#d99a3c"; // amber
  return "#ef88b3"; // rose
}

export interface FitAnalyzerProps {
  config: AdvocateClientConfig;
  className?: string;
}

export function FitAnalyzer({ config, className }: FitAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FitAnalysis | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const analyzePath = config.analyzePath ?? "/api/advocate/analyze";
  const canSubmit =
    !busy &&
    (!!file || /^https?:\/\/.+/i.test(url.trim()) || text.trim().length >= 30);

  function pickFile(f: File | null) {
    setError(null);
    setFile(f);
  }

  async function analyze() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      if (file) form.append("file", file);
      if (url.trim()) form.append("url", url.trim());
      if (text.trim()) form.append("text", text.trim());
      const res = await fetch(analyzePath, { method: "POST", body: form });
      const data = (await res.json()) as {
        analysis?: FitAnalysis;
        error?: string;
      };
      if (!res.ok || !data.analysis) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data.analysis);
    } catch {
      setError("Couldn't reach the analyzer. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setFile(null);
    setUrl("");
    setText("");
  }

  if (result) {
    return (
      <div className={cx("text-sm", className)}>
        <ResultView
          result={result}
          schedulingUrl={config.schedulingUrl}
          onReset={reset}
        />
      </div>
    );
  }

  return (
    <div className={cx("text-sm", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) pickFile(f);
        }}
        className={cx(
          "rounded-2xl border border-dashed p-5 text-center transition-colors",
          dragging ? "border-gold/70 bg-gold/5" : "border-line bg-surface/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,application/pdf,text/plain"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-fg">
            <span className="truncate font-medium">{file.name}</span>
            <button
              type="button"
              onClick={() => pickFile(null)}
              className="text-faint hover:text-fg"
              aria-label="Remove file"
            >
              &times;
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-muted"
          >
            <span className="font-medium text-gold-bright">
              Upload a PDF or .txt
            </span>{" "}
            (job description, project scope) - or drag it here
          </button>
        )}
      </div>

      <div className="my-3 text-center text-xs uppercase tracking-widest text-faint">
        or paste a link
      </div>

      <input
        type="url"
        inputMode="url"
        value={url}
        onChange={(e) => {
          setError(null);
          setUrl(e.target.value);
        }}
        placeholder="https://company.com/careers/the-role"
        className="w-full rounded-2xl border border-line bg-surface/40 px-3 py-2.5 text-fg outline-none placeholder:text-faint focus:border-gold/50"
      />

      <div className="my-3 text-center text-xs uppercase tracking-widest text-faint">
        or paste the text
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setError(null);
          setText(e.target.value);
        }}
        rows={4}
        placeholder="Paste the job description or project scope here..."
        className="w-full resize-y rounded-2xl border border-line bg-surface/40 p-3 text-fg outline-none placeholder:text-faint focus:border-gold/50"
      />

      {error ? (
        <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-200">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={analyze}
        disabled={!canSubmit}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 py-3 font-medium text-ink transition-opacity disabled:opacity-40"
      >
        {busy ? "Analyzing against my background..." : "Score my fit"}
      </button>
      <p className="mt-2 text-center text-xs text-faint">
        Honest by design - the score reflects real evidence, gaps included.
        Nothing you upload is stored.
      </p>
    </div>
  );
}

function ResultView({
  result,
  schedulingUrl,
  onReset,
}: {
  result: FitAnalysis;
  schedulingUrl?: string;
  onReset: () => void;
}) {
  const color = scoreColor(result.score);
  const pct = Math.max(0, Math.min(10, result.score)) / 10;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div
          className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(${color} ${pct * 360}deg, rgba(255,255,255,0.07) 0deg)`,
          }}
        >
          <div className="flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full bg-ink">
            <span className="font-display text-2xl leading-none text-fg">
              {result.score.toFixed(1)}
            </span>
            <span className="text-[0.6rem] text-faint">/ 10</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg leading-snug text-fg">
            {result.verdict}
          </p>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-faint">
            {result.documentKind}
            {result.roleTitle ? ` - ${result.roleTitle}` : ""}
          </p>
        </div>
      </div>

      <p className="leading-relaxed text-muted">{result.summary}</p>

      {result.strengths.length > 0 && (
        <Section title="Where Roberto fits" dot="#54cbb8">
          {result.strengths.map((s, i) => (
            <Item key={i} head={s.requirement} body={s.evidence} />
          ))}
        </Section>
      )}

      {result.transferable.length > 0 && (
        <Section title="Transferable / adjacent" dot="#e6c260">
          {result.transferable.map((s, i) => (
            <Item key={i} head={s.requirement} body={s.evidence} />
          ))}
        </Section>
      )}

      {result.gaps.length > 0 && (
        <Section title="Honest gaps" dot="#ef88b3">
          {result.gaps.map((g, i) => (
            <Item key={i} head={g.requirement} body={g.note} />
          ))}
        </Section>
      )}

      <div className="rounded-2xl border border-gold/25 bg-gold/5 p-4">
        <p className="leading-relaxed text-fg">{result.recommendation}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="#advocate-chat"
            className="rounded-full border border-line bg-surface/60 px-4 py-2 text-sm text-fg hover:border-gold/50"
          >
            Talk it through
          </a>
          {schedulingUrl ? (
            <a
              href={schedulingUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 py-2 text-sm font-medium text-ink"
            >
              Book an intro call -&gt;
            </a>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-sm text-faint underline-offset-4 hover:text-fg hover:underline"
      >
        Analyze another
      </button>
    </div>
  );
}

function Section({
  title,
  dot,
  children,
}: {
  title: string;
  dot: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: dot }}
        />
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted">
          {title}
        </h4>
      </div>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function Item({ head, body }: { head: string; body: string }) {
  return (
    <li className="rounded-xl border border-line bg-surface/40 px-3 py-2">
      <p className="font-medium text-fg">{head}</p>
      <p className="mt-0.5 text-muted">{body}</p>
    </li>
  );
}
