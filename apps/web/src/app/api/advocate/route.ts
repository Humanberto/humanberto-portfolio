import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type ToolSet,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { buildSystemPrompt } from "@humanberto/advocate-agent/server";
import { getAdvocateConfig } from "@/content/advocate.server";
import { withModelChain } from "@/lib/advocate-model";
import { captureLead } from "@/lib/leads";
import { getSchedulingUrl } from "@/lib/scheduling";

export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  const config = await getAdvocateConfig();

  let messages: UIMessage[];
  try {
    const body = (await req.json()) as { messages: UIMessage[] };
    messages = body.messages ?? [];
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const system = buildSystemPrompt(config);
  const schedulingUrl = getSchedulingUrl() ?? config.facts.contact.schedulingUrl;
  const tools: ToolSet = {};

  if (config.tools.scheduleCall) {
    tools.scheduleCall = tool({
      description:
        "Offer the visitor a way to book a short intro call or interview. Use when they want to talk, meet, or schedule time.",
      inputSchema: z.object({
        reason: z
          .string()
          .optional()
          .describe("Short reason for the call, e.g. 'hiring for data role'."),
      }),
      execute: async ({ reason }) => ({
        schedulingUrl: schedulingUrl ?? null,
        email: config.facts.contact.email,
        reason: reason ?? null,
        message: schedulingUrl
          ? "Share the scheduling link so they can pick a time."
          : "No scheduling link configured; offer email instead.",
      }),
    });
  }

  if (config.tools.captureLead) {
    tools.captureLead = tool({
      description:
        "Save who the visitor is and what they need so the owner can follow up. Call once you learn a name and/or email and their intent.",
      inputSchema: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        organization: z.string().optional(),
        intent: z
          .string()
          .optional()
          .describe("'hiring', 'project', or free text"),
        details: z
          .string()
          .optional()
          .describe("The role, project, or what they're looking for."),
      }),
      execute: async (lead) => {
        try {
          await captureLead(lead);
          return { saved: true };
        } catch {
          return { saved: false };
        }
      },
    });
  }

  return withModelChain(async (model) => {
    const result = streamText({
      model,
      system,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      tools,
      providerOptions: {
        gateway: {
          sort: "cost",
          ...(config.fallbackModels?.length ? { models: config.fallbackModels } : {}),
        },
      },
    });
    return result.toUIMessageStreamResponse();
  });
}
