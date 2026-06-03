export const PLATFORM_RESEARCH = [
  { id: "goal", label: "What is your main goal for this portfolio?", type: "select" as const, options: ["Get hired", "Freelance clients", "Showcase side projects", "Personal brand", "Other"], required: true },
  { id: "role", label: "How would you describe yourself in one line?", type: "text" as const, required: true },
  { id: "audience", label: "Who is the primary audience?", type: "text" as const, required: true },
  { id: "style", label: "What visual vibe do you want?", type: "select" as const, options: ["Dark & premium", "Light & minimal", "Bold & colorful", "Editorial", "Not sure yet"], required: true },
  { id: "projects_count", label: "How many projects will you showcase initially?", type: "select" as const, options: ["1–2", "3–5", "6+"], required: true },
  { id: "advocate", label: "Would an AI advocate on your site interest you?", type: "select" as const, options: ["Yes", "Maybe later", "No"], required: true },
  { id: "timeline", label: "When do you want to launch?", type: "select" as const, options: ["This week", "This month", "Just exploring"], required: true },
  { id: "referral", label: "How did you hear about Humanberto Studio?", type: "text" as const, required: false },
  { id: "feedback", label: "Anything else for our product roadmap?", type: "textarea" as const, required: false },
];
