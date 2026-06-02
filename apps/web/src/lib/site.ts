export const site = {
  name: "Roberto Pocas Leitao",
  shortName: "Humanberto",
  role: "Product Designer & Python Developer",
  tagline: "Turning messy processes into clean, AI-powered experiences.",
  email: "humanberto@gmail.com",
  phone: "619-819-5566",
  location: "San Diego, CA",
  linkedin: "https://www.linkedin.com/in/robertopleitao",
  github: "https://github.com/humanberto",
  /** Processed headshot in public/ (see scripts/prepare-portrait.py). */
  photo: "/roberto.webp?v=2",
} as const;

export const fitCheckHref = "/chat#fit-check" as const;

export const navLinks: { href: string; label: string }[] = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/chat", label: "AI Advocate" },
  { href: fitCheckHref, label: "Score my fit" },
  { href: "/contact", label: "Contact" },
];
