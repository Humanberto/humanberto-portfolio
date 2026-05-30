import { NextResponse } from "next/server";
import { site } from "@/lib/site";

export const runtime = "nodejs";

function markdownToHtml(md: string): string {
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h2>${line.slice(2)}</h2>`;
      const bolded = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      if (!line.trim()) return "<br/>";
      return `<p style="margin:0 0 10px">${bolded}</p>`;
    })
    .join("\n");
}

export async function POST(req: Request) {
  let to = "";
  let transcriptMarkdown = "";
  try {
    const body = (await req.json()) as {
      to?: string;
      transcriptMarkdown?: string;
    };
    to = (body.to ?? "").trim();
    transcriptMarkdown = body.transcriptMarkdown ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Graceful no-op when email isn't configured yet.
    return NextResponse.json({ ok: false, error: "email_not_configured" });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from = process.env.ADVOCATE_FROM_EMAIL ?? "advocate@humanberto.com";

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;color:#1a1a1a;line-height:1.5">
        <p>Here's your conversation with ${site.name}'s AI advocate:</p>
        <hr/>
        ${markdownToHtml(transcriptMarkdown)}
        <hr/>
        <p>Reply to this email or reach ${site.name} at
          <a href="mailto:${site.email}">${site.email}</a>.</p>
      </div>`;

    await resend.emails.send({
      from: `${site.shortName} Advocate <${from}>`,
      to,
      replyTo: site.email,
      subject: `Your conversation with ${site.name}'s AI advocate`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
}
