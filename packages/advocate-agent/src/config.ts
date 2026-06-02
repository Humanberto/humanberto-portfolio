/**
 * Portable advocate agent configuration contract.
 *
 * To reuse this agent in another project you only change a config object like
 * this one - the UI, API route wiring, and tools stay identical.
 */

import type { LanguageModel } from "ai";

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
  /**
   * The model to use. Either a Vercel AI Gateway id string
   * (e.g. "google/gemini-2.0-flash") or a provider model instance from an
   * @ai-sdk/* package (e.g. google("gemini-2.0-flash")).
   */
  model: LanguageModel;
  /** Optional ordered fallback models for the gateway (string ids only). */
  fallbackModels?: string[];
  theme?: {
    accent?: string;
    launcherLabel?: string;
  };
}

/** The client-safe slice of config (no system prompt / private instructions). */
export interface AdvocateClientConfig {
  apiPath: string;
  /** Endpoint that emails a transcript: POST { to, transcriptMarkdown }. */
  emailPath?: string;
  /** Endpoint that scores a job description / scope against the facts. */
  analyzePath?: string;
  persona: string;
  suggestedPrompts: string[];
  tools: AdvocateToolFlags;
  capabilities: AdvocateCapabilities;
  schedulingUrl?: string;
  ownerName: string;
  ownerPhoto?: string;
  /** Deep link to the fit-score analyzer (e.g. /chat#fit-check). */
  fitCheckHref?: string;
  launcherLabel?: string;
}

/** One matched requirement with the verified evidence behind it. */
export interface FitMatchItem {
  requirement: string;
  evidence: string;
}

/** One honest gap with a constructive, truthful note. */
export interface FitGapItem {
  requirement: string;
  note: string;
}

/**
 * Structured, honesty-first analysis of an uploaded job description / scope
 * against the represented person's verified facts. Shared by the analyzer
 * server handler and the result UI.
 */
export interface FitAnalysis {
  /** What the document is: "job description", "project scope", "RFP", etc. */
  documentKind: string;
  /** Role title or project name, if stated. */
  roleTitle?: string | null;
  /** Overall honest fit, 0-10 (never inflated). */
  score: number;
  /** One-line honest headline. */
  verdict: string;
  /** A short, truthful read of the overall fit. */
  summary: string;
  /** Requirements clearly met, each backed by a verified fact. */
  strengths: FitMatchItem[];
  /** Partial / genuinely transferable matches. */
  transferable: FitMatchItem[];
  /** Honest gaps plus how they'd realistically be closed. */
  gaps: FitGapItem[];
  /** Concise closing recommendation and suggested next step. */
  recommendation: string;
  /** Original file name, if one was uploaded. */
  fileName?: string;
}

export interface CapturedLead {
  name?: string;
  email?: string;
  organization?: string;
  /** "hiring" | "project" | "other" or free text. */
  intent?: string;
  /** What they're looking for / the role or project details. */
  details?: string;
}

/** Real-world integrations injected by the host app (keeps the package generic). */
export interface AdvocateIntegrations {
  captureLead?: (lead: CapturedLead) => Promise<void> | void;
  sendTranscriptEmail?: (args: {
    to: string;
    transcriptMarkdown: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  schedulingUrl?: string;
}
