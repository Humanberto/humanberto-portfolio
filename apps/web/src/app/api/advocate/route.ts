import { createAdvocateHandler } from "@humanberto/advocate-agent/server";
import { advocateConfig } from "@/content/advocate.server";

export const maxDuration = 30;

// Real integrations (lead capture -> Supabase, email -> Resend) are wired in
// the agent-tools phase. The handler works without them.
export const POST = createAdvocateHandler({ config: advocateConfig });
