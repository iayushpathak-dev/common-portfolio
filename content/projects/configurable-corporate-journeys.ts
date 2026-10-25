import type { Project } from "@/content/types"

// Draft: hidden in production until the TODOs are answered and the status is "published".
export const configurableCorporateJourneys: Project = {
  id: "project-configurable-corporate-journeys",
  slug: "configurable-corporate-journeys",
  contentType: "project",
  title: "Configuration-Driven Corporate Onboarding Journeys",
  summary:
    "Configurable onboarding and user journeys for Fitpass corporate clients, where each client's flow is defined by configuration instead of custom code.",
  publicationStatus: "draft",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App","Architecture"],
  tags: ["Configuration-driven UI","Onboarding","Corporate"],
  stack: [],
  visual: { kind: "icon", icon: "settings" },
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
    "Confirm this description: what is configured per corporate client (steps, fields, branding, eligibility)?",
    "Where the configuration lives and who edits it.",
    "Your contribution, architecture, decisions, challenges and outcomes.",
    "Is this the same work as Partners Studio or the Nutrition Dashboard's JSON-driven UI? If so, merge it there.",
  ],
}
