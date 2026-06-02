import { createAdvocateHandler } from "@humanberto/advocate-agent/server";
import { advocateConfig } from "@/content/advocate.server";
import { captureLead } from "@/lib/leads";
import { getSchedulingUrl } from "@/lib/scheduling";

export const maxDuration = 30;

export const POST = createAdvocateHandler({
  config: advocateConfig,
  integrations: {
    captureLead,
    schedulingUrl: getSchedulingUrl(),
  },
});
