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
