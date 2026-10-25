import { describe, expect, it } from "vitest"

import { planSync, syncKnowledgeBase } from "@/lib/rag/ingest"
import type { KnowledgeDocument } from "@/lib/rag/types"
import { createFakeEmbedder, MemoryVectorStore } from "../helpers/fakes"

const doc = (id: string, text: string, overrides: Partial<KnowledgeDocument> = {}): KnowledgeDocument => ({
  id,
  title: `Title ${id}`,
  url: `https://example.com/${id}`,
  contentType: "article",
  text,
  tags: [],
  categories: [],
  publicationStatus: "published",
  updatedAt: "2026-10-18",
  ...overrides,
})

const long = (word: string) => `## Part one\n\n${`${word} one. `.repeat(150)}\n\n## Part two\n\n${`${word} two. `.repeat(150)}`

describe("syncKnowledgeBase", () => {
  it("indexes everything on the first run and nothing on the second (idempotent)", async () => {
    const store = new MemoryVectorStore()
    const { embedder, calls } = createFakeEmbedder()
    const docs = [doc("a", long("alpha")), doc("b", long("beta"))]

    const first = await syncKnowledgeBase({ documents: docs, store, embedder })
    expect(first).toMatchObject({ ok: true, deleted: 0, unchanged: 0 })
    expect(first.upserted).toBe(first.chunks)
    expect(store.records.size).toBe(first.chunks)

    const embeddedBefore = calls.documentTexts
    const second = await syncKnowledgeBase({ documents: docs, store, embedder })
    expect(second).toMatchObject({ ok: true, upserted: 0, deleted: 0, unchanged: first.chunks })
    expect(calls.documentTexts).toBe(embeddedBefore) // nothing re-embedded
    expect(store.records.size).toBe(first.chunks) // no duplicates
  })

  it("re-embeds only the changed chunks of an updated article", async () => {
    const store = new MemoryVectorStore()
    const { embedder, calls } = createFakeEmbedder()
    await syncKnowledgeBase({ documents: [doc("a", long("alpha"))], store, embedder })

    const before = calls.documentTexts
    const updated = long("alpha").replace(/alpha two\. $/, "alpha two, revised.")
    const report = await syncKnowledgeBase({ documents: [doc("a", updated)], store, embedder })

    expect(report.upserted).toBe(1)
    expect(calls.documentTexts - before).toBe(1)
  })

  it("removes chunks of deleted or unpublished content", async () => {
    const store = new MemoryVectorStore()
    const { embedder } = createFakeEmbedder()
    await syncKnowledgeBase({ documents: [doc("a", long("alpha")), doc("b", long("beta"))], store, embedder })

    // "b" is unpublished (or deleted): it's no longer in the published document set.
    const report = await syncKnowledgeBase({ documents: [doc("a", long("alpha"))], store, embedder })
    expect(report.deleted).toBeGreaterThan(0)
    expect([...store.records.keys()].every((id) => id.startsWith("a:"))).toBe(true)
  })

  it("removes trailing chunks when a document gets shorter", async () => {
    const store = new MemoryVectorStore()
    const { embedder } = createFakeEmbedder()
    await syncKnowledgeBase({ documents: [doc("a", long("alpha"))], store, embedder })
    const sizeBefore = store.records.size

    await syncKnowledgeBase({ documents: [doc("a", "## Only\n\nShort now.")], store, embedder })
    expect(store.records.size).toBe(1)
    expect(sizeBefore).toBeGreaterThan(1)
  })

  it("skips malformed, unpublished and duplicate documents and reports why", async () => {
    const store = new MemoryVectorStore()
    const { embedder } = createFakeEmbedder()
    const report = await syncKnowledgeBase({
      documents: [
        doc("ok", "Valid text"),
        doc("ok", "Duplicate id"),
        doc("draft", "Draft text", { publicationStatus: "draft" }),
        doc("no-url", "Text", { url: "" }),
        doc("empty", "   "),
      ],
      store,
      embedder,
    })
    expect(report.documents).toBe(1)
    expect(report.skipped.map((s) => s.reason)).toEqual([
      "duplicate id",
      "status is draft",
      "missing or relative url",
      "empty text",
    ])
    expect([...store.records.keys()]).toEqual(["ok:0"])
  })

  it("records embedding failures, keeps going, and doesn't delete the failed document's old chunks", async () => {
    const store = new MemoryVectorStore()
    const ok = createFakeEmbedder()
    await syncKnowledgeBase({ documents: [doc("a", "## A\n\nOld A"), doc("b", "## B\n\nOld B")], store, embedder: ok.embedder })

    const failing = createFakeEmbedder({ failOn: (t) => t.includes("New B") })
    const report = await syncKnowledgeBase({
      documents: [doc("a", "## A\n\nNew A"), doc("b", "## B\n\nNew B")],
      store,
      embedder: failing.embedder,
      batchSize: 1,
    })

    expect(report.ok).toBe(false)
    expect(report.upserted).toBe(1)
    expect(report.failed).toHaveLength(1)
    expect(report.failed[0].ids).toEqual(["b:0"])
    expect(store.records.get("b:0")?.text).toContain("Old B") // still answerable from the old version
    expect(store.records.get("a:0")?.text).toContain("New A")

    // The next run retries only what failed.
    const retry = await syncKnowledgeBase({ documents: [doc("a", "## A\n\nNew A"), doc("b", "## B\n\nNew B")], store, embedder: ok.embedder })
    expect(retry).toMatchObject({ ok: true, upserted: 1, unchanged: 1 })
  })
})

describe("planSync", () => {
  it("upserts new and changed chunks and deletes missing ones", () => {
    const chunk = (id: string, hash: string) => ({ id, text: "", metadata: { hash } as never })
    const plan = planSync(
      [chunk("a:0", "same"), chunk("a:1", "new-hash"), chunk("c:0", "x")],
      new Map([
        ["a:0", "same"],
        ["a:1", "old-hash"],
        ["b:0", "gone"],
      ]),
    )
    expect(plan.toUpsert.map((c) => c.id)).toEqual(["a:1", "c:0"])
    expect(plan.toDelete).toEqual(["b:0"])
    expect(plan.unchanged).toBe(1)
  })
})
