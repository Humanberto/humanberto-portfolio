import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Container,
  GradientText,
  SectionHeading,
} from "@humanberto/ui";
import { site, fitCheckHref } from "@/lib/site";
import { ProfilePortrait } from "@/components/profile-portrait";

export const metadata: Metadata = {
  title: "About",
  description:
    "From hospitality to real estate underwriting to manufacturing ops to design and AI - the through-line is turning messy processes into clean experiences.",
};

const timeline = [
  {
    period: "2024 - Present",
    role: "Head of Production",
    org: "Kettner Distillery, San Diego",
    points: [
      "Redesigned production workflows for a ~40% efficiency improvement.",
      "Built the digital and physical systems staff use day to day.",
    ],
  },
  {
    period: "2021 - 2025",
    role: "Investment Sales & Capital Markets",
    org: "eXp Commercial, San Diego",
    points: [
      "Led ground-up development underwriting for multifamily and mixed-use.",
      "Built Excel models for financial and development feasibility.",
      "Guided clients through complex decisions with data-driven insight.",
    ],
  },
  {
    period: "2017 - 2021",
    role: "Tenant Rep & Land Development",
    org: "Endeavor, San Diego",
    points: [
      "Designed and ran a database system for 12,000+ contacts.",
      "Ran market research grounded in user-needs analysis.",
    ],
  },
  {
    period: "2010 - 2021",
    role: "Bartender",
    org: "Water Grill & L'Auberge",
    points: [
      "Read people fast and turned diverse needs into great experiences.",
      "Where I learned that the best systems feel effortless to the person using them.",
    ],
  },
];

const education = [
  "Programming & Data Management with Python - SD College of Continuing Education",
  "UX/UI Design Bootcamp - UC Berkeley (Remote)",
  "Mastering Generative AI & Agents for Developers - Codecademy",
  "MBA, International Business - SDUIS",
  "Real Estate Finance, Investments & Development - UC Berkeley",
  "BBA, Tourism & Hospitality - Belas Artes de Sao Paulo, Brazil",
];

export default function AboutPage() {
  return (
    <div className="pt-32">
      <Container className="max-w-3xl">
        <Badge>About</Badge>
        <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
          <ProfilePortrait name={site.name} src={site.photo} size="lg" />
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-light leading-tight sm:text-5xl">
              A designer who learned the work by{" "}
              <GradientText>doing the work</GradientText>.
            </h1>
            <p className="mt-4 text-sm text-faint">
              {site.name} · {site.location}
            </p>
          </div>
        </div>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
          <p>
            I&apos;m {site.name}, based in {site.location}. My path isn&apos;t a
            straight line - it&apos;s hospitality, real estate capital markets,
            and manufacturing operations - and that&apos;s exactly what makes me
            useful. In every one of those rooms, my job was the same: take
            something messy and confusing and make it clear.
          </p>
          <p>
            Behind a bar I learned to read people and design experiences in real
            time. In commercial real estate I underwrote ground-up developments
            and built the models people bet millions on. Running production at a
            distillery, I rebuilt the workflows and tools the team relies on. Now
            I bring that same instinct to product design and code - Figma,
            Python, SQL, and AI agents - to build things people actually
            understand.
          </p>
          <p>
            I&apos;m a relentless learner (also a Brazilian Jiu-Jitsu brown belt,
            which is mostly a lesson in showing up and improving by inches). I
            love working with founders and engineers on smart, creative,
            AI-powered products.
          </p>
        </div>
      </Container>

      <section className="mt-20">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Experience" title="The winding, useful path" />
          <div className="mt-10 space-y-8">
            {timeline.map((item) => (
              <div
                key={item.role}
                className="relative border-l border-line pl-6"
              >
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold" />
                <p className="text-xs uppercase tracking-[0.18em] text-faint">
                  {item.period}
                </p>
                <h3 className="mt-1 font-display text-xl font-light">
                  {item.role}
                  <span className="text-muted"> - {item.org}</span>
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {item.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="mt-20">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Education & training" title="Always studying" />
          <Card className="mt-8 p-6">
            <ul className="grid gap-3 text-sm text-muted sm:grid-cols-1">
              {education.map((e) => (
                <li key={e} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/70" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Container>
      </section>

      <section className="mt-20">
        <Container className="max-w-3xl">
          <Card className="p-10 text-center">
            <h2 className="font-display text-2xl font-light sm:text-3xl">
              The fastest way to know if I&apos;m a fit
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              Upload a job description for an instant 0–10 score, or tell my AI
              advocate about the role. Either way you get an honest read —
              strengths, transferable skills, and the gaps I&apos;d be closing.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={fitCheckHref}>
                <Button size="lg">Score my fit</Button>
              </Link>
              <Link href="/chat">
                <Button size="lg" variant="outline">
                  Talk to my advocate
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </div>
  );
}
