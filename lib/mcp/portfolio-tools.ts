import { articleHref, projectHref, publishedArticles, publishedProjects } from "@/content"
import type { ArticleCategory } from "@/content/types"
import { PORTFOLIO } from "@/lib/portfolio"
import { absoluteUrl } from "@/lib/site"

/**
 * Data behind the MCP tools in app/api/mcp/route.ts.
 *
 * Kept as plain functions (no MCP types) so they are easy to test and reuse. Only published
 * content is exposed: drafts and planned items never leave the site through MCP.
 */

export function getProfile() {
  const { profile, experience, skillGroups, education } = PORTFOLIO
  return {
    name: profile.name,
    role: profile.role,
    location: profile.location,
    totalExperience: profile.totalExperience,
    summary: profile.summary,
    aiFocus: profile.aiFocus,
    resumeUrl: absoluteUrl(profile.resumeUrl),
    portfolioUrl: absoluteUrl("/"),
    experience: experience.map(({ company, role, period, summary, technologies }) => ({
      company,
      role,
      period,
      summary,
      technologies,
    })),
    skills: Object.fromEntries(skillGroups.map((group) => [group.title, group.items])),
    education: education.map(({ degree, place }) => ({ degree, place })),
  }
}

export function listProjects() {
  return publishedProjects().map((p) => ({
    slug: p.slug,
    title: p.title,
    organization: p.organization,
    summary: p.summary,
    tags: p.tags,
    url: absoluteUrl(projectHref(p.slug)),
  }))
}

export function getProjectDetails(slug: string) {
  const project = publishedProjects().find((p) => p.slug === slug)
  if (!project) return null
  return {
    slug: project.slug,
    title: project.title,
    organization: project.organization,
    summary: project.summary,
    period: project.period ?? null,
    evidence: project.evidence,
    categories: project.categories,
    stack: project.stack,
    url: absoluteUrl(projectHref(project.slug)),
    // Only filled-in sections; `todos` (author-only notes) are never exposed.
    caseStudy: Object.fromEntries(Object.entries(project.sections).filter(([, text]) => text)),
  }
}

export const ARTICLE_CATEGORIES = [
  "AI Engineering",
  "React",
  "Next.js",
  "TypeScript",
  "Architecture",
  "Performance",
  "Engineering Workflow",
] as const satisfies readonly ArticleCategory[]

/** Published articles only, newest first. Drafts and planned topics are never listed. */
export function listArticles(category?: ArticleCategory) {
  return publishedArticles()
    .filter((a) => !category || a.category === category)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      category: a.category,
      tags: a.tags,
      label: a.learningStatus,
      updatedAt: a.updatedAt,
      url: absoluteUrl(articleHref(a.slug)),
    }))
}

/** One published article in full (Markdown), or null for drafts and unknown slugs. */
export function getArticle(slug: string) {
  const article = publishedArticles().find((a) => a.slug === slug)
  if (!article || !article.body) return null
  return {
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    category: article.category,
    tags: article.tags,
    label: article.learningStatus,
    updatedAt: article.updatedAt,
    url: absoluteUrl(articleHref(article.slug)),
    body: article.body,
    sources: article.sourceUrls,
  }
}
