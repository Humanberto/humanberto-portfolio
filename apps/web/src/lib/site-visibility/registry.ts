/** Which site templates a feature applies to. */
export type SiteFeatureScope = "bootstrap" | "tenant" | "both";

export type SiteFeatureDef = {
  id: string;
  label: string;
  group: string;
  description: string;
  scopes: SiteFeatureScope[];
  /** Visible when no override is saved. */
  defaultVisible: boolean;
};

export const SITE_FEATURE_GROUPS = [
  "Navigation",
  "Home page",
  "Footer",
  "Pages",
] as const;

export type SiteFeatureGroup = (typeof SITE_FEATURE_GROUPS)[number];

export const SITE_FEATURES: SiteFeatureDef[] = [
  // Navigation
  {
    id: "nav.work",
    label: "Work link",
    group: "Navigation",
    description: "Work nav item and header links to the portfolio.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "nav.studio",
    label: "Studio link",
    group: "Navigation",
    description: "Studio nav item (Humanberto.com only).",
    scopes: ["bootstrap"],
    defaultVisible: true,
  },
  {
    id: "nav.about",
    label: "About link",
    group: "Navigation",
    description: "About page in the main navigation.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "nav.chat",
    label: "AI Advocate link",
    group: "Navigation",
    description: "Chat / AI Advocate nav item.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "nav.fit-check",
    label: "Score my fit link",
    group: "Navigation",
    description: "Fit-check nav item and header button.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "nav.contact",
    label: "Contact link",
    group: "Navigation",
    description: "Contact page in the main navigation.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "nav.header.advocate",
    label: "Header advocate button",
    group: "Navigation",
    description: "Primary “Talk to my advocate” button in the header.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "nav.owner-link",
    label: "Owner login link",
    group: "Navigation",
    description: "Subtle “Owner” link to My Office in the header.",
    scopes: ["tenant"],
    defaultVisible: true,
  },

  // Home
  {
    id: "home.hero",
    label: "Hero section",
    group: "Home page",
    description: "Top hero with name, tagline, and primary CTAs.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "home.hero.badge",
    label: "Hero role badge",
    group: "Home page",
    description: "Role badge above the hero headline.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "home.hero.intro",
    label: "Hero intro text",
    group: "Home page",
    description: "Paragraph under the hero headline.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "home.hero.cta.advocate",
    label: "Hero advocate button",
    group: "Home page",
    description: "“Talk to my AI advocate” button in the hero.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "home.hero.cta.fit-check",
    label: "Hero fit-check button",
    group: "Home page",
    description: "“Score my fit” button in the hero.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "home.hero.cta.work",
    label: "Hero work button",
    group: "Home page",
    description: "“See the work” button in the hero.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "home.hero.email-link",
    label: "Hero email / contact line",
    group: "Home page",
    description: "Email or contact fallback under hero buttons.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "home.pillars",
    label: "Skill pillars section",
    group: "Home page",
    description: "“What I do” pillar cards (Humanberto.com).",
    scopes: ["bootstrap"],
    defaultVisible: true,
  },
  {
    id: "home.about-section",
    label: "About preview section",
    group: "Home page",
    description: "Focus / audience cards on tenant home pages.",
    scopes: ["tenant"],
    defaultVisible: true,
  },
  {
    id: "home.myoffice-card",
    label: "My Office promo card",
    group: "Home page",
    description: "“Make it yours” card linking to My Office.",
    scopes: ["tenant"],
    defaultVisible: true,
  },
  {
    id: "home.projects",
    label: "Featured projects section",
    group: "Home page",
    description: "Selected work / project grid on the home page.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "home.projects.view-all",
    label: "View all projects link",
    group: "Home page",
    description: "“All projects →” link above the project grid.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "home.advocate-band",
    label: "Advocate promo band",
    group: "Home page",
    description: "Large AI Advocate call-to-action section.",
    scopes: ["both"],
    defaultVisible: true,
  },

  // Footer
  {
    id: "footer.explore",
    label: "Explore links column",
    group: "Footer",
    description: "Footer column mirroring main navigation.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "footer.tagline",
    label: "Footer tagline",
    group: "Footer",
    description: "Tagline under the site name in the footer.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "footer.email",
    label: "Footer email link",
    group: "Footer",
    description: "Email link in the Connect column.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "footer.linkedin",
    label: "Footer LinkedIn link",
    group: "Footer",
    description: "LinkedIn link in the Connect column.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "footer.github",
    label: "Footer GitHub link",
    group: "Footer",
    description: "GitHub link in the Connect column.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "footer.owner-link",
    label: "Footer owner link",
    group: "Footer",
    description: "Site owner link to My Office.",
    scopes: ["tenant"],
    defaultVisible: true,
  },
  {
    id: "footer.terms",
    label: "Footer terms link",
    group: "Footer",
    description: "Terms of service link.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "footer.privacy",
    label: "Footer privacy link",
    group: "Footer",
    description: "Privacy policy link.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "footer.built-with",
    label: "Built with credit",
    group: "Footer",
    description: "“Built with Next.js…” line (Humanberto.com).",
    scopes: ["bootstrap"],
    defaultVisible: true,
  },

  // Pages
  {
    id: "page.work",
    label: "Work page",
    group: "Pages",
    description: "Entire /work section — hidden pages return 404.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "page.about",
    label: "About page",
    group: "Pages",
    description: "Entire /about page.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "page.contact",
    label: "Contact page",
    group: "Pages",
    description: "Entire /contact page.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "page.chat",
    label: "AI Advocate page",
    group: "Pages",
    description: "Entire /chat page.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "page.studio",
    label: "Studio page",
    group: "Pages",
    description: "Public /studio page (Humanberto.com only).",
    scopes: ["bootstrap"],
    defaultVisible: true,
  },
  {
    id: "page.privacy",
    label: "Privacy page",
    group: "Pages",
    description: "Privacy policy page.",
    scopes: ["both"],
    defaultVisible: true,
  },
  {
    id: "page.terms",
    label: "Terms page",
    group: "Pages",
    description: "Terms of service page.",
    scopes: ["both"],
    defaultVisible: true,
  },
];

export type SiteFeatureId = (typeof SITE_FEATURES)[number]["id"];

export function featuresForScope(scope: "bootstrap" | "tenant"): SiteFeatureDef[] {
  return SITE_FEATURES.filter(
    (f) => f.scopes.includes(scope) || f.scopes.includes("both"),
  );
}

export function featureById(id: string): SiteFeatureDef | undefined {
  return SITE_FEATURES.find((f) => f.id === id);
}

/** Map marketing nav hrefs to visibility feature ids. */
export const BOOTSTRAP_NAV_FEATURE: Record<string, SiteFeatureId> = {
  "/work": "nav.work",
  "/studio": "nav.studio",
  "/about": "nav.about",
  "/chat": "nav.chat",
  "/chat#fit-check": "nav.fit-check",
  "/contact": "nav.contact",
};

/** Map tenant nav href suffixes to visibility feature ids. */
export function tenantNavFeature(segment: string): SiteFeatureId | null {
  if (segment.endsWith("/work") || segment.includes("/work/")) return "nav.work";
  if (segment.endsWith("/about")) return "nav.about";
  if (segment.endsWith("/chat")) return "nav.chat";
  if (segment.includes("#fit-check")) return "nav.fit-check";
  if (segment.endsWith("/contact")) return "nav.contact";
  return null;
}
