import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, Card, Container, GradientText, SectionHeading } from "@humanberto/ui";

export const metadata: Metadata = {
  title: "Humanberto Studio — Build your portfolio",
  description:
    "A designer-grade portfolio platform with your own back office, design system editor, and AI studio agent.",
};

const features = [
  {
    title: "Your own myoffice",
    body: "Manage projects, site copy, and design tokens from a private back office — no code required.",
  },
  {
    title: "Studio agent",
    body: "Chat with an AI partner while your design system and copy update live in the preview.",
  },
  {
    title: "Personal URL",
    body: "Launch at humanberto.com/s/your-name. Custom domains coming soon.",
  },
  {
    title: "Design system built in",
    body: "Colors, typography, buttons, and radii — editable globally with per-project overrides.",
  },
];

const steps = [
  { n: "01", label: "Sign up", detail: "Google, GitHub, or email — under a minute." },
  { n: "02", label: "Onboard", detail: "Pick your URL slug and answer a few research questions." },
  { n: "03", label: "Studio", detail: "Refine your look and copy with the agent in real time." },
  { n: "04", label: "Ship", detail: "Add projects in myoffice and share your public portfolio." },
];

export default function StudioLandingPage() {
  return (
    <>
      <section className="relative flex min-h-[80vh] items-center pt-28 pb-16">
        <Container className="max-w-3xl text-center">
          <Badge>Humanberto Studio</Badge>
          <h1 className="mt-6 font-display text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
            Build your portfolio{" "}
            <GradientText>here</GradientText>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            A designer-grade portfolio with your own back office — projects, design system,
            copy, and an AI studio agent that helps you ship a site you&apos;re proud of.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link href="/work">
              <Button size="lg" variant="outline">
                See an example
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-faint">
            Already have an account?{" "}
            <Link href="/signup" className="text-muted hover:text-fg underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <SectionHeading
            eyebrow="Features"
            title="Everything you need to launch"
            lead="Not a template dump — a real portfolio system with an agent in the loop."
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <Card key={f.title} className="p-6">
                <h3 className="font-display text-xl font-light">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line/40 bg-surface/30 py-20">
        <Container>
          <SectionHeading eyebrow="How it works" title="Four steps to your site" align="center" />
          <ol className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-2">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="font-display text-2xl text-gold">{s.n}</span>
                <div>
                  <p className="font-medium text-fg">{s.label}</p>
                  <p className="mt-1 text-sm text-muted">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-20">
        <Container className="max-w-2xl text-center">
          <h2 className="font-display text-3xl font-light sm:text-4xl">Ready to build?</h2>
          <p className="mt-4 text-muted">
            Free to start. Your portfolio lives at{" "}
            <span className="text-fg">humanberto.com/s/your-name</span>.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg">Create your portfolio</Button>
          </Link>
        </Container>
      </section>
    </>
  );
}
