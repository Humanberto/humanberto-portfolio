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
  /** Drop your headshot at apps/web/public/roberto.jpg (square, 800px+). */
  photo: "/roberto.jpg",
} as const;

export const navLinks: { href: string; label: string }[] = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/chat", label: "AI Advocate" },
  { href: "/contact", label: "Contact" },
];
