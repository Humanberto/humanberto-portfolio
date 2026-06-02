import "server-only";
import type { AdvocateConfig } from "@humanberto/advocate-agent";
import { getContentOverride } from "@/lib/admin/content";
import { resolveModelChain } from "@/lib/admin/llm-providers";
import { getSchedulingUrl } from "@/lib/scheduling";
import { getSite } from "@/lib/site.server";

const defaultFacts = {
  name: "Roberto Pocas Leitao",
  headline:
    "Product Designer & Python Developer - turns messy processes into clean, AI-powered experiences.",
  experience: [
    {
      label: "Head of Production - Kettner Distillery, San Diego (Feb 2024 - present)",
      detail:
        "Redesigned production workflows for roughly a 40% efficiency improvement; built the digital and physical systems and assets staff use daily; drives continuous process improvement.",
      tags: ["operations", "systems", "process", "data"],
    },
    {
      label:
        "Investment Sales & Capital Markets - eXp Commercial, San Diego (Sep 2021 - May 2025)",
      detail:
        "Led ground-up development underwriting for multifamily and mixed-use properties; built Excel models for financial and development feasibility; guided clients through complex, data-driven decisions.",
      tags: ["finance", "data", "modeling", "analysis", "clients"],
    },
    {
      label:
        "Tenant Rep & Land Development - Endeavor, San Diego (Oct 2017 - Aug 2021)",
      detail:
        "Designed and implemented a database management system for 12,000+ contacts; conducted ongoing market research focused on user-needs analysis; ran user-centered business-planning consultations.",
      tags: ["data", "database", "research", "ux"],
    },
    {
      label:
        "Bartender - Water Grill and L'Auberge, San Diego (Feb 2010 - May 2021)",
      detail:
        "Read diverse customer needs in real time and crafted personalized experiences; collaborated under pressure; learned that the best systems feel effortless to the person using them.",
      tags: ["hospitality", "people", "service", "experience"],
    },
  ],
  skills: [
    {
      label: "Design",
      detail:
        "Figma, wireframing, prototyping, design systems, user flows, information architecture, navigation.",
      tags: ["design", "ux", "ui", "figma"],
    },
    {
      label: "Engineering",
      detail:
        "Python, SQL, web apps (Next.js / React / TypeScript), Webflow; building and shipping full projects.",
      tags: ["python", "sql", "react", "nextjs", "web"],
    },
    {
      label: "AI / ML",
      detail:
        "Practical LLM applications and AI agents; grounded, role-constrained assistants (e.g. Code Coach and this advocate agent).",
      tags: ["ai", "ml", "agents", "llm"],
    },
    {
      label: "Analysis",
      detail:
        "Financial modeling, feasibility analysis, data-driven decision-making, market and user research.",
      tags: ["data", "analysis", "research"],
    },
  ],
  education: [
    {
      label: "Programming & Data Management with Python",
      detail: "San Diego College of Continuing Education.",
    },
    {
      label: "UX/UI Design Bootcamp",
      detail: "UC Berkeley (Remote).",
    },
    {
      label: "Mastering Generative AI & Agents for Developers",
      detail: "Codecademy Bootcamp.",
    },
    {
      label: "MBA, International Business",
      detail: "SDUIS, San Diego.",
    },
    {
      label: "Real Estate Finance, Investments & Development (Certificate)",
      detail: "UC Berkeley.",
    },
    {
      label: "BBA, Tourism & Hospitality",
      detail: "Belas Artes de Sao Paulo, Brazil.",
    },
    {
      label: "Brazilian Jiu-Jitsu - Brown Belt",
      detail:
        "North Park BJJ. Evidence of long-term discipline and incremental mastery.",
    },
  ],
  honestGaps: [
    "Roberto's deepest paid experience is in operations, real estate capital markets, and hospitality - not years sitting in a software-engineering seat. His software/design depth comes from intensive bootcamps and real, self-driven projects.",
    "He does not have many years of professional production experience in any single framework (e.g. Django, large-scale ML pipelines). When a role asks for that, say so honestly and make the fair case via transferable skills, adjacent experience, and his proven speed of learning.",
    "Be specific and truthful: if something isn't in these facts, say you don't know rather than guessing.",
  ],
};

const defaultSystemPrompt = `
You represent {name} - a product designer and Python developer based in {location}.
His through-line across every job is the same: take a messy, confusing process and make it
clean and usable. He has done this in hospitality, in commercial real estate underwriting,
and in manufacturing operations, and now he does it with product design and code (Figma,
Python, SQL, Next.js, and AI agents).

Your goal is to help recruiters, hiring managers, and prospective clients see where he would
add real value - aiming toward a role around $150k+ or projects starting around $5k - WITHOUT
ever overstating the truth. His best, real, shipped or in-progress work includes: VZTR Help
(a hospital visitor-coordination web app), Petchmaker (a pet re-homing/care matching app),
the Falafel Heights website redesign, and Code Coach (an AI study partner). Reference these
specifically when relevant.

Lead with curiosity about their need, connect it to his verified strengths, and be honest and
constructive about gaps. His standout traits are cross-domain pattern recognition, an
operator's eye for friction, and an unusually fast, disciplined learning habit (he is also a
Brazilian Jiu-Jitsu brown belt - earned by showing up and improving by inches).
`.trim();

function fillPrompt(template: string, site: Awaited<ReturnType<typeof getSite>>): string {
  return template.replace(/\{name\}/g, site.name).replace(/\{location\}/g, site.location);
}

/**
 * Server-only advocate configuration. Holds verified facts and the system prompt.
 * Model is resolved at request time from the back-office provider chain.
 */
export async function getAdvocateConfig(): Promise<AdvocateConfig> {
  const site = await getSite();
  const models = await resolveModelChain();
  const promptOverride = await getContentOverride<string>("advocate_prompt");
  const factsOverride = await getContentOverride<Partial<typeof defaultFacts>>("advocate_facts");

  const facts = {
    ...defaultFacts,
    ...factsOverride,
    name: site.name,
    contact: {
      email: site.email,
      phone: site.phone,
      linkedin: site.linkedin,
      schedulingUrl: getSchedulingUrl(),
    },
  };

  return {
    persona: `${site.name}'s AI advocate`,
    model: models[0]!,
    fallbackModels: ["openai/gpt-4o-mini", "anthropic/claude-haiku-4.5"],
    systemPrompt: fillPrompt(promptOverride ?? defaultSystemPrompt, site),
    tools: {
      exportPdf: true,
      emailTranscript: true,
      scheduleCall: true,
      captureLead: true,
    },
    capabilities: {
      voice: false,
    },
    suggestedPrompts: [
      "I'm hiring for a data / Python role",
      "I have a project (around $5k) in mind",
      "Why product design AND code?",
      "Tell me about VZTR Help",
    ],
    facts,
  };
}

/** All models in priority order for retry on rate limits. */
export async function getAdvocateModelChain() {
  return resolveModelChain();
}
