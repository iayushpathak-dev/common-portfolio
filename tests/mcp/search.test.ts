import { beforeEach, describe, expect, it, vi } from "vitest"

import type { RetrievedChunk } from "@/lib/rag/types"
import { createFakeEmbedder } from "../helpers/fakes"

// search_portfolio must never return drafts, even if one ended up in the vector index.

const chunk = (id: string, status: "published" | "draft", score: number, text = "Built a BFF with Next.js route handlers"): RetrievedChunk => ({
  id,
  text,
  score,
  metadata: {
    documentId: id,
    title: `Doc ${id}`,
    url: `https://example.com/${id}`,
    contentType: "project",
    section: "Overview",
    tags: [],
    publicationStatus: status,
    updatedAt: "2026-11-28",
    chunkIndex: 0,
    hash: id,
    text,
  },
})

const state: { retrieval: unknown } = { retrieval: null }
vi.mock("@/lib/rag/service", () => ({ getChatDeps: () => ({ retrieval: state.retrieval }) }))

const { searchPortfolio } = await import("@/lib/mcp/search")

function storeReturning(chunks: RetrievedChunk[] | Error) {
  return {
    embedsText: false,
    async query() {
      if (chunks instanceof Error) throw chunks
      return chunks
    },
    async upsert() {},
    async delete() {},
    async listHashes() {
      return new Map()
    },
  }
}

describe("searchPortfolio", () => {
  beforeEach(() => {
    state.retrieval = null
  })

  it("explains when search isn't configured", async () => {
    expect(await searchPortfolio("bff")).toMatchObject({ ok: false })
  })

  it("returns published hits only, best first, with short excerpts", async () => {
    state.retrieval = {
      embedder: createFakeEmbedder().embedder,
      store: storeReturning([chunk("draft-1", "draft", 0.95), chunk("pub-1", "published", 0.9, "x".repeat(2000)), chunk("pub-2", "published", 0.8)]),
    }
    const result = await searchPortfolio("bff")
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.hits.map((h) => h.url)).toEqual(["https://example.com/pub-1", "https://example.com/pub-2"])
    expect(result.hits[0].excerpt.length).toBeLessThanOrEqual(701)
  })

  it("drops weak matches below the score threshold", async () => {
    state.retrieval = { embedder: createFakeEmbedder().embedder, store: storeReturning([chunk("pub-1", "published", 0.1)]) }
    expect(await searchPortfolio("unrelated")).toEqual({ ok: true, hits: [] })
  })

  it("respects the limit", async () => {
    state.retrieval = {
      embedder: createFakeEmbedder().embedder,
      store: storeReturning([1, 2, 3, 4].map((n) => chunk(`pub-${n}`, "published", 0.9 - n / 100))),
    }
    const result = await searchPortfolio("bff", 2)
    expect(result.ok && result.hits.length).toBe(2)
  })

  it("turns provider errors into a friendly message", async () => {
    state.retrieval = { embedder: createFakeEmbedder().embedder, store: storeReturning(new Error("down")) }
    expect(await searchPortfolio("bff")).toMatchObject({ ok: false })
  })
})
