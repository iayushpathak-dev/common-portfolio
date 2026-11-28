import { describe, expect, it } from "vitest"

import { contentFingerprint, syncIfStale, type AutoSyncRedis } from "@/lib/rag/auto-sync"
import type { KnowledgeDocument } from "@/lib/rag/types"
import { MemoryVectorStore } from "../helpers/fakes"

const doc = (id: string, text: string): KnowledgeDocument => ({
  id,
  title: `Title ${id}`,
  url: `https://example.com/${id}`,
  contentType: "article",
  text,
  tags: [],
  categories: [],
  publicationStatus: "published",
  updatedAt: "2026-11-29",
})

function fakeRedis(): AutoSyncRedis & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    async get<T>(key: string) {
      return (data.get(key) as T | undefined) ?? null
    },
    async set(key: string, value: string, opts?: { nx: true; ex: number }) {
      if (opts?.nx && data.has(key)) return null
      data.set(key, value)
      return "OK"
    },
    async del(key: string) {
      data.delete(key)
    },
  }
}

describe("contentFingerprint", () => {
  it("changes when content changes and ignores document order", () => {
    const a = doc("a", "## A\n\nAlpha text")
    const b = doc("b", "## B\n\nBeta text")
    expect(contentFingerprint([a, b])).toBe(contentFingerprint([b, a]))
    expect(contentFingerprint([a, b])).not.toBe(contentFingerprint([a, doc("b", "## B\n\nChanged")]))
  })
})

describe("syncIfStale", () => {
  it("fills an empty index once, then reports fresh", async () => {
    const redis = fakeRedis()
    const store = new MemoryVectorStore({ embedsText: true })
    const deps = { redis, index: { embedder: null, store }, buildDocuments: async () => [doc("a", "## A\n\nAlpha text")] }

    expect(await syncIfStale(deps)).toBe("synced")
    expect(store.records.size).toBeGreaterThan(0)
    expect(await syncIfStale(deps)).toBe("fresh")
  })

  it("re-syncs after content changes", async () => {
    const redis = fakeRedis()
    const store = new MemoryVectorStore({ embedsText: true })
    let text = "## A\n\nAlpha text"
    const deps = { redis, index: { embedder: null, store }, buildDocuments: async () => [doc("a", text)] }
    await syncIfStale(deps)
    text = "## A\n\nNew alpha text"
    expect(await syncIfStale(deps)).toBe("synced")
    expect([...store.records.values()][0].text).toContain("New alpha")
  })

  it("does not run while another instance holds the lock", async () => {
    const redis = fakeRedis()
    redis.data.set("rag:index:sync-lock", "other")
    const store = new MemoryVectorStore({ embedsText: true })
    const result = await syncIfStale({ redis, index: { embedder: null, store }, buildDocuments: async () => [doc("a", "## A\n\nAlpha")] })
    expect(result).toBe("locked")
    expect(store.records.size).toBe(0)
  })

  it("keeps the fingerprint unset and releases the lock when the sync fails", async () => {
    const redis = fakeRedis()
    const store = new MemoryVectorStore() // needs vectors, but no embedder is given
    const result = await syncIfStale({ redis, index: { embedder: null, store }, buildDocuments: async () => [doc("a", "## A\n\nAlpha")] })
    expect(result).toBe("failed")
    expect(redis.data.has("rag:index:fingerprint")).toBe(false)
    expect(redis.data.has("rag:index:sync-lock")).toBe(false)
  })
})
