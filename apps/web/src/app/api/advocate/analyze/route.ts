import { createFitAnalyzerHandler } from "@humanberto/advocate-agent/server";
import { advocateConfig } from "@/content/advocate.server";

export const runtime = "nodejs";
export const maxDuration = 60;

export const POST = createFitAnalyzerHandler({ config: advocateConfig });
