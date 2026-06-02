import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Container,
  GradientText,
  SectionHeading,
} from "@humanberto/ui";
import { ProjectCard } from "@/components/work/project-card";
import { PILLARS } from "@/content/projects";
import { getFeaturedProjects } from "@/lib/projects.server";
import { fitCheckHref, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProjects = await getFeaturedProjects();
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center pt-24">
        <Container>
          <div className="max-w-3xl">
            <Badge>{site.role}</Badge>
            <h1 className="mt-6 font-display text-5xl font-light leading-[1.04] sm:text-6xl lg:text-7xl">
              Turning messy processes into{" "}
              <GradientText>clean experiences</GradientText>.
            </h1>
            <p className="mt-7 max-w-xl text-lg text-muted">
              I&apos;m {site.name.split(" ")[0]} - a product designer and Python
              developer who works across data, design, and AI to ship products
              people actually understand.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/chat">
                <Button size="lg">Talk to my AI advocate</Button>
              </Link>
              <Link href={fitCheckHref}>
                <Button size="lg" variant="outline">
                  Score my fit
                </Button>
              </Link>
              <Link href="/work">
                <Button size="lg" variant="ghost">
                  See the work
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-sm text-faint">
              Or skip the pitch -{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-muted underline-offset-4 hover:text-fg hover:underline"
              >
                email me directly
              </a>
              .
            </p>
          </div>
        </Container>
      </section>

      {/* Skill pillars */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="What I do"
            title="Five overlapping crafts, one way of thinking"
            lead="The same instinct runs through all of it: find the friction, model the problem, and build something clean."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar) => (
              <Card key={pillar.name} className="p-6">
                <h3 className="font-display text-xl font-light text-gold-bright">
                  {pillar.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {pillar.blurb}
                </p>
              </Card>
            ))}
            <Card className="flex flex-col justify-between bg-purple/10 p-6">
              <div>
                <h3 className="font-display text-xl font-light">
                  Not sure which box I fit?
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Filter by craft below, or upload a job description for an
                  honest 0–10 fit score.
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={fitCheckHref}
                  className="inline-flex items-center gap-1 text-sm font-medium text-gold-bright"
                >
                  Score my fit -&gt;
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
                >
                  Ask my AI advocate -&gt;
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Featured work */}
      <section className="py-20">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Selected work"
              title="Real problems, shipped solutions"
            />
            <Link
              href="/work"
              className="hidden shrink-0 text-sm text-gold-bright hover:underline sm:block"
            >
              All projects -&gt;
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Container>
      </section>

      {/* Advocate band */}
      <section className="py-20">
        <Container>
          <Card className="relative overflow-hidden p-10 sm:p-14">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
            <div className="relative max-w-2xl">
              <Badge>AI Advocate</Badge>
              <h2 className="mt-5 font-display text-3xl font-light sm:text-4xl">
                Hiring or have a project? Talk to the agent that knows my work.
              </h2>
              <p className="mt-5 text-muted">
                It answers honestly - never inventing experience - and helps you
                see where I&apos;d add value, even where I&apos;m still growing.
                Save the chat as a PDF, get it by email, book an intro call, or
                upload a job description for an instant 0–10 fit score.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/chat">
                  <Button size="lg">Start the conversation</Button>
                </Link>
                <Link href={fitCheckHref}>
                  <Button size="lg" variant="outline">
                    Score my fit
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="ghost">
                    Book an intro call
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
