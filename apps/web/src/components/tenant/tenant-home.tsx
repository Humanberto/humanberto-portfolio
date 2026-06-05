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
import type { Project } from "@/content/projects";
import type { SiteConfig } from "@/lib/site";
import { isFeatureVisible, type ResolvedSiteVisibility } from "@/lib/site-visibility";
import type { TenantAboutContent } from "@/lib/tenant/require-tenant-site";
import {
  tenantFitCheckHref,
  tenantPagePath,
  tenantWorkPath,
} from "@/lib/tenant/public-site";

type Props = {
  tenantSlug: string;
  site: SiteConfig;
  projects: Project[];
  about: TenantAboutContent;
  advocate?: boolean;
  visibility: ResolvedSiteVisibility;
};

export function TenantHome({
  tenantSlug,
  site,
  projects,
  about,
  advocate = true,
  visibility,
}: Props) {
  const v = (id: string) => isFeatureVisible(visibility, id);
  const firstName = site.name.split(" ")[0] ?? site.name;
  const workHref = tenantPagePath(tenantSlug, "/work");
  const chatHref = tenantPagePath(tenantSlug, "/chat");
  const contactHref = tenantPagePath(tenantSlug, "/contact");
  const fitCheck = tenantFitCheckHref(tenantSlug);

  const focusAreas = [
    { name: "Focus", blurb: about.focus || site.tagline },
    { name: "Audience", blurb: about.audience || "People who hire and collaborate" },
    { name: "Role", blurb: site.role },
  ];

  return (
    <>
      {v("home.hero") ? (
        <section className="relative flex min-h-[92vh] items-center pt-24">
          <Container>
            <div className="max-w-3xl">
              {v("home.hero.badge") ? <Badge>{site.role}</Badge> : null}
              <h1 className="mt-6 font-display text-5xl font-light leading-[1.04] sm:text-6xl lg:text-7xl">
                {site.tagline.split(" — ")[0] ?? site.tagline}{" "}
                <GradientText>{site.shortName || firstName}</GradientText>.
              </h1>
              {v("home.hero.intro") ? (
                <p className="mt-7 max-w-xl text-lg text-muted">{about.intro}</p>
              ) : null}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {advocate && v("home.hero.cta.advocate") ? (
                  <Link href={chatHref}>
                    <Button size="lg">Talk to my AI advocate</Button>
                  </Link>
                ) : null}
                {advocate && v("home.hero.cta.fit-check") ? (
                  <Link href={fitCheck}>
                    <Button size="lg" variant="outline">
                      Score my fit
                    </Button>
                  </Link>
                ) : null}
                {v("home.hero.cta.work") ? (
                  <Link href={workHref}>
                    <Button
                      size="lg"
                      variant={advocate && v("home.hero.cta.advocate") ? "ghost" : "outline"}
                    >
                      See the work
                    </Button>
                  </Link>
                ) : null}
              </div>
              {v("home.hero.email-link") ? (
                site.email ? (
                  <p className="mt-8 text-sm text-faint">
                    Or skip the pitch —{" "}
                    <a
                      href={`mailto:${site.email}`}
                      className="text-muted underline-offset-4 hover:text-fg hover:underline"
                    >
                      email me directly
                    </a>
                    .
                  </p>
                ) : (
                  <p className="mt-8 text-sm text-faint">
                    <Link href={contactHref} className="text-muted hover:text-fg hover:underline">
                      Get in touch
                    </Link>
                  </p>
                )
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {v("home.about-section") ? (
        <section className="py-20">
          <Container>
            <SectionHeading
              eyebrow="About this portfolio"
              title="Built for the people you want to reach"
              lead={about.intro}
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {focusAreas.map((pillar) => (
                <Card key={pillar.name} className="p-6">
                  <h3 className="font-display text-xl font-light text-gold-bright">
                    {pillar.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.blurb}</p>
                </Card>
              ))}
              {v("home.myoffice-card") ? (
                <Card className="flex flex-col justify-between bg-purple/10 p-6">
                  <div>
                    <h3 className="font-display text-xl font-light">Make it yours</h3>
                    <p className="mt-2 text-sm text-muted">
                      Edit copy, colors, and projects in My Office — or ask the Studio agent for
                      help.
                    </p>
                  </div>
                  <Link
                    href="/myoffice/studio"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold-bright"
                  >
                    Open My Office →
                  </Link>
                </Card>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {v("home.projects") ? (
        <section className="py-20">
          <Container>
            <div className="flex items-end justify-between gap-6">
              <SectionHeading eyebrow="Selected work" title="Projects & case studies" />
              {v("home.projects.view-all") ? (
                <Link
                  href={workHref}
                  className="hidden shrink-0 text-sm text-gold-bright hover:underline sm:block"
                >
                  All projects →
                </Link>
              ) : null}
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  href={tenantWorkPath(tenantSlug, project.slug)}
                />
              ))}
            </div>
            {projects.length === 0 ? (
              <p className="mt-8 text-muted">
                Projects coming soon — add yours in{" "}
                <Link href="/myoffice/projects" className="text-gold-bright hover:underline">
                  My Office → Projects
                </Link>
                .
              </p>
            ) : null}
          </Container>
        </section>
      ) : null}

      {advocate && v("home.advocate-band") ? (
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
                  It answers honestly — never inventing experience — and helps visitors see
                  where I&apos;d add value.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  {v("home.hero.cta.advocate") ? (
                    <Link href={chatHref}>
                      <Button size="lg">Start the conversation</Button>
                    </Link>
                  ) : null}
                  {v("home.hero.cta.fit-check") ? (
                    <Link href={fitCheck}>
                      <Button size="lg" variant="outline">
                        Score my fit
                      </Button>
                    </Link>
                  ) : null}
                  {v("nav.contact") ? (
                    <Link href={contactHref}>
                      <Button size="lg" variant="ghost">
                        Contact me
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </Card>
          </Container>
        </section>
      ) : null}
    </>
  );
}
