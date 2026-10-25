// Schemas for portfolio content. Everything under content/ is plain data (no React), so it can
// be rendered by the site, passed to client components and indexed for the AI assistant.

/**
 * - published: public on the site, in the sitemap and in the assistant's knowledge base.
 * - draft: visible only in `next dev`, with a Draft badge. Never public, never indexed.
 * - planned: listed publicly as an upcoming topic (no detail page, never indexed).
 */
export type PublicationStatus = "published" | "draft" | "planned"

/** How much first-hand experience a piece of content reflects. Shown as a label on the site. */
export type EvidenceLabel =
  | "Professional Experience"
  | "Hands-on Implementation"
  | "Experiment"
  | "Learning Notes"
  | "Planned"

/** Icons are referenced by name so content stays serialisable; components map names to icons. */
export type IconKey =
  | "smartphone"
  | "layers"
  | "gauge"
  | "shopping-bag"
  | "layout-dashboard"
  | "scan-face"
  | "ticket"
  | "truck"
  | "sparkles"
  | "settings"
  | "plug"
  | "megaphone"
  | "message-square"
  | "app-window"
  | "terminal"
  | "brain"
  | "message-circle"
  | "cpu"
  | "database"
  | "search"
  | "refresh"
  | "git-branch"
  | "wrench"
  | "shield"
  | "activity"
  | "flask"
  | "bot"
  | "atom"
  | "code"
  | "type"
  | "bug"
  | "boxes"

export type ProjectCategory = "Web App" | "PWA" | "Architecture" | "Performance" | "Integrations" | "AI"

export type ProjectVisual =
  | { kind: "icon"; icon: IconKey }
  | { kind: "score"; score: number; display: string; label: string }
  | { kind: "diagram"; clients: string[]; hub: string; backend: string }

/**
 * A project case study. Section bodies are Markdown. A section set to null is not shown:
 * use null (plus an entry in `todos`) instead of guessing.
 */
export type Project = {
  id: string
  slug: string
  contentType: "project"
  title: string
  /** Internal or product name, when the title is descriptive. */
  aka?: string
  summary: string
  publicationStatus: PublicationStatus
  evidence: EvidenceLabel
  organization: string
  period?: string
  categories: ProjectCategory[]
  tags: string[]
  stack: string[]
  featured?: boolean
  visual: ProjectVisual
  links?: { github?: string; live?: string }
  /** ISO date (YYYY-MM-DD) of the last content change. */
  updatedAt: string
  sections: {
    problem: string | null
    challenge: string | null
    contribution: string | null
    architecture: string | null
    decisions: string | null
    /** General engineering trade-offs for this kind of system; not a record of decisions. */
    tradeoffs: string | null
    limitations: string | null
    impact: string | null
    lessons: string | null
  }
  relatedArticles: string[]
  /** Details only the author can confirm. Shown in development only. */
  todos: string[]
  sourceUrls?: string[]
}

export type ArticleCategory =
  | "AI Engineering"
  | "React"
  | "Next.js"
  | "TypeScript"
  | "Architecture"
  | "Performance"
  | "Engineering Workflow"

export type SourceLink = { title: string; url: string }

export type Article = {
  id: string
  slug: string
  contentType: "article"
  title: string
  summary: string
  category: ArticleCategory
  tags: string[]
  publicationStatus: PublicationStatus
  learningStatus: EvidenceLabel
  /** ISO date (YYYY-MM-DD). */
  updatedAt: string
  icon: IconKey
  featured?: boolean
  /** Markdown body; empty for planned articles. */
  body: string
  sourceUrls: SourceLink[]
  relatedProjects: string[]
  relatedArticles: string[]
}
