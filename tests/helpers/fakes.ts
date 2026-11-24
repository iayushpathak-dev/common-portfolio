// Test doubles. These are for tests only; production retrieval uses Upstash Vector.
import { cosineSimilarity } from "ai"

import type { Embedder } from "@/lib/rag/embeddings"
import type { RetrievedChunk } from "@/lib/rag/types"
import type { VectorRecord, VectorStore } from "@/lib/rag/vector-store"

const DIMS = 256

function hashWord(word: string) {
  let h = 2166136261
  for (let i = 0; i < word.length; i++) h = Math.imul(h ^ word.charCodeAt(i), 16777619)
  return Math.abs(h) % DIMS
}

/** Deterministic bag-of-words "embedding": texts sharing words get similar vectors. */
export function fakeVector(text: string) {
  const v = new Array<number>(DIMS).fill(0)
  for (const word of text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []) v[hashWord(word)] += 1
  return v
}

export function createFakeEmbedder(options: { failOn?: (text: string) => boolean; delayMs?: number } = {}) {
  const calls = { documents: 0, documentTexts: 0, queries: 0 }
  const embedder: Embedder = {
    id: "fake@256",
    async embedDocuments(texts) {
      calls.documents++
      calls.documentTexts += texts.length
      if (texts.some((t) => options.failOn?.(t))) throw new Error("embedding provider error")
      return texts.map(fakeVector)
    },
    async embedQuery(text, signal) {
      calls.queries++
      if (options.delayMs) {
        await new Promise((resolve, reject) => {
          const t = setTimeout(resolve, options.delayMs)
          signal?.addEventListener("abort", () => {
            clearTimeout(t)
            reject(new Error("aborted"))
          })
        })
      }
      return fakeVector(text)
    },
  }
  return { embedder, calls }
}

export class MemoryVectorStore implements VectorStore {
  records = new Map<string, VectorRecord>()
  failQuery = false

  async upsert(records: VectorRecord[]) {
    for (const r of records) this.records.set(r.id, r)
  }

  async query(vector: number[], topK: number): Promise<RetrievedChunk[]> {
    if (this.failQuery) throw new Error("vector store unavailable")
    return [...this.records.values()]
      .filter((r) => r.metadata.publicationStatus === "published")
      .map((r) => ({ id: r.id, text: r.text, metadata: r.metadata, score: cosineSimilarity(vector, r.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }

  async delete(ids: string[]) {
    for (const id of ids) this.records.delete(id)
  }

  async listHashes() {
    return new Map([...this.records].map(([id, r]) => [id, r.metadata.hash]))
  }
}

/** In-memory QuestionStore for tests. */
export function createMemoryQuestionStore() {
  const pending = new Map<string, import("@/lib/rag/question-log").PendingQuestion>()
  const learned = new Map<string, import("@/lib/rag/question-log").LearnedFaq>()
  const store: import("@/lib/rag/question-log").QuestionStore = {
    async record({ question, route, at }) {
      const { questionId } = await import("@/lib/rag/question-log")
      const id = questionId(question)
      const prev = pending.get(id)
      pending.set(id, { id, question: prev?.question ?? question, count: (prev?.count ?? 0) + 1, route, firstSeen: prev?.firstSeen ?? at, lastSeen: at })
    },
    async listPending(limit) {
      return [...pending.values()].sort((a, b) => b.lastSeen - a.lastSeen).slice(0, limit)
    },
    async dismiss(id) {
      pending.delete(id)
    },
    async saveLearned(entry, answeredQuestionId) {
      learned.set(entry.id, entry)
      if (answeredQuestionId) pending.delete(answeredQuestionId)
    },
    async listLearned() {
      return [...learned.values()]
    },
    async deleteLearned(id) {
      learned.delete(id)
    },
  }
  return { store, pending, learned }
}
