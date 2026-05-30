/**
 * Portable advocate agent configuration contract.
 *
 * To reuse this agent in another project you only change a config object like
 * this one - the UI, API route wiring, and tools stay identical.
 */

export interface AdvocateFactItem {
  /** Short label, e.g. "Head of Production - Kettner Distillery". */
  label: string;
  /** Plain, verifiable details. Never embellished. */
  detail: string;
  /** Tags used to surface the right facts for a given question. */
  tags?: string[];
}

export interface AdvocateFacts {
  /** Who the agent represents. */
  name: string;
  headline: string;
  /** Hard, verifiable facts grouped by area. */
  experience: AdvocateFactItem[];
  skills: AdvocateFactItem[];
  education: AdvocateFactItem[];
  /** Things that are explicitly NOT true, to prevent over-claiming. */
  honestGaps?: string[];
  contact: {
    email: string;
    phone?: string;
    linkedin?: string;
    schedulingUrl?: string;
  };
}

export interface AdvocateToolFlags {
  exportPdf: boolean;
  emailTranscript: boolean;
  scheduleCall: boolean;
  captureLead: boolean;
}

export interface AdvocateCapabilities {
  voice: boolean;
}

export interface AdvocateConfig {
  persona: string;
  /** Base system prompt; facts are appended automatically. */
  systemPrompt: string;
  facts: AdvocateFacts;
  tools: AdvocateToolFlags;
  capabilities: AdvocateCapabilities;
  suggestedPrompts: string[];
  /** Model id resolved by the Vercel AI Gateway, e.g. "google/gemini-2.0-flash". */
  model: string;
  /** Optional ordered fallback models for the gateway. */
  fallbackModels?: string[];
  theme?: {
    accent?: string;
    launcherLabel?: string;
  };
}
