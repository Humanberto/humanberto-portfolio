"use client";

import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import { Button } from "@humanberto/ui";
import { site } from "@/lib/site";

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK;

type CalProps = {
  calLink: string;
  style?: CSSProperties;
  config?: Record<string, string>;
};

/**
 * Inline Cal.com booking. Renders the real embed once NEXT_PUBLIC_CAL_LINK is
 * set (e.g. "humanberto/intro"); until then it shows a graceful fallback so the
 * deployed site never displays a broken iframe.
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
        Live scheduling is wired up and turns on the moment the calendar is
        connected. In the meantime, email is the fastest path - I reply quickly.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href={`mailto:${site.email}`}>
          <Button>Email me</Button>
        </a>
        <a href={site.schedulingUrl} target="_blank" rel="noreferrer">
          <Button variant="outline">Open scheduling</Button>
        </a>
      </div>
    </div>
  );
}
