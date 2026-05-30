import type { Metadata } from "next";
import { Container, SectionHeading } from "@humanberto/ui";
import { ProjectCard } from "@/components/work/project-card";
import { PILLARS, projectsByPillar } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects across product design, UX/UI, Python, data engineering, and AI/ML.",
};

export default function WorkPage() {
  return (
    <div className="pt-32">
      <Container>
        <SectionHeading
          eyebrow="Portfolio"
          title="Work, grouped by craft"
          lead="Some projects live in more than one column - that overlap is the point."
        />
      </Container>

      <div className="mt-16 space-y-20">
        {PILLARS.map((pillar) => {
          const items = projectsByPillar(pillar.name);
          if (items.length === 0) return null;
          return (
            <section key={pillar.name}>
              <Container>
                <div className="mb-8 border-l-2 border-gold/50 pl-4">
                  <h2 className="font-display text-2xl font-light text-gold-bright">
                    {pillar.name}
                  </h2>
                  <p className="mt-1 max-w-xl text-sm text-muted">
                    {pillar.blurb}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((project) => (
                    <ProjectCard
                      key={`${pillar.name}-${project.slug}`}
                      project={project}
                    />
                  ))}
                </div>
              </Container>
            </section>
          );
        })}
      </div>
    </div>
  );
}
