"use client";

import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import { Button } from "@humanberto/ui";
import { getCalEmbedLink, getSchedulingUrl } from "@/lib/scheduling";
import { site } from "@/lib/site";

const CAL_LINK = getCalEmbedLink();
const SCHEDULING_URL = getSchedulingUrl();

type CalProps = {
  calLink: string;
  style?: CSSProperties;
  config?: Record<string, string>;
};

/**
 * Inline Cal.com booking. Renders the embed when NEXT_PUBLIC_CAL_LINK is set;
 * otherwise shows email/contact fallback (never a broken scheduling link).
 */
export function CalBooking() {
  const [Cal, setCal] = useState<ComponentType<CalProps> | null>(null);

  useEffect(() => {
    if (!CAL_LINK) return;
    let active = true;
    (async () => {
      const mod = await import("@calcom/embed-react");
      const cal = await mod.getCalApi();
      cal("ui", {
        theme: "dark",
        hideEventTypeDetails: false,
        layout: "month_view",
      });
      if (active) setCal(() => mod.default as unknown as ComponentType<CalProps>);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (CAL_LINK && Cal) {
    return (
      <div className="min-h-[640px] overflow-hidden rounded-2xl border border-line bg-surface/50">
        <Cal
          calLink={CAL_LINK}
          style={{ width: "100%", height: "100%", overflow: "scroll" }}
          config={{ layout: "month_view", theme: "dark" }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-line bg-surface/50 p-10 text-center">
      <h3 className="font-display text-2xl font-light">Book a 20-minute intro</h3>
      <p className="mt-3 max-w-sm text-sm text-muted">
        {SCHEDULING_URL
          ? "Loading the calendar…"
          : "Email is the fastest way to grab time on my calendar while live scheduling is being connected."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href={`mailto:${site.email}?subject=Intro%20call%20request`}>
          <Button>Email me to schedule</Button>
        </a>
        {SCHEDULING_URL ? (
          <a href={SCHEDULING_URL} target="_blank" rel="noreferrer">
            <Button variant="outline">Open Cal.com</Button>
          </a>
        ) : null}
      </div>
    </div>
  );
}
