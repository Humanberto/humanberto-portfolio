import type { UIMessage } from "ai";

/** Extract plain text from a UIMessage's parts. */
function messageText(message: UIMessage): string {
  return message.parts
    .map((part) =>
      part.type === "text" ? (part as { text: string }).text : "",
    )
    .join("")
    .trim();
}

/** Build a clean Markdown transcript of the conversation. */
export function buildTranscript(
  messages: UIMessage[],
  opts: { ownerName: string; title?: string } = { ownerName: "" },
): string {
  const header = `# ${opts.title ?? `Conversation with ${opts.ownerName}'s AI Advocate`}\n\n_${new Date().toLocaleString()}_\n`;
  const body = messages
    .map((m) => {
      const text = messageText(m);
      if (!text) return "";
      const who = m.role === "user" ? "You" : "Advocate";
      return `**${who}:** ${text}`;
    })
    .filter(Boolean)
    .join("\n\n");
  return `${header}\n${body}\n`;
}
