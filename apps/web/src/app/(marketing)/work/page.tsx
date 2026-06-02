import type { Metadata } from "next";
import { Container } from "@humanberto/ui";
import { WorkExplorer } from "@/components/work/work-explorer";
import { getProjects } from "@/lib/projects.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects across product design, UX/UI, Python, data engineering, and AI/ML. Filter by the crafts your role needs.",
};

export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <div className="pt-32 pb-24">
      <Container>
        <WorkExplorer projects={projects} />
      </Container>
    </div>
  );
}
