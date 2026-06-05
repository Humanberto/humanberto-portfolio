"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@humanberto/ui";
import { tenantPagePath } from "@/lib/tenant/public-site";

const STEPS = [
  {
    title: "Your portfolio is live",
    body: "Visitors see this site at your public URL. Share it when you're ready.",
  },
  {
    title: "Customize design & copy",
    body: "Open My Office → Studio to refine colors, typography, and site text with the design agent.",
    href: "/myoffice/studio",
    cta: "Open Studio",
  },
  {
    title: "Edit your projects",
    body: "Replace the starter case studies with your real work in My Office → Projects.",
    href: "/myoffice/projects",
    cta: "Manage projects",
  },
  {
    title: "Publish when ready",
    body: "Toggle Published on each project when you're happy with it. Unpublished work stays hidden.",
  },
] as const;

type Props = {
  tenantSlug: string;
  tenantId: string;
  show: boolean;
};

export function BuildGuide({ tenantSlug, tenantId, show }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const storageKey = `hb-build-guide-${tenantId}`;

  useEffect(() => {
    if (!show) return;
    try {
      if (localStorage.getItem(storageKey) === "dismissed") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, [show, storageKey]);

  function dismiss() {
    try {
      localStorage.setItem(storageKey, "dismissed");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step]!;
  const isLast = step >= STEPS.length - 1;

  return (
    <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-line/60 bg-ink/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-gold">
            Quick start {step + 1}/{STEPS.length}
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="text-xs text-faint hover:text-muted"
          >
            Skip
          </button>
        </div>
        <h2 className="mt-2 font-display text-lg font-light">{current.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{current.body}</p>
        {"href" in current && current.href ? (
          <Link href={current.href} className="mt-3 inline-block">
            <Button size="sm" variant="outline">
              {current.cta}
            </Button>
          </Link>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            href={tenantPagePath(tenantSlug, "/")}
            className="text-xs text-faint hover:text-muted"
            onClick={dismiss}
          >
            View public site
          </Link>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button size="sm" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            ) : null}
            <Button
              size="sm"
              onClick={() => {
                if (isLast) dismiss();
                else setStep((s) => s + 1);
              }}
            >
              {isLast ? "Got it" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
