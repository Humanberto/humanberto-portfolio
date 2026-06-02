import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Container, resolveProjectDesignSystem } from "@humanberto/ui";
import { StatusPill } from "@/components/work/status-pill";
import { ProjectGallery } from "@/components/work/project-gallery";
import { ProjectProcessTimeline } from "@/components/work/project-process-timeline";
import { ProjectVideos } from "@/components/work/project-videos";
import { DesignSystemStyles } from "@/components/theme/design-system-styles";
import { getGlobalDesignSystem } from "@/lib/design-system.server";
import { getProject, getProjects } from "@/lib/projects.server";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Not found" };
  return {
    title: project.title,
    description: project.tagline,
  };
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, globalDesign] = await Promise.all([getProject(slug), getGlobalDesignSystem()]);
  if (!project) notFound();

  const projectDesign = resolveProjectDesignSystem(globalDesign, project.designSystem);
  const useProjectTheme = project.designSystem?.mode === "custom";

  const externalLinks = [
    { label: "Visit live site", href: project.links.live },
    { label: "View prototype", href: project.links.prototype },
    { label: "Source on GitHub", href: project.links.repo },
    { label: "Full case study", href: project.links.caseStudy },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <article className={`pt-32 ${useProjectTheme ? "project-theme" : ""}`}>
      {useProjectTheme && (
        <DesignSystemStyles system={projectDesign} selector=".project-theme" />
      )}
      <Container className="max-w-3xl">
        <Link
          href="/work"
          className="text-sm text-muted hover:text-fg"
        >
          &lt;- All work
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StatusPill status={project.status} />
          <span className="text-xs text-faint">{project.year}</span>
        </div>

        <h1 className="mt-5 font-display text-4xl font-light leading-tight sm:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 text-xl text-muted">{project.tagline}</p>

        <p className="mt-3 text-sm text-faint">{project.role}</p>

        {project.coverImage && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverImage}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        {externalLinks.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {externalLinks.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  {l.label}
                </Button>
              </a>
            ))}
          </div>
        ) : project.status === "in-progress" ? (
          <p className="mt-8 rounded-xl border border-purple/40 bg-purple/10 p-4 text-sm text-purple-soft">
            This one is being built right now. The live app and source link will
            land here as soon as it ships.
          </p>
        ) : null}
      </Container>

      <Container className="mt-16 max-w-3xl space-y-14 pb-10">
        <Section title="Overview">
          <p>{project.summary}</p>
        </Section>

        <Section title="The problem">
          <p>{project.problem}</p>
        </Section>

        {project.images && project.images.length > 0 && (
          <ProjectGallery images={project.images} />
        )}

        {project.videos && project.videos.length > 0 && (
          <ProjectVideos videos={project.videos} />
        )}

        {project.processes && project.processes.length > 0 && (
          <ProjectProcessTimeline processes={project.processes} />
        )}

        <Section title="Approach">
          <ul className="space-y-3">
            {project.approach.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Outcomes">
          <ul className="space-y-3">
            {project.outcomes.map((o, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Stack">
          <div className="flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span
                key={s}
                className="rounded-full border border-line px-3 py-1.5 text-sm text-muted"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>

        <div className="rounded-2xl border border-line bg-surface/50 p-8 text-center">
          <h3 className="font-display text-2xl font-light">
            Want the deeper story?
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            My AI advocate can walk you through the decisions behind this project
            - or how it maps to a role you&apos;re hiring for.
          </p>
          <Link href="/chat" className="mt-6 inline-block">
            <Button>Ask about this project</Button>
          </Link>
        </div>
      </Container>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-sm font-medium uppercase tracking-[0.2em] text-gold">
        {title}
      </h2>
      <div className="mt-4 text-base leading-relaxed text-muted">{children}</div>
    </section>
  );
}
