import type { ProjectDesignBinding } from "@humanberto/ui";

export type Pillar =
  | "Product Design"
  | "UX/UI Design"
  | "Python"
  | "Data Engineering"
  | "AI/ML";

export type ProjectStatus = "live" | "in-progress" | "prototype" | "case-study";

export interface ProjectImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
}

export interface ProjectVideo {
  id: string;
  /** YouTube, Vimeo, or direct .mp4/.webm URL (e.g. from Supabase Storage). */
  url: string;
  caption?: string;
  posterUrl?: string;
}

export interface ProjectProcessStep {
  id: string;
  title: string;
  detail: string;
  imageUrl?: string;
}

/** Named workflow / phase with ordered steps (shown on the case study page). */
export interface ProjectProcess {
  id: string;
  title: string;
  summary?: string;
  steps: ProjectProcessStep[];
}

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
  /** When false, hidden from the public site. Defaults to true. */
  published?: boolean;
  /** Hero / card thumbnail. */
  coverImage?: string;
  images?: ProjectImage[];
  videos?: ProjectVideo[];
  processes?: ProjectProcess[];
  /** inherit = site design system; custom = project-specific overrides */
  designSystem?: ProjectDesignBinding;
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
    tagline: "Hospital visit coordination that respects the patient’s energy — not the group chat.",
    year: "2021–2026",
    role: "Product lead, UX/UI, full-stack build",
    pillars: ["Product Design", "UX/UI Design", "Python", "Data Engineering"],
    status: "in-progress",
    featured: true,
    accent: "purple",
    summary:
      "VZTR Help started as a real problem I lived through as a primary caregiver during the COVID era — then became my UC Berkeley UX/UI capstone, where I pitched the concept, led our team, and mapped patient and visitor flows end to end. Today it is a deployed MVP on the path to hospital-grade visitor coordination: one link, clear rules, no double-booking, and rest when the patient needs quiet.",
    problem:
      "When someone is hospitalized, visitation should help recovery — but it often becomes another job for the patient. Friends and family call the patient, the caregiver, or both (50% of visitors in our research contacted both). Schedules collide with hospital caps and visiting hours. Patients want connection but also rest; visitors show up tired or unannounced; coordinators repeat the same updates dozens of times. Existing visitor-management tools optimize front-desk check-in for buildings — not a patient-centered schedule the person in the bed can actually control.",
    approach: [
      "Grounded the product in lived experience: caregiving for a friend with cancer during COVID, then validated with interviews, surveys, and affinity mapping across timing, hospital friction, feelings, and coordination load.",
      "Led a Berkeley team (research, IA, visual design) through Crazy 8s, “I like / I wish / What if,” and a priority matrix — narrowing to scheduling plus communication in one place.",
      "Designed dual-sided flows: patients set availability and rules; visitors claim slots through a single shared link — inspired by award-winning hospital apps (Providence, Nemours) and class-project-to-company stories like Airbnb’s early design-school origins.",
      "Validated availability UI with moderated tests (67% preferred explicit Available/Unavailable copy over icon-only states) and palette preference tests for warmth and contrast under stress.",
      "Shipped a full-stack MVP (Next.js + Supabase) with slot claiming, capacity checks, and RLS — bridging from academic prototype to something hospitals could eventually offer as a service.",
    ],
    outcomes: [
      "Research-backed problem framing: patients need advance notice, control over rest windows, and relief from being the switchboard.",
      "Documented patient and visitor user flows — from setting hospital rules to confirming a visit — used as the backbone of the case study process timeline.",
      "Deployed MVP at vztr-help.vercel.app — not a Figma-only deck.",
      "Clear product roadmap: hospital sync for accurate visiting info, parking on the visitor side, QR check-in, pre-registration, and front-desk handoff.",
    ],
    stack: [
      "Figma",
      "User research & usability testing",
      "Next.js",
      "TypeScript",
      "Supabase (Postgres + Auth)",
      "Tailwind",
    ],
    links: { live: "https://vztr-help.vercel.app/access" },
    processes: [
      {
        id: "origin",
        title: "Origin & discovery",
        summary:
          "The idea did not start in a classroom — it started at a hospital bedside. During the COVID pandemic I was the main caregiver for a close friend fighting cancer. I hit every friction point our research later confirmed: conflicting hospital rules, coordinating who could visit when, guessing whether she had energy for guests, and fielding calls from well-meaning visitors who did not know the full picture. In UC Berkeley’s UX/UI program I brought that experience into our final team project, pitched Visitor Help, and led the group through research and flow design.",
        steps: [
          {
            id: "origin-1",
            title: "Lived problem → design brief",
            detail:
              "Caregiving during COVID meant navigating visitor limits, stamina swings, and hospital policy changes in real time — while also being the person everyone called for updates.",
          },
          {
            id: "origin-2",
            title: "Team research plan",
            detail:
              "With Kavitha Karunakaran, Janet Limon, Fiorella Bernal, and Rasheem Tareq we ran parallel interview guides for patients and visitors, plus surveys for patients with visitors, patients without visitors, and visitors-only cohorts.",
          },
          {
            id: "origin-3",
            title: "What research surfaced",
            detail:
              "62.5% of visitors scheduled through a friend or coordinator; 50% called both patient and caregiver before visiting. Recurring themes: “I want to know who is coming,” “sometimes I just need rest,” and “coordination exhausts the person who is sick.”",
          },
          {
            id: "origin-4",
            title: "Primary persona — Cameron",
            detail:
              "We synthesized Cameron Williamson: a detail-oriented children’s book illustrator expecting her third child — wants loved ones nearby but needs predictable, manageable visit windows and zero surprise arrivals.",
          },
        ],
      },
      {
        id: "patient-flow",
        title: "Patient user flow",
        summary:
          "The patient (or designated coordinator) stays in control. Hospital rules are captured once; availability is shared through a single link instead of a fragmented group chat.",
        steps: [
          {
            id: "pf-1",
            title: "Open a visit window",
            detail:
              "Patient or caregiver creates a visit period — admission dates, room info when known, and who is allowed to coordinate on their behalf.",
          },
          {
            id: "pf-2",
            title: "Set hospital rules & limits",
            detail:
              "Enter max visitors per slot, visiting hours, and hospital-specific caps (e.g. 1–3 people). Rules propagate to every invite so visitors see constraints before they request time.",
          },
          {
            id: "pf-3",
            title: "Mark availability & rest",
            detail:
              "Block times for rest, procedures, or low-energy days. Usability testing favored explicit “Available / Unavailable” labels over ambiguous icons — 67% of participants chose the text-forward pattern.",
          },
          {
            id: "pf-4",
            title: "Share one link",
            detail:
              "Send a single invite link by text or email. Visitors self-serve scheduling instead of calling the patient repeatedly for “is now okay?”",
          },
          {
            id: "pf-5",
            title: "Review & adjust",
            detail:
              "See who requested which slot, approve or move visits, and pause all incoming requests when recovery requires quiet — without awkward one-off rejections.",
          },
        ],
      },
      {
        id: "visitor-flow",
        title: "Visitor user flow",
        summary:
          "Visitors get clarity before they arrive: rules, timing, parking, and confirmation — reducing the guilt of showing up when the patient is exhausted or lost on campus.",
        steps: [
          {
            id: "vf-1",
            title: "Receive invite",
            detail:
              "Visitor gets a link from the patient or caregiver — replacing the old loop of calling both parties to find out whether a visit is welcome.",
          },
          {
            id: "vf-2",
            title: "Read rules & context",
            detail:
              "View visiting hours, capacity limits, and any notes (e.g. “short visits preferred today”) before picking a time.",
          },
          {
            id: "vf-3",
            title: "Claim a slot",
            detail:
              "Choose an open window; the system prevents double-booking and over-capacity slots so two groups cannot collide in the same period.",
          },
          {
            id: "vf-4",
            title: "Confirm & prepare",
            detail:
              "Receive confirmation with check-in guidance and parking information — lot or garage, validation rules, entrance, and where to go once inside — addressing top visitor pain points from affinity mapping: not knowing where to park, where to go, or who to ask at the hospital.",
          },
          {
            id: "vf-5",
            title: "Check in (roadmap)",
            detail:
              "Future state: QR or kiosk check-in tied to the scheduled visit, aligning with hospital visitor-management systems without putting the burden back on the patient.",
          },
        ],
      },
      {
        id: "design-validation",
        title: "Design & validation",
        summary:
          "We treated Visitor Help like products that outgrow the classroom — the same arc as design-school projects that became real companies: research → narrow scope → test → ship. Competitor analysis (Envoy, SwipedOn, iLobby, etc.) showed strong front-desk tools but a gap for patient-led scheduling.",
        steps: [
          {
            id: "dv-1",
            title: "Ideation & prioritization",
            detail:
              "Crazy 8s, “I like / I wish / What if,” and a priority matrix focused the team on scheduling + communication — deprioritizing nice-to-haves that did not reduce patient load.",
          },
          {
            id: "dv-2",
            title: "Storyboard & IA",
            detail:
              "Storyboarded Cameron’s scenario: overwhelmed before admission, wanting family nearby but not the mental overhead of organizing them. Affinity diagrams clustered timing, hospital navigation, feelings, and coordination pain.",
          },
          {
            id: "dv-3",
            title: "Wireframes → hi-fi prototype",
            detail:
              "Low- and mid-fidelity flows for patient availability and visitor scheduling evolved into a hi-fi Figma prototype with Tajviraj display type, Libre Franklin body, and a warm purple/gold palette tested for contrast and calm.",
          },
          {
            id: "dv-4",
            title: "Usability & preference tests",
            detail:
              "Moderated sessions on availability UI and navigation color combinations. Participants wanted readable states, professional warmth, and less cognitive load — feedback that directly shaped the MVP UI.",
          },
        ],
      },
      {
        id: "product-roadmap",
        title: "From class project to hospital product",
        summary:
          "The capstone proved the concept; the MVP proves I can build it. The north star is a service hospitals offer — integrated with their visitor policies, not another app families discover in crisis.",
        steps: [
          {
            id: "pr-1",
            title: "Shipped MVP",
            detail:
              "Built and deployed VZTR Help with authenticated visits, slot logic, and Postgres row-level security — moving from team prototype to a working product Roberto owns end to end.",
          },
          {
            id: "pr-2",
            title: "Hospital sync",
            detail:
              "VZTR Help will sync with hospitals for accurate visiting information. When a doctor schedules an exam, that time is automatically blocked off. When a doctor decides the patient needs rest, the patient, coordinator, and visitors are notified. The hospital front desk and nurses' desk will automatically have each visitor's information and visiting time ready in their systems.",
          },
          {
            id: "pr-3",
            title: "Arrival experience",
            detail:
              "QR check-in, pre-registration, optional ID scan, and parking details on the visitor confirmation — so front desk staff see expected visitors without the patient re-explaining the schedule.",
          },
          {
            id: "pr-4",
            title: "Vision",
            detail:
              "Hospitals provide VZTR Help as part of admission — patients get control, visitors get clarity (including parking), caregivers get relief. Happy visitors because the system protected the person they came to see.",
          },
        ],
      },
    ],
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
    links: { live: "https://petchmaker.vercel.app/access" },
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
    slug: "rolefit",
    title: "RoleFit",
    tagline: "Honest resume-to-role fit scoring — with the gaps named.",
    year: "2026",
    role: "Applied ML / product",
    pillars: ["AI/ML", "Python", "Product Design"],
    status: "live",
    accent: "gold",
    summary:
      "A focused tool that scores how well a resume matches a job description and lists which important keywords are covered versus missing — transparent TF-IDF, no black-box embeddings.",
    problem:
      "A single similarity number is useless on its own. The actionable question is: what does this resume already cover, and what should it address?",
    approach: [
      "Used TF-IDF cosine similarity (scikit-learn) on purpose — transparent and explainable.",
      "Ranked the job's terms by importance and split them into covered vs. missing buckets.",
      "Wrapped it in a gated web demo and CLI, with tests.",
    ],
    outcomes: [
      "An honest, actionable read on fit — the same honesty-first thinking behind this site's AI advocate.",
      "Private product codebase; public case study and invite-only demo.",
    ],
    stack: ["Python", "scikit-learn", "Next.js demo gate", "pytest"],
    links: { live: "https://rolefit-web.vercel.app/access" },
  },
];

/** Seed data shipped in the repo; overridden by back-office CRM when saved. */
export const defaultProjects = projects;

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function projectsByPillar(pillar: Pillar): Project[] {
  return projects.filter((p) => p.pillars.includes(pillar));
}

export const featuredProjects = projects.filter((p) => p.featured);
