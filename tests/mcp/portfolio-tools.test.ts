import { describe, expect, it } from "vitest"

import { PROJECTS } from "@/content"
import { getProfile, getProjectDetails, listProjects } from "@/lib/mcp/portfolio-tools"

describe("MCP portfolio tools", () => {
  it("get_profile returns the core profile with absolute links", () => {
    const profile = getProfile()
    expect(profile.name).toBe("Ayush Pathak")
    expect(profile.experience.length).toBeGreaterThan(0)
    expect(profile.resumeUrl).toMatch(/^https?:\/\/.+\/resume\.pdf$/)
  })

  it("list_projects exposes only published projects", () => {
    const listed = listProjects().map((p) => p.slug)
    const published = PROJECTS.filter((p) => p.publicationStatus === "published").map((p) => p.slug)
    expect(listed.sort()).toEqual(published.sort())
  })

  it("get_project returns details for a published project", () => {
    const [first] = listProjects()
    const details = getProjectDetails(first.slug)
    expect(details?.title).toBe(first.title)
    expect(details?.url).toContain(`/projects/${first.slug}`)
  })

  it("get_project never returns drafts or unknown slugs", () => {
    expect(getProjectDetails("does-not-exist")).toBeNull()
    for (const draft of PROJECTS.filter((p) => p.publicationStatus !== "published")) {
      expect(getProjectDetails(draft.slug)).toBeNull()
    }
  })

  it("get_project never leaks author-only todos or empty sections", () => {
    for (const { slug } of listProjects()) {
      const details = getProjectDetails(slug)!
      expect(details).not.toHaveProperty("todos")
      expect(Object.values(details.caseStudy).every(Boolean)).toBe(true)
    }
  })
})

describe("MCP article tools", () => {
  it("list_articles returns only published articles, newest first", async () => {
    const { ARTICLES } = await import("@/content")
    const { listArticles } = await import("@/lib/mcp/portfolio-tools")
    const listed = listArticles()
    const published = ARTICLES.filter((a) => a.publicationStatus === "published").map((a) => a.slug)
    expect(listed.map((a) => a.slug).sort()).toEqual(published.sort())
    const dates = listed.map((a) => a.updatedAt)
    expect([...dates].sort().reverse()).toEqual(dates)
  })

  it("list_articles filters by category", async () => {
    const { listArticles } = await import("@/lib/mcp/portfolio-tools")
    for (const a of listArticles("Next.js")) expect(a.category).toBe("Next.js")
  })

  it("get_article never returns drafts, planned topics or unknown slugs", async () => {
    const { ARTICLES } = await import("@/content")
    const { getArticle } = await import("@/lib/mcp/portfolio-tools")
    expect(getArticle("does-not-exist")).toBeNull()
    for (const a of ARTICLES.filter((x) => x.publicationStatus !== "published")) {
      expect(getArticle(a.slug)).toBeNull()
    }
  })

  it("get_article returns the full body for a published article", async () => {
    const { getArticle, listArticles } = await import("@/lib/mcp/portfolio-tools")
    const [first] = listArticles()
    if (!first) return
    const article = getArticle(first.slug)
    expect(article?.body.length).toBeGreaterThan(100)
    expect(article?.url).toContain(`/blog/${first.slug}`)
  })
})
