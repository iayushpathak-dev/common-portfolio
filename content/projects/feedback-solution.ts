import type { Project } from "@/content/types"

// Draft: hidden in production until the TODOs are answered and the status is "published".
export const feedbackSolution: Project = {
  id: "project-feedback-solution",
  slug: "feedback-solution",
  contentType: "project",
  title: "Feedback Solution",
  summary:
    "A feedback collection solution at Fitpass.",
  publicationStatus: "draft",
  evidence: "Professional Experience",
  organization: "FITPASS",
  period: "Nov 2022 – Present",
  categories: ["Web App"],
  tags: ["Feedback","Forms"],
  stack: [],
  visual: { kind: "icon", icon: "message-square" },
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
    "What feedback it collects, from whom, and where it is used.",
    "How it was built and integrated.",
    "Your contribution, challenges and outcomes.",
  ],
}
