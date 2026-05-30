import type { Metadata } from "next";
import { Badge, Container, GradientText } from "@humanberto/ui";
import { AdvocateChat } from "@humanberto/advocate-agent";
import { advocateClient } from "@/content/advocate.client";

export const metadata: Metadata = {
  title: "AI Advocate",
  description:
    "Chat with Roberto's AI advocate - an honest guide to his fit for your role or project. Text chat, scheduling, and a savable transcript.",
};

export default function ChatPage() {
  return (
    <div className="pt-28 pb-12">
      <Container className="max-w-3xl">
        <div className="text-center">
          <Badge>AI Advocate</Badge>
          <h1 className="mt-5 font-display text-4xl font-light sm:text-5xl">
            Your <GradientText>most honest advocate</GradientText>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Ask anything about my experience, my work, or how I&apos;d fit your
            role or project. Straight answers - I&apos;ll never overstate the
            truth.
          </p>
        </div>

        <div className="mt-10 h-[68vh] min-h-[520px] overflow-hidden rounded-3xl border border-line bg-ink/50 backdrop-blur-xl">
          <AdvocateChat config={advocateClient} />
        </div>
      </Container>
    </div>
  );
}
