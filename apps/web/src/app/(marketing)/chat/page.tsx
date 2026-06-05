import type { Metadata } from "next";
import Link from "next/link";
import { AdvocateChat, FitAnalyzer } from "@humanberto/advocate-agent";
import { Badge, Button, Container, GradientText } from "@humanberto/ui";
import { advocateClient } from "@/content/advocate.client";
import { requireBootstrapPage } from "@/lib/site-visibility.server";
import { fitCheckHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Advocate",
  description:
    "Chat with Roberto's AI advocate - an honest guide to his fit for your role or project. Text chat, scheduling, and a savable transcript.",
};

export default async function ChatPage() {
  await requireBootstrapPage("page.chat");
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
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={fitCheckHref}>
              <Button size="sm" variant="outline">
                Score my fit (0–10)
              </Button>
            </Link>
          </div>
        </div>

        <div
          id="advocate-chat"
          className="mt-10 h-[68vh] min-h-[520px] scroll-mt-28 overflow-hidden rounded-3xl border border-line bg-ink/50 backdrop-blur-xl"
        >
          <AdvocateChat config={advocateClient} />
        </div>

        <div
          id="fit-check"
          className="mt-12 scroll-mt-28 rounded-3xl border border-line bg-ink/50 p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="text-center">
            <Badge>Instant fit check</Badge>
            <h2 className="mt-4 font-display text-2xl font-light sm:text-3xl">
              Does Roberto <GradientText>check your boxes?</GradientText>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
              Upload your job description or project scope, paste a link, or drop
              in the text. My advocate scores the fit 0&ndash;10 against my real
              background &ndash; strengths, transferable skills, and honest gaps.
            </p>
          </div>
          <div className="mx-auto mt-6 max-w-xl">
            <FitAnalyzer config={advocateClient} />
          </div>
        </div>
      </Container>
    </div>
  );
}
