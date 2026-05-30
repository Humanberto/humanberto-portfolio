import type { Metadata } from "next";
import { Badge, Container, GradientText } from "@humanberto/ui";

export const metadata: Metadata = {
  title: "AI Advocate",
  description:
    "Chat with Roberto's AI advocate - an honest guide to his fit for your role or project.",
};

// Full chat experience is implemented in the advocate-agent phase.
export default function ChatPage() {
  return (
    <div className="flex min-h-[80vh] items-center pt-32">
      <Container className="max-w-2xl text-center">
        <Badge>AI Advocate</Badge>
        <h1 className="mt-6 font-display text-4xl font-light sm:text-5xl">
          Your <GradientText>most honest advocate</GradientText> is warming up.
        </h1>
        <p className="mt-6 text-muted">
          The conversational agent is being wired in. It will answer questions
          about my work, map my experience to your needs, and book a call - all
          without ever overstating the truth.
        </p>
      </Container>
    </div>
  );
}
