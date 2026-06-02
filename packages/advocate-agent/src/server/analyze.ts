import { generateObject, type ModelMessage } from "ai";
import { z } from "zod";
import type { AdvocateConfig } from "../config";
import { buildSystemPrompt } from "../prompt";

const matchItem = z.object({
  requirement: z
    .string()
    .describe("A specific requirement or need quoted/paraphrased from the document."),
  evidence: z
    .string()
    .describe(
      "The concrete, verified experience, project, or skill that supports it. No invention.",
    ),
});

const FitAnalysisSchema = z.object({
  documentKind: z
    .string()
    .describe(
      "What the uploaded document is: 'job description', 'project scope', 'RFP', etc.",
    ),
  roleTitle: z
    .string()
    .nullable()
    .describe("The role title or project name if stated, otherwise null."),
  score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "Overall honest fit from 0 to 10, calibrated to the rubric. Never inflate.",
    ),
  verdict: z
    .string()
    .describe(
      "One short, honest headline, e.g. 'Strong on the design + product side, a stretch on backend depth.'",
    ),
  summary: z
    .string()
    .describe(
      "2-4 sentence honest read of the overall fit, in a warm but truthful advocate voice.",
    ),
  strengths: z
    .array(matchItem)
    .describe("Requirements clearly met, each backed by a verified fact. Empty if none."),
  transferable: z
    .array(matchItem)
    .describe(
      "Requirements not met head-on but with genuinely adjacent / transferable experience. Empty if none.",
    ),
  gaps: z
    .array(
      z.object({
        requirement: z
          .string()
          .describe("A requirement the person genuinely does not have."),
        note: z
          .string()
          .describe(
            "Honest acknowledgement plus how they'd realistically close it. No pretending.",
          ),
      }),
    )
    .describe("Honest gaps. Empty if none."),
  recommendation: z
    .string()
    .describe("A concise, honest closing recommendation and a suggested next step."),
});

const RUBRIC = `
# Your task right now
You are given a document (a job description, project scope, RFP, or similar) uploaded by a
recruiter, hiring manager, or potential client. Assess how well the person you represent fits
it, using ONLY the verified facts above. Produce a structured, scrupulously honest assessment.

# Scoring rubric (0-10) - calibrate carefully and NEVER inflate
- 9-10: Excellent fit. Meets essentially all core/hard requirements directly with verified experience.
- 7-8: Strong fit. Meets the core needs; a few requirements met via genuinely adjacent/transferable experience.
- 5-6: Partial fit. Real, relevant value but clear gaps on important requirements; a credible path to close them.
- 3-4: Weak fit. Mostly adjacent value; several important requirements unmet.
- 0-2: Not a fit. Core requirements fall outside the verified experience.

# Rules
- Ground every "strength" and "transferable" item in a SPECIFIC verified fact or named project. No invention.
- If the document asks for years of a specific framework/tool he lacks, it belongs in "gaps" - do not pretend.
- Be the honest advocate: confident and warm, but truthful. The honesty is what makes the score credible.
- If the document is unreadable, empty, or clearly not a job/project description, set score to 0,
  explain why in summary, and leave the lists empty.
`;

export interface CreateFitAnalyzerArgs {
  config: AdvocateConfig;
}

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_TEXT_CHARS = 20000;

function guessType(name: string): string {
  if (/\.pdf$/i.test(name)) return "application/pdf";
  if (/\.(txt|md|markdown)$/i.test(name)) return "text/plain";
  return "";
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Best-effort server-side fetch + text extraction from a job-posting URL. */
async function fetchUrlText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) return "";
    const html = await res.text();
    return htmlToText(html);
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Build a POST handler that scores an uploaded job description / project scope
 * against the represented person's verified facts. Accepts multipart form data
 * (`file` and/or `text`) or a JSON body (`{ text }`). PDFs are sent natively to
 * the model; text is read inline. Reuse by supplying a different `config`.
 */
export function createFitAnalyzerHandler({ config }: CreateFitAnalyzerArgs) {
  const system = `${buildSystemPrompt(config)}\n\n${RUBRIC.trim()}`;

  return async function POST(req: Request): Promise<Response> {
    let pastedText = "";
    let urlInput = "";
    let filePart: { type: "file"; data: Uint8Array; mediaType: string } | null =
      null;
    let fileName = "";

    const contentType = req.headers.get("content-type") ?? "";
    try {
      if (contentType.includes("multipart/form-data")) {
        const form = await req.formData();
        pastedText = String(form.get("text") ?? "").trim();
        urlInput = String(form.get("url") ?? "").trim();
        const file = form.get("file");
        if (file instanceof File && file.size > 0) {
          if (file.size > MAX_BYTES) {
            return Response.json(
              { error: "That file is over the 8MB limit." },
              { status: 413 },
            );
          }
          fileName = file.name;
          const buf = new Uint8Array(await file.arrayBuffer());
          const type = file.type || guessType(file.name);
          if (type === "application/pdf") {
            filePart = { type: "file", data: buf, mediaType: "application/pdf" };
          } else if (type.startsWith("text/") || guessType(file.name)) {
            pastedText = `${pastedText}\n\n${new TextDecoder().decode(buf)}`.trim();
          } else {
            return Response.json(
              {
                error:
                  "Unsupported file type. Upload a PDF or .txt file, or paste the text.",
              },
              { status: 415 },
            );
          }
        }
      } else {
        const body = (await req.json()) as { text?: string; url?: string };
        pastedText = (body.text ?? "").trim();
        urlInput = (body.url ?? "").trim();
      }
    } catch {
      return Response.json(
        { error: "Could not read the upload." },
        { status: 400 },
      );
    }

    if (urlInput) {
      if (!/^https?:\/\/.+/i.test(urlInput)) {
        return Response.json(
          { error: "Enter a valid link starting with http:// or https://." },
          { status: 400 },
        );
      }
      const fetched = await fetchUrlText(urlInput);
      if (fetched.length < 50 && !filePart && pastedText.length < 30) {
        return Response.json(
          {
            error:
              "Couldn't read that link - some job sites block automated access. Try pasting the text or uploading a PDF instead.",
          },
          { status: 422 },
        );
      }
      pastedText = `${pastedText}\n\n${fetched}`.trim();
    }

    if (!filePart && pastedText.length < 30) {
      return Response.json(
        {
          error:
            "Add a job description or project scope - upload a PDF/.txt, paste a link, or paste at least a few sentences.",
        },
        { status: 400 },
      );
    }

    if (pastedText.length > MAX_TEXT_CHARS) {
      pastedText = pastedText.slice(0, MAX_TEXT_CHARS);
    }

    const instruction = `Analyze the following ${
      filePart ? "uploaded document" : "text"
    } for fit and return the structured assessment.`;
    const content: Array<
      | { type: "text"; text: string }
      | { type: "file"; data: Uint8Array; mediaType: string }
    > = [{ type: "text", text: instruction }];
    if (pastedText) content.push({ type: "text", text: pastedText });
    if (filePart) content.push(filePart);

    try {
      const { object } = await generateObject({
        model: config.model,
        schema: FitAnalysisSchema,
        system,
        messages: [{ role: "user", content }] as ModelMessage[],
      });
      return Response.json({
        analysis: { ...object, fileName: fileName || undefined },
      });
    } catch {
      return Response.json(
        { error: "The analysis failed to generate. Please try again." },
        { status: 502 },
      );
    }
  };
}
