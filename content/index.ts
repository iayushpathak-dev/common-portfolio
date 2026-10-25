import { ARTICLES } from "@/content/articles"
import { aiPortfolioAssistant } from "@/content/projects/ai-portfolio-assistant"
import { backendForFrontend } from "@/content/projects/backend-for-frontend"
import { claudeCodeWorkflow } from "@/content/projects/claude-code-workflow"
import { configurableCorporateJourneys } from "@/content/projects/configurable-corporate-journeys"
import { corporateDashboardIntegrations } from "@/content/projects/corporate-dashboard-integrations"
import { feedbackSolution } from "@/content/projects/feedback-solution"
import { fitpassCorporatePwa } from "@/content/projects/fitpass-corporate-pwa"
import { fitpassWebsiteRendering } from "@/content/projects/fitpass-website-rendering"
import { fitshop } from "@/content/projects/fitshop"
import { livenessVerification } from "@/content/projects/liveness-verification"
import { logitrack } from "@/content/projects/logitrack"
import { marketingLandingPages } from "@/content/projects/marketing-landing-pages"
import { nativeAppWebviewIntegration } from "@/content/projects/native-app-webview-integration"
import { nutritionDashboard } from "@/content/projects/nutrition-dashboard"
import { qtickets } from "@/content/projects/qtickets"
import type { Article, Project, PublicationStatus } from "@/content/types"

export type { Article, Project } from "@/content/types"

/** Display order on the Projects page. */
export const PROJECTS: Project[] = [
  fitpassCorporatePwa,
  backendForFrontend,
  fitpassWebsiteRendering,
  nutritionDashboard,
  aiPortfolioAssistant,
  fitshop,
  livenessVerification,
  configurableCorporateJourneys,
  corporateDashboardIntegrations,
  marketingLandingPages,
  feedbackSolution,
  nativeAppWebviewIntegration,
  claudeCodeWorkflow,
  qtickets,
  logitrack,
]

export { ARTICLES }

const SHOW_DRAFTS = process.env.NODE_ENV === "development"

/** Whether a status may be shown on the site in the current environment. */
export function isVisible(status: PublicationStatus) {
  return status === "published" || status === "planned" || (status === "draft" && SHOW_DRAFTS)
}

/** Whether an item gets its own detail page (planned items don't). */
export function hasPage(item: { publicationStatus: PublicationStatus }) {
  return item.publicationStatus !== "planned" && isVisible(item.publicationStatus)
}

export const projectHref = (slug: string) => `/projects/${slug}`
export const articleHref = (slug: string) => `/blog/${slug}`

export function visibleProjects() {
  return PROJECTS.filter((p) => isVisible(p.publicationStatus) && p.publicationStatus !== "planned")
}

/** Newest first; planned topics go last. */
export function visibleArticles() {
  return ARTICLES.filter((a) => isVisible(a.publicationStatus)).sort((a, b) => {
    const plannedA = a.publicationStatus === "planned" ? 1 : 0
    const plannedB = b.publicationStatus === "planned" ? 1 : 0
    return plannedA - plannedB || b.updatedAt.localeCompare(a.updatedAt)
  })
}

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug && hasPage(p))
export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug && hasPage(a))

/** Content that is public and may be indexed for search engines and the AI assistant. */
export const publishedProjects = () => PROJECTS.filter((p) => p.publicationStatus === "published")
export const publishedArticles = () => ARTICLES.filter((a) => a.publicationStatus === "published")

/** Articles linked to a project in either direction, visible ones only. */
export function relatedArticlesForProject(project: Project) {
  return ARTICLES.filter(
    (a) => hasPage(a) && (project.relatedArticles.includes(a.id) || a.relatedProjects.includes(project.id)),
  )
}

/** Projects linked to an article in either direction, visible ones only. */
export function relatedProjectsForArticle(article: Article) {
  return PROJECTS.filter(
    (p) => hasPage(p) && (article.relatedProjects.includes(p.id) || p.relatedArticles.includes(article.id)),
  )
}

export function relatedArticlesForArticle(article: Article) {
  return ARTICLES.filter(
    (a) =>
      a.id !== article.id &&
      hasPage(a) &&
      (article.relatedArticles.includes(a.id) || a.relatedArticles.includes(article.id)),
  )
}

/** What a project card needs: small and serialisable, so it can be passed to client components. */
export type ProjectSummary = Pick<
  Project,
  | "id"
  | "slug"
  | "title"
  | "aka"
  | "summary"
  | "publicationStatus"
  | "evidence"
  | "organization"
  | "categories"
  | "tags"
  | "featured"
  | "visual"
  | "links"
> & { href: string }

export function toProjectSummary(p: Project): ProjectSummary {
  const { id, slug, title, aka, summary, publicationStatus, evidence, organization, categories, tags, featured, visual, links } = p
  return { id, slug, title, aka, summary, publicationStatus, evidence, organization, categories, tags, featured, visual, links, href: projectHref(slug) }
}

/** What an article card needs (no body). `href` is null for planned topics. */
export type ArticleSummary = Pick<
  Article,
  "id" | "slug" | "title" | "summary" | "category" | "tags" | "publicationStatus" | "learningStatus" | "updatedAt" | "icon" | "featured"
> & { href: string | null; readMinutes: number }

export function toArticleSummary(a: Article): ArticleSummary {
  const { id, slug, title, summary, category, tags, publicationStatus, learningStatus, updatedAt, icon, featured } = a
  return {
    id,
    slug,
    title,
    summary,
    category,
    tags,
    publicationStatus,
    learningStatus,
    updatedAt,
    icon,
    featured,
    href: hasPage(a) ? articleHref(slug) : null,
    readMinutes: readMinutes(a.body),
  }
}

/** Rough reading time for a Markdown body (about 220 words per minute). */
export function readMinutes(body: string) {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220))
}

