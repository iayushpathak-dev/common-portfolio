import type { Project } from "@/content/types"

// Draft: hidden in production until the TODOs are answered and the status is "published".
export const corporateDashboardIntegrations: Project = {
  id: "project-corporate-dashboard-integrations",
  slug: "corporate-dashboard-integrations",
  contentType: "project",
  title: "Corporate Dashboard and Integrations",
  summary:
    "Dashboards and integrations for Fitpass corporate clients.",
  publicationStatus: "draft",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App","Integrations"],
  tags: ["Dashboards","Integrations","Corporate"],
  stack: [],
  visual: { kind: "icon", icon: "plug" },
  updatedAt: "2026-10-18",
  sections: {
    problem: null,
    challenge: null,
    contribution: null,
    architecture: null,
    decisions: null,
    tradeoffs: null,
    limitations: null,
    impact: null,
    lessons: null,
  },
  relatedArticles: [],
  todos: [
    "Who uses this dashboard and what it shows.",
    "Which systems it integrates with (HRMS, SSO, payroll, other) and how.",
    "Your contribution, architecture, decisions, challenges and outcomes.",
  ],
}
