import type { Project } from "@/content/types"

// Draft: hidden in production until the TODOs are answered and the status is "published".
export const marketingLandingPages: Project = {
  id: "project-marketing-landing-pages",
  slug: "marketing-landing-pages",
  contentType: "project",
  title: "Marketing Landing Pages",
  summary:
    "Landing pages for Fitpass marketing campaigns.",
  publicationStatus: "draft",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App","Performance"],
  tags: ["Landing Pages","SEO","Performance"],
  stack: [],
  visual: { kind: "icon", icon: "megaphone" },
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
    "Which campaigns or pages, and how they were built (shared components, templates, CMS).",
    "How performance and SEO were handled, and how analytics/conversion tracking worked.",
    "Your contribution and any outcomes you can share.",
  ],
}
