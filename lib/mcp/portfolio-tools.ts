import { publishedProjects } from "@/content"
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
    url: absoluteUrl(`/projects/${p.slug}`),
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
    url: absoluteUrl(`/projects/${project.slug}`),
    // Only filled-in sections; `todos` (author-only notes) are never exposed.
    caseStudy: Object.fromEntries(Object.entries(project.sections).filter(([, text]) => text)),
  }
}
