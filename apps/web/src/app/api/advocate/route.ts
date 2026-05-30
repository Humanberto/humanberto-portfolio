import { createAdvocateHandler } from "@humanberto/advocate-agent/server";
import { advocateConfig } from "@/content/advocate.server";
import { captureLead } from "@/lib/leads";

export const maxDuration = 30;

export const POST = createAdvocateHandler({
  config: advocateConfig,
  integrations: {
    captureLead,
    schedulingUrl: process.env.NEXT_PUBLIC_CAL_LINK
      ? `https://cal.com/${process.env.NEXT_PUBLIC_CAL_LINK}`
      : advocateConfig.facts.contact.schedulingUrl,
  },
});
