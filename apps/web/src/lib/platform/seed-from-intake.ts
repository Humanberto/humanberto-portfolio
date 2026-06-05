import "server-only";
import type { DesignSystemPatch } from "@humanberto/ui";
import { applyStudioPatch } from "@/lib/studio/agent";
import { setContentOverride } from "@/lib/admin/content";
import { saveAllProjects } from "@/lib/projects.server";
import type { AdminProject } from "@/lib/projects.shared";
import { slugifyTitle } from "@/lib/projects.shared";
import type { SiteConfig } from "@/lib/site";
import { advocateEnabledFromIntake } from "@/lib/tenant/public-site";

const STYLE_PRESETS: Record<string, DesignSystemPatch> = {
  "Dark & premium": {
    name: "Portfolio",
    colors: {},
  },
  "Light & minimal": {
    name: "Portfolio — Light",
    colors: {
      ink: "#f5f5f4",
      surface: "#ffffff",
      surfaceRaised: "#fafaf9",
      purpleDeep: "#e7e5e4",
      purple: "#d6d3d1",
      purpleSoft: "#e7e5e4",
      gold: "#78716c",
      goldBright: "#57534e",
      goldDust: "#a8a29e",
      text: "#1c1917",
      textMuted: "#57534e",
      textFaint: "#78716c",
      line: "#d6d3d1",
    },
  },
  "Bold & colorful": {
    name: "Portfolio — Bold",
    colors: {
      purple: "#7c3aed",
      purpleSoft: "#a78bfa",
      gold: "#f59e0b",
      goldBright: "#fbbf24",
      goldDust: "#fcd34d",
    },
  },
  Editorial: {
    name: "Portfolio — Editorial",
    colors: {
      ink: "#0a0a0a",
      gold: "#c9a227",
      goldBright: "#e8c547",
      text: "#fafafa",
    },
    typography: {
      displayWeight: "400",
      eyebrowTracking: "0.25em",
    },
  },
  "Not sure yet": {
    name: "Portfolio",
    colors: {},
  },
};

function projectCountFromIntake(count?: string): number {
  if (count === "6+") return 4;
  if (count === "3–5") return 3;
  return 2;
}

function starterProjects(
  displayName: string,
  answers: Record<string, string>,
): AdminProject[] {
  const n = projectCountFromIntake(answers.projects_count);
  const role = answers.role ?? "Creator";
  const audience = answers.audience ?? "your audience";
  const year = String(new Date().getFullYear());

  return Array.from({ length: n }, (_, i) => {
    const num = i + 1;
    const title = `Project ${num}`;
    return {
      slug: slugifyTitle(title) || `project-${num}`,
      title,
      tagline: `A case study for ${audience} — replace with your real project.`,
      year,
      role,
      pillars: ["Product Design"],
      status: "case-study" as const,
      summary: `${displayName} led this project. Edit this overview in My Office → Projects.`,
      problem: `Describe the problem you solved for ${audience}.`,
      approach: [
        "Research and discovery — what you learned",
        "Design or build — your process",
        "Ship and iterate — how you delivered value",
      ],
      outcomes: [
        "Add a measurable outcome",
        "Add another result hiring managers care about",
      ],
      stack: ["Your tools", "Your stack"],
      links: {},
      featured: num <= 2,
      published: true,
      accent: num % 2 === 0 ? "purple" : "gold",
    } satisfies AdminProject;
  });
}

function buildSiteConfig(
  displayName: string,
  email: string | undefined,
  answers: Record<string, string>,
): Partial<SiteConfig> {
  const role = answers.role ?? "Portfolio professional";
  const goal = answers.goal ?? "Showcase my work";
  const audience = answers.audience ?? "people who hire or collaborate";

  return {
    name: displayName,
    shortName: displayName.split(" ")[0] ?? displayName,
    role,
    tagline: `${goal} — crafted for ${audience}`,
    email: email ?? "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    photo: "",
  } as unknown as Partial<SiteConfig>;
}

function buildAdvocateSeed(displayName: string, answers: Record<string, string>) {
  return {
    advocate_facts: {
      ownerName: displayName,
      headline: answers.role ?? displayName,
      goal: answers.goal ?? "",
      audience: answers.audience ?? "",
      highlights: [
        `Primary goal: ${answers.goal ?? "Showcase work"}`,
        `Audience: ${answers.audience ?? "Hiring managers and collaborators"}`,
      ],
    },
    advocate_prompt: `You are ${displayName}'s AI advocate on their portfolio site. Be honest, concise, and helpful. Goal: ${answers.goal ?? "showcase their work"}. Audience: ${answers.audience ?? "visitors"}. Never invent experience — only use facts provided.`,
  };
}

/** Apply intake answers to tenant content (design system, site, starter projects, advocate). */
export async function buildInitialSiteFromIntake(
  tenantId: string,
  displayName: string,
  email: string | undefined,
  answers: Record<string, string>,
): Promise<void> {
  const styleKey = answers.style ?? "Not sure yet";
  const designPatch = { ...(STYLE_PRESETS[styleKey] ?? STYLE_PRESETS["Not sure yet"]) };
  designPatch.name = `${displayName.split(" ")[0] ?? "My"} Portfolio`;

  const site = buildSiteConfig(displayName, email, answers);

  await applyStudioPatch(tenantId, {
    designSystem: designPatch,
    site,
  });

  const projects = starterProjects(displayName, answers);
  await saveAllProjects(projects, tenantId);

  if (advocateEnabledFromIntake(answers)) {
    const seed = buildAdvocateSeed(displayName, answers);
    await setContentOverride("advocate_facts", seed.advocate_facts, tenantId);
    await setContentOverride("advocate_prompt", seed.advocate_prompt, tenantId);
  }

  await setContentOverride(
    "about",
    {
      intro: `${displayName} is ${answers.role ?? "a portfolio professional"}. This site is built for ${answers.audience ?? "your audience"} — with a focus on ${answers.goal ?? "showcasing great work"}.`,
      focus: answers.goal ?? "Showcase my work",
      audience: answers.audience ?? "",
    },
    tenantId,
  );
}
