export type Pillar =
  | "Product Design"
  | "UX/UI Design"
  | "Python"
  | "Data Engineering"
  | "AI/ML";

export type ProjectStatus = "live" | "in-progress" | "prototype" | "case-study";

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  year: string;
  role: string;
  pillars: Pillar[];
  status: ProjectStatus;
  summary: string;
  problem: string;
  approach: string[];
  outcomes: string[];
  stack: string[];
  links: {
    live?: string;
    repo?: string;
    caseStudy?: string;
    prototype?: string;
  };
  featured?: boolean;
  accent?: "gold" | "purple";
}

export const PILLARS: { name: Pillar; blurb: string }[] = [
  {
    name: "Product Design",
    blurb:
      "Framing the real problem, shaping the flow, and shipping something people actually use.",
  },
  {
    name: "UX/UI Design",
    blurb:
      "Research, wireframes, prototypes, and clean interfaces backed by a real design system.",
  },
  {
    name: "Python",
    blurb:
      "Scripts, automations, and backends that take the tedious parts off people's plates.",
  },
  {
    name: "Data Engineering",
    blurb:
      "Modeling, cleaning, and moving data so the numbers can be trusted and queried.",
  },
  {
    name: "AI/ML",
    blurb:
      "Practical LLM apps and agents that assist real workflows - grounded, not gimmicky.",
  },
];

