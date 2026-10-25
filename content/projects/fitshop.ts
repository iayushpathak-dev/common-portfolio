import type { Project } from "@/content/types"

export const fitshop: Project = {
  id: "project-fitshop",
  slug: "fitshop",
  contentType: "project",
  title: "Fitshop",
  aka: "FITSHOP membership platform",
  summary:
    "The FITPASS membership platform, rebuilt on the Next.js App Router using React Server Components and Server Actions.",
  publicationStatus: "published",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App", "Architecture"],
  tags: ["Next.js App Router", "Server Components", "Server Actions"],
  stack: ["Next.js App Router", "React Server Components", "Server Actions", "React.js"],
  visual: { kind: "icon", icon: "shopping-bag" },
  updatedAt: "2026-10-18",
  sections: {
    problem: null,
    challenge:
      "Moving an existing product to the App Router changes where code runs: data fetching moves into Server Components, mutations into Server Actions, and interactivity has to be isolated in Client Components.",
    contribution: "I rebuilt FITSHOP, the membership platform, on the App Router using Server Components and Server Actions.",
    architecture: `\`\`\`text
Request ──► Server Components (fetch data on the server, render HTML)
                └─ Client Components (interactive islands)
Form submit ──► Server Action (validate, mutate, revalidate) ──► updated UI
\`\`\``,
    decisions: "Using Server Components for data-heavy rendering and Server Actions for mutations, as part of the App Router rebuild.",
    tradeoffs: `- **Server Components** send less JavaScript and keep data access on the server, but can't use state or effects; anything interactive needs a Client Component boundary.
- **Server Actions** remove hand-written API routes for forms, but they are still public HTTP endpoints, so they need the same validation and authorisation as an API.
- **Incremental migration vs rewrite:** the Pages and App Routers can coexist, which allows moving route by route instead of a big-bang rewrite.`,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [
    "Why FITSHOP was rebuilt (what was wrong with the previous version?).",
    "Was the migration incremental or a full rewrite, and what was hardest about it?",
    "Any outcomes (performance, bundle size, developer experience) you can share.",
  ],
}
