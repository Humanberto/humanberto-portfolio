import { generateObject, type ModelMessage } from "ai";
import { z } from "zod";
import { buildSystemPrompt } from "@humanberto/advocate-agent/server";
import { getAdvocateConfig } from "@/content/advocate.server";
import { withModelChain } from "@/lib/advocate-model";

export const runtime = "nodejs";
export const maxDuration = 60;

const matchItem = z.object({
  requirement: z.string(),
  evidence: z.string(),
});

const FitAnalysisSchema = z.object({
  documentKind: z.string(),
  roleTitle: z.string().nullable(),
  score: z.number().min(0).max(10),
  verdict: z.string(),
  summary: z.string(),
  strengths: z.array(matchItem),
  transferable: z.array(matchItem),
  gaps: z.array(
    z.object({
      requirement: z.string(),
      note: z.string(),
    }),
  ),
  recommendation: z.string(),
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
    return htmlToText(await res.text());
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request): Promise<Response> {
  const config = await getAdvocateConfig();
  const system = `${buildSystemPrompt(config)}\n\n${RUBRIC.trim()}`;

  let pastedText = "";
  let urlInput = "";
  let filePart: { type: "file"; data: Uint8Array; mediaType: string } | null = null;
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
          return Response.json({ error: "That file is over the 8MB limit." }, { status: 413 });
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
            { error: "Unsupported file type. Upload a PDF or .txt file, or paste the text." },
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
    return Response.json({ error: "Could not read the upload." }, { status: 400 });
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
    const { object } = await withModelChain((model) =>
      generateObject({
        model,
        schema: FitAnalysisSchema,
        system,
        messages: [{ role: "user", content }] as ModelMessage[],
      }),
    );
    return Response.json({
      analysis: { ...object, fileName: fileName || undefined },
    });
  } catch (err) {
    const rateLimited = /429|rate.?limit|quota|too many requests/i.test(String(err));
    return Response.json(
      {
        error: rateLimited
          ? "The AI provider is rate-limited right now. Try again in a minute, or add another API key in your back office."
          : "The analysis failed to generate. Please try again.",
      },
      { status: rateLimited ? 429 : 502 },
    );
  }
}
