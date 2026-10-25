import type { Project } from "@/content/types"

// Draft: hidden in production until the TODOs are answered and the status is "published".
export const claudeCodeWorkflow: Project = {
  id: "project-claude-code-workflow",
  slug: "claude-code-workflow",
  contentType: "project",
  title: "Claude Code Engineering Workflow",
  summary:
    "How I use Claude Code for day-to-day engineering, including on this portfolio: repository instructions, small reviewed changes, and CI checks on every change.",
  publicationStatus: "draft",
  evidence: "Hands-on Implementation",
  organization: "Personal practice",
  period: "2026",
  categories: ["AI","Architecture"],
  tags: ["Claude Code","AI-assisted Engineering","CI"],
  stack: [],
  visual: { kind: "icon", icon: "terminal" },
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
  relatedArticles: ["article-engineering-with-claude-code"],
  todos: [
    "Describe your actual workflow: how you plan tasks, review changes and decide what to delegate.",
    "Confirm what this repository demonstrates (AGENTS.md instructions, CI running lint, typecheck and build).",
    "Limitations you have hit and lessons learned.",
  ],
}
