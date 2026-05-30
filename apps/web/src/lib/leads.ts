import "server-only";
import type { CapturedLead } from "@humanberto/advocate-agent";
import { site } from "@/lib/site";

/**
 * Persist a captured lead. Uses Supabase when configured; otherwise logs so the
 * agent still works in any environment. Also notifies the owner by email when
 * Resend is configured.
 */
export async function captureLead(lead: CapturedLead): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, key, {
        auth: { persistSession: false },
      });
      await supabase.from("advocate_leads").insert({
        name: lead.name ?? null,
        email: lead.email ?? null,
        organization: lead.organization ?? null,
        intent: lead.intent ?? null,
        details: lead.details ?? null,
      });
    } catch (err) {
      console.error("[advocate] lead persist failed", err);
    }
  } else {
    console.info("[advocate] lead captured (no DB configured):", lead);
  }

  await notifyOwner(lead);
}

async function notifyOwner(lead: CapturedLead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const notify = process.env.ADVOCATE_NOTIFY_EMAIL ?? site.email;
  if (!apiKey) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from = process.env.ADVOCATE_FROM_EMAIL ?? "advocate@humanberto.com";
    await resend.emails.send({
      from: `${site.shortName} Advocate <${from}>`,
      to: notify,
      subject: `New lead from your AI advocate${lead.name ? ` - ${lead.name}` : ""}`,
      text: [
        `Name: ${lead.name ?? "-"}`,
        `Email: ${lead.email ?? "-"}`,
        `Organization: ${lead.organization ?? "-"}`,
        `Intent: ${lead.intent ?? "-"}`,
        `Details: ${lead.details ?? "-"}`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("[advocate] owner notify failed", err);
  }
}