export const projects: Project[] = [
  {
    slug: "vztr-help",
    title: "VZTR Help",
    tagline: "Coordinating hospital visits without the group-text chaos.",
    year: "2026",
    role: "Product design, full-stack build",
    pillars: ["Product Design", "UX/UI Design", "Python", "Data Engineering"],
    status: "in-progress",
    featured: true,
    accent: "purple",
    summary:
      "A web app that lets a patient (or a family coordinator) open a visit, invite people, and let visitors claim time slots inside the hospital's rules - no double-booking, no overwhelmed patient.",
    problem:
      "When someone is admitted, coordinating who visits and when turns into a stressful group chat. Hospitals cap visitors and hours; families lose track; the patient gets either nobody or everybody at once.",
    approach: [
      "Mapped the real coordination flow: coordinator opens a visit, sets limits, and shares one link.",
      "Modeled visits, slots, invitations, and limits in Postgres with row-level security.",
      "Built slot claiming with conflict and capacity checks so two people can't over-fill a window.",
      "Designed a calm, accessible UI that works for stressed, non-technical family members.",
    ],
    outcomes: [
      "A deployed, usable MVP - not just a prototype.",
      "Clear data model and auth that demonstrates full-stack and product thinking end to end.",
    ],
    stack: ["Next.js", "TypeScript", "Supabase (Postgres + Auth)", "Tailwind"],
    links: { repo: "https://github.com/Humanberto/vztr-help" },
  },
  {
    slug: "petchmaker",
    title: "Petchmaker",
    tagline: "When you can no longer care for your pet, find it the right person.",
    year: "2026",
    role: "Product design, full-stack build",
    pillars: ["Product Design", "UX/UI Design", "Python", "AI/ML"],
    status: "in-progress",
    featured: true,
    accent: "gold",
    summary:
      "A matching platform connecting pet owners who need temporary or permanent care with vetted caretakers - profiles, listings, and a request flow that respects how emotional these decisions are.",
    problem:
      "Life changes - illness, moving, finances - can make pet care impossible. The alternatives (shelters, random posts) are stressful and risky. There's no calm, trustworthy way to match a pet with the right person.",
    approach: [
      "Designed owner and caretaker profiles plus pet listings with the details that actually matter for a match.",
      "Built a request/match flow with clear states so nobody is left wondering what happens next.",
      "Modeled pets, owners, caretakers, and requests in Postgres with secure access rules.",
      "Sketched a lightweight matching score to surface the most compatible caretakers first.",
    ],
    outcomes: [
      "A deployed MVP people can sign into and use.",
      "Shows product judgment around a sensitive, human problem - plus the data model behind it.",
    ],
    stack: ["Next.js", "TypeScript", "Supabase (Postgres + Auth)", "Tailwind"],
    links: { repo: "https://github.com/Humanberto/petchmaker" },
  },
  {
    slug: "falafel-heights-redesign",
    title: "Falafel Heights",
    tagline: "A neighborhood favorite, redesigned to actually drive orders.",
    year: "2025",
    role: "UX/UI design, front-end",
    pillars: ["UX/UI Design", "Product Design"],
    status: "live",
    featured: true,
    accent: "gold",
    summary:
      "A website redesign for a local restaurant focused on the things that move the needle: a clear menu, fast mobile ordering paths, and a brand that matches the food.",
    problem:
      "The original site buried the menu and hours, looked dated on mobile, and gave hungry visitors no obvious next step.",
    approach: [
      "Audited the existing site and the real questions customers ask (menu, hours, where to order).",
      "Restructured the information architecture around ordering and findability.",
      "Designed a warm, appetizing visual system and a mobile-first layout.",
      "Built it as a fast, responsive site.",
    ],
    outcomes: [
      "A clear path from landing to menu to order.",
      "A modern, mobile-first presence that fits the brand.",
    ],
    stack: ["Figma", "Webflow / Next.js", "Responsive design"],
    links: {},
  },
  {
    slug: "code-coach",
    title: "Code Coach",
    tagline: "An AI study partner that coaches instead of just answering.",
    year: "2025",
    role: "Product design, AI integration",
    pillars: ["AI/ML", "Product Design", "Python"],
    status: "prototype",
    featured: true,
    accent: "purple",
    summary:
      "A web app that helps people learning to code by coaching them through problems - asking guiding questions, hinting, and explaining - rather than handing over copy-paste answers.",
    problem:
      "Most AI coding help gives the answer, which feels great and teaches nothing. Learners need a partner that builds understanding and confidence.",
    approach: [
      "Designed a coaching conversation model with escalating hint levels.",
      "Engineered prompts that keep the model in 'coach' mode and grounded in the learner's code.",
      "Built a focused, distraction-free practice UI.",
    ],
    outcomes: [
      "A working prototype that demonstrates practical LLM product design.",
      "A reusable pattern for grounded, role-constrained AI assistants.",
    ],
    stack: ["Next.js", "TypeScript", "LLM (provider-agnostic)", "Tailwind"],
    links: {},
  },
  {
    slug: "monte-vista-water",
    title: "Monte Vista Water District",
    tagline: "Setting up a new water service without the headache.",
    year: "2024",
    role: "UX/UI design",
    pillars: ["UX/UI Design"],
    status: "case-study",
    accent: "purple",
    summary:
      "A redesigned flow that helps homeowners set up a new water service - turning a confusing, form-heavy process into clear, guided steps.",
    problem:
      "New residents struggled to figure out how to start service: unclear requirements, dense forms, and no sense of progress.",
    approach: [
      "Researched the steps and the documents homeowners actually need.",
      "Broke the process into guided, low-anxiety steps with clear progress.",
      "Prototyped and tested the flow in Figma.",
    ],
    outcomes: [
      "A clear, guided setup flow.",
      "A reusable pattern for civic/utility onboarding.",
    ],
    stack: ["Figma", "User research", "Prototyping"],
    links: {},
  },
  {
    slug: "pollinator-partnership",
    title: "Pollinator Partnership",
    tagline: "Helping home gardeners build pollinator-friendly gardens.",
    year: "2024",
    role: "UX/UI design, website redesign",
    pillars: ["UX/UI Design", "Product Design"],
    status: "case-study",
    accent: "gold",
    summary:
      "A website redesign that helps home gardeners learn what to plant and how to support pollinators - organized around the gardener's journey instead of the org's internal structure.",
    problem:
      "Great content, hard to act on: gardeners couldn't easily figure out what to do next for their region and garden.",
    approach: [
      "Reorganized content around the gardener's goals and region.",
      "Designed clearer entry points and actionable guidance.",
      "Prototyped a friendlier, more visual layout.",
    ],
    outcomes: [
      "A journey-first IA that turns reading into doing.",
      "A warmer, more inviting visual direction.",
    ],
    stack: ["Figma", "Information architecture", "Prototyping"],
    links: {},
  },
  {
    slug: "duckdb-rides-pipeline",
    title: "DuckDB Rides Pipeline",
    tagline: "A tidy ETL + analytics pipeline you can read end to end.",
    year: "2026",
    role: "Data engineering",
    pillars: ["Data Engineering", "Python"],
    status: "live",
    accent: "purple",
    summary:
      "A small, self-contained pipeline in the real shape of a data job: ingest messy raw events, validate and enrich them, load into DuckDB, and answer business questions with SQL - then write a report.",
    problem:
      "Toy data projects skip the parts that matter - validation, derived columns, and turning rows into answers. I wanted a compact, honest example that does the whole loop and runs offline in seconds.",
    approach: [
      "Generated deterministic sample events with intentionally broken rows (zero distance/duration).",
      "Cleaned with pandas: parsed timestamps, computed duration, dropped impossible rows, derived tip % and fare-per-mile.",
      "Loaded the clean frame into a DuckDB table and answered questions with SQL (revenue by day, busiest hours).",
      "Covered the validation and analytics with tests.",
    ],
    outcomes: [
      "A runnable, tested pipeline that demonstrates the full ingest -> clean -> load -> analyze loop.",
      "Clear, explainable code over black-box tooling.",
    ],
    stack: ["Python", "pandas", "DuckDB", "pytest"],
    links: { repo: "https://github.com/Humanberto/duckdb-rides-pipeline" },
  },
  {
    slug: "resume-job-matcher",
    title: "Resume / Job Matcher",
    tagline: "Score a resume against a job description - and name the gaps.",
    year: "2026",
    role: "Applied ML / NLP",
    pillars: ["AI/ML", "Python"],
    status: "live",
    accent: "gold",
    summary:
      "A focused Python tool that scores how well a resume matches a job description and, more usefully, lists which of the job's important keywords are covered and which are missing.",
    problem:
      "A single similarity number is useless on its own. The actionable question is: what does this resume already cover, and what should it address?",
    approach: [
      "Used TF-IDF cosine similarity (scikit-learn) on purpose - transparent and explainable, no opaque embeddings.",
      "Ranked the job's terms by importance and split them into covered vs. missing buckets.",
      "Wrapped it in a CLI and a small Python API, with tests.",
    ],
    outcomes: [
      "An honest, actionable read on fit - the same honesty-first thinking behind this site's AI advocate.",
      "A clean, tested package others can drop into their own tooling.",
    ],
    stack: ["Python", "scikit-learn", "CLI", "pytest"],
    links: { repo: "https://github.com/Humanberto/resume-job-matcher" },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function projectsByPillar(pillar: Pillar): Project[] {
  return projects.filter((p) => p.pillars.includes(pillar));
}

export const featuredProjects = projects.filter((p) => p.featured);
