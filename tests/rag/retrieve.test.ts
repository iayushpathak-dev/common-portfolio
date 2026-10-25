import { describe, expect, it } from "vitest"

import { retrieve, selectChunks, TimeoutError, toSources } from "@/lib/rag/retrieve"
import type { RetrievedChunk } from "@/lib/rag/types"
import { createFakeEmbedder, fakeVector, MemoryVectorStore } from "../helpers/fakes"

function match(id: string, score: number, overrides: Partial<RetrievedChunk["metadata"]> = {}, text = `text ${id}`): RetrievedChunk {
  const documentId = id.split(":")[0]
  return {
    id,
    text,
    score,
    metadata: {
      documentId,
      title: `Doc ${documentId}`,
      url: `https://example.com/${documentId}`,
      contentType: "article",
      section: "",
      tags: [],
      publicationStatus: "published",
      updatedAt: "2026-10-18",
      chunkIndex: Number(id.split(":")[1] ?? 0),
      hash: id,
      text,
      ...overrides,
    },
  }
}

describe("selectChunks", () => {
  it("drops matches below the threshold", () => {
    const selected = selectChunks([match("a:0", 0.9), match("b:0", 0.4)], { minScore: 0.6 })
    expect(selected.map((c) => c.id)).toEqual(["a:0"])
  })

  it("returns nothing when no match is relevant (the abstain signal)", () => {
    expect(selectChunks([match("a:0", 0.3), match("b:0", 0.2)], { minScore: 0.6 })).toEqual([])
  })

  it("caps chunks per document so one article can't crowd out others", () => {
    const matches = [match("a:0", 0.95), match("a:1", 0.94), match("a:2", 0.93), match("b:0", 0.9)]
    const selected = selectChunks(matches, { minScore: 0.5, maxChunksPerDocument: 2 })
    expect(selected.map((c) => c.id)).toEqual(["a:0", "a:1", "b:0"])
  })

  it("respects the context budget", () => {
    const matches = [match("a:0", 0.9, {}, "x".repeat(600)), match("b:0", 0.8, {}, "y".repeat(600)), match("c:0", 0.7, {}, "z".repeat(100))]
    const selected = selectChunks(matches, { minScore: 0.5, maxContextChars: 1000 })
    expect(selected.map((c) => c.id)).toEqual(["a:0", "c:0"])
  })

  it("never returns unpublished chunks, even if the store does", () => {
    const selected = selectChunks([match("a:0", 0.9, { publicationStatus: "draft" })], { minScore: 0.5 })
    expect(selected).toEqual([])
  })
})

describe("toSources", () => {
  it("returns one link per page, in relevance order, only for supplied chunks", () => {
    const chunks = [match("a:0", 0.9), match("b:0", 0.8), match("a:1", 0.7)]
    expect(toSources(chunks)).toEqual([
      { id: "a", url: "https://example.com/a", title: "Doc a" },
      { id: "b", url: "https://example.com/b", title: "Doc b" },
    ])
  })
})

describe("retrieve", () => {
  async function storeWith(texts: Record<string, string>) {
    const store = new MemoryVectorStore()
    await store.upsert(
      Object.entries(texts).map(([id, text]) => ({ ...match(`${id}:0`, 0, {}, text), vector: fakeVector(text) })),
    )
    return store
  }

  it("finds the most relevant document for a question", async () => {
    const store = await storeWith({
      pwa: "Partners Studio progressive web app offline support service workers cache",
      bff: "Backend for frontend route handlers grpc business logic",
      seo: "Rendering strategies ssr ssg isr lighthouse seo",
    })
    const { embedder } = createFakeEmbedder()
    const result = await retrieve("How does offline support with service workers work?", { embedder, store }, { minScore: 0.2 })
    expect(result.chunks[0].metadata.documentId).toBe("pwa")
    expect(result.topScore).toBeGreaterThan(0.2)
  })

  it("times out instead of hanging when the provider is slow", async () => {
    const store = await storeWith({ a: "anything" })
    const { embedder } = createFakeEmbedder({ delayMs: 500 })
    await expect(retrieve("question", { embedder, store }, { timeoutMs: 50 })).rejects.toBeInstanceOf(TimeoutError)
  })

  it("propagates vector store failures so the caller can degrade", async () => {
    const store = await storeWith({ a: "anything" })
    store.failQuery = true
    const { embedder } = createFakeEmbedder()
    await expect(retrieve("question", { embedder, store })).rejects.toThrow("vector store unavailable")
  })
})
