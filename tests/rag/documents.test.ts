import { describe, expect, it } from "vitest"

import { ARTICLES, PROJECTS } from "@/content"
import { buildKnowledgeDocuments, documentProblem } from "@/lib/rag/documents"

const docs = buildKnowledgeDocuments()

describe("buildKnowledgeDocuments", () => {
  it("contains only published documents with unique ids and absolute urls", () => {
    expect(docs.length).toBeGreaterThan(0)
    expect(new Set(docs.map((d) => d.id)).size).toBe(docs.length)
    for (const d of docs) {
      expect(d.publicationStatus).toBe("published")
      expect(documentProblem(d)).toBeNull()
      expect(d.url).toMatch(/^https:\/\//)
    }
  })

  it("never includes draft or planned projects and articles", () => {
    const ids = new Set(docs.map((d) => d.id))
    for (const item of [...PROJECTS, ...ARTICLES]) {
      if (item.publicationStatus !== "published") expect(ids.has(item.id)).toBe(false)
    }
  })

  it("includes every published project and article", () => {
    const ids = new Set(docs.map((d) => d.id))
    for (const item of [...PROJECTS, ...ARTICLES]) {
      if (item.publicationStatus === "published") expect(ids.has(item.id)).toBe(true)
    }
  })

  it("leaves out TODO notes, phone numbers and secrets", () => {
    const all = docs.map((d) => d.text).join("\n")
    for (const p of PROJECTS) for (const todo of p.todos) expect(all).not.toContain(todo)
    expect(all).not.toMatch(/\+91|7906190479/)
    expect(all).not.toMatch(/GOOGLE_GENERATIVE_AI_API_KEY|UPSTASH_|RAG_ADMIN_SECRET/)
  })

  it("leaves out interview-preparation material (kept privately in docs/)", () => {
    const all = docs.map((d) => d.text).join("\n")
    expect(all).not.toMatch(/interview/i)
    for (const a of ARTICLES) expect(a.body).not.toMatch(/^#+\s*interview/im)
  })

  it("covers the profile: about, current employer, skills and education", () => {
    const types = new Set(docs.map((d) => d.contentType))
    for (const t of ["profile", "experience", "skills", "education"]) expect(types.has(t as never)).toBe(true)
    expect(docs.find((d) => d.id === "experience-fitpass")?.text).toContain("Nov 2022")
  })
})

describe("documentProblem", () => {
  const valid = docs[0]

  it.each([
    [{ ...valid, id: "" }, "missing or invalid id"],
    [{ ...valid, id: "Bad ID!" }, "missing or invalid id"],
    [{ ...valid, title: " " }, "missing title"],
    [{ ...valid, url: "/relative" }, "missing or relative url"],
    [{ ...valid, text: "" }, "empty text"],
    [{ ...valid, publicationStatus: "draft" as const }, "status is draft"],
  ])("rejects malformed documents (%#)", (doc, reason) => {
    expect(documentProblem(doc)).toBe(reason)
  })
})
