import type { Project } from "@/content/types"

export const nutritionDashboard: Project = {
  id: "project-nutrition-dashboard",
  slug: "nutrition-dashboard",
  contentType: "project",
  title: "Nutrition Dashboard",
  summary:
    "A JSON-driven dashboard used by 20+ dietitians to manage plans for 60,000+ users, with an Aghora integration for real-time dietitian chat, scheduled calls, audio calls and chat history migration.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Integrations"],
  tags: ["React.js", "JSON-driven UI", "Real-time", "Aghora"],
  stack: ["React.js", "JavaScript", "Configuration-driven UI", "Aghora"],
  featured: true,
  visual: { kind: "icon", icon: "layout-dashboard" },
  updatedAt: "2026-10-18",
  sections: {
    problem: null,
    challenge:
      "A JSON-driven UI renders screens from configuration instead of hard-coded components, so the hard part is designing a schema that is flexible enough for new forms and views but still type-safe and validated.",
    contribution: `- Built the JSON-driven UI for the Nutrition Dashboard.
- Integrated Aghora for real-time data and user flows across dietitian chat, scheduled calls, audio calls and chat history migration.`,
    architecture: `\`\`\`text
JSON configuration ──► renderer ──► component registry (inputs, tables, sections)
                                         │
Dietitian actions ──► APIs ◄──► Aghora (chat, scheduled calls, audio calls)
\`\`\``,
    decisions: "Driving the dashboard UI from JSON configuration rather than building every screen by hand.",
    tradeoffs: `- **Configuration-driven vs hand-built screens:** configuration makes new screens fast and consistent, but debugging and edge cases move into the renderer and schema.
- **Schema validation:** validating configuration at load time (for example with Zod) catches broken configs before they reach users.
- **Real-time integration:** a third-party platform (Aghora) saves building chat and calling yourself, but you depend on its SDK, limits and data model, which matters during migrations.`,
    limitations: null,
    impact: "Used by 20+ dietitians to manage plans for 60,000+ users.",
    lessons: null,
  },
  relatedArticles: [],
  todos: [
    "What the JSON configuration describes (forms, plans, layouts) and who edits it.",
    "How the chat history migration was planned and verified.",
    "Challenges, limitations and lessons learned.",
  ],
}
