import type { AdvocateClientConfig } from "@humanberto/advocate-agent";
import { getSchedulingUrl } from "@/lib/scheduling";
import { fitCheckHref, site } from "@/lib/site";

/** Client-safe advocate config (no system prompt or private instructions). */
export const advocateClient: AdvocateClientConfig = {
  apiPath: "/api/advocate",
  emailPath: "/api/advocate/email",
  analyzePath: "/api/advocate/analyze",
  ownerName: site.name,
  ownerPhoto: site.photo,
  persona: `${site.name}'s AI advocate`,
  launcherLabel: "Talk to my advocate",
  schedulingUrl: getSchedulingUrl(),
  suggestedPrompts: [
    "I'm hiring for a data / Python role",
    "I have a project (around $5k) in mind",
    "Why product design AND code?",
    "Tell me about VZTR Help",
  ],
  fitCheckHref,
  tools: {
    exportPdf: true,
    emailTranscript: true,
    scheduleCall: true,
    captureLead: true,
  },
  capabilities: {
    voice: false,
  },
};
