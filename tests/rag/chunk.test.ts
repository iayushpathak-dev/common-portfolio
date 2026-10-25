import { describe, expect, it } from "vitest"

import { chunkDocument, packParagraphs, splitParagraphs, splitSections } from "@/lib/rag/chunk"
import type { KnowledgeDocument } from "@/lib/rag/types"

const doc = (text: string, overrides: Partial<KnowledgeDocument> = {}): KnowledgeDocument => ({
  id: "article-test",
  title: "Test Article",
  url: "https://example.com/blog/test",
  contentType: "article",
  text,
  tags: ["Test"],
  categories: ["AI Engineering"],
  publicationStatus: "published",
  updatedAt: "2026-10-18",
  ...overrides,
})

describe("splitSections", () => {
  it("splits on ## headings and keeps the heading", () => {
    const sections = splitSections("Intro text\n\n## First\n\nOne\n\n## Second\n\nTwo")
    expect(sections).toEqual([
      { heading: "", body: "Intro text" },
      { heading: "First", body: "One" },
      { heading: "Second", body: "Two" },
    ])
  })

  it("ignores headings inside code fences", () => {
    const sections = splitSections("## Code\n\n```md\n## not a heading\n```\n")
    expect(sections).toHaveLength(1)
    expect(sections[0].body).toContain("## not a heading")
  })
})

describe("splitParagraphs", () => {
  it("keeps a fenced code block with blank lines as one paragraph", () => {
    const paragraphs = splitParagraphs("Before\n\n```ts\nconst a = 1\n\nconst b = 2\n```\n\nAfter")
    expect(paragraphs).toHaveLength(3)
    expect(paragraphs[1]).toContain("const b = 2")
  })
})

describe("packParagraphs", () => {
  it("never exceeds maxChars and carries short paragraphs as overlap", () => {
    const paragraphs = Array.from({ length: 10 }, (_, i) => `Paragraph ${i} `.repeat(8).trim())
    const bodies = packParagraphs(paragraphs, 300, 150)
    expect(bodies.length).toBeGreaterThan(1)
    for (const b of bodies) expect(b.length).toBeLessThanOrEqual(300)
    // The last paragraph of one chunk starts the next one.
    const lastOfFirst = bodies[0].split("\n\n").at(-1)!
    expect(bodies[1].startsWith(lastOfFirst)).toBe(true)
  })

  it("splits a single oversized paragraph", () => {
    const bodies = packParagraphs(["x".repeat(1000)], 300, 50)
    expect(bodies.every((b) => b.length <= 300)).toBe(true)
    expect(bodies.join("").length).toBe(1000)
  })
})

describe("chunkDocument", () => {
  const text = "Summary line.\n\n## Core concepts\n\n" + "Embeddings map text to vectors. ".repeat(80) + "\n\n## Takeaways\n\nKeep chunks small."

  it("creates deterministic ids and prefixes title and section", () => {
    const a = chunkDocument(doc(text), { maxChars: 600 })
    const b = chunkDocument(doc(text), { maxChars: 600 })
    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id))
    expect(a[0].id).toBe("article-test:0")
    expect(a.every((c) => c.text.startsWith("Test Article"))).toBe(true)
    expect(a.find((c) => c.metadata.section === "Takeaways")?.text).toContain("Section: Takeaways")
  })

  it("keeps source metadata on every chunk", () => {
    for (const c of chunkDocument(doc(text))) {
      expect(c.metadata).toMatchObject({
        documentId: "article-test",
        url: "https://example.com/blog/test",
        publicationStatus: "published",
        contentType: "article",
      })
      expect(c.metadata.text).toBe(c.text)
    }
  })

  it("changes the hash only for chunks whose text changed", () => {
    const before = chunkDocument(doc(text))
    const after = chunkDocument(doc(text.replace("Keep chunks small.", "Keep chunks focused.")))
    const changed = after.filter((c, i) => c.metadata.hash !== before[i]?.metadata.hash)
    expect(changed).toHaveLength(1)
    expect(changed[0].metadata.section).toBe("Takeaways")
  })
})
