import { describe, expect, it } from "vitest"

import { ARTICLES, PROJECTS } from "@/content"
import { FAQ } from "@/content/faq"
import { chunkDocument } from "@/lib/rag/chunk"
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

describe("FAQ knowledge", () => {
  const faqDocs = docs.filter((d) => d.contentType === "faq")
  const publicPaths = new Set([
    "/about",
    "/experience",
    "/resume",
    "/projects",
    "/blog",
    ...PROJECTS.filter((p) => p.publicationStatus === "published").map((p) => `/projects/${p.slug}`),
    ...ARTICLES.filter((a) => a.publicationStatus === "published").map((a) => `/blog/${a.slug}`),
  ])

  it("indexes every FAQ entry as its own document", () => {
    expect(faqDocs.length).toBe(FAQ.length)
    for (const d of faqDocs) expect(d.id).toMatch(/^faq-[a-z0-9-]+$/)
  })

  it("cites only pages that exist publicly", () => {
    for (const entry of FAQ) expect(publicPaths.has(entry.href), entry.id).toBe(true)
  })

  it("embeds the question, its variants and the answer together", () => {
    const doc = faqDocs.find((d) => d.id === "faq-who-is-ayush")!
    expect(doc.text).toContain("Question: Who is Ayush Pathak?")
    expect(doc.text).toContain("Tell me about yourself")
    expect(doc.text).toContain("Answer: ")
  })

  it("keeps each question and its answer in a single chunk", () => {
    for (const d of faqDocs) expect(chunkDocument(d).length, d.id).toBe(1)
  })
})
