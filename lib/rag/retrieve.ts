import { RAG_CONFIG } from "@/lib/rag/config"
import type { Embedder } from "@/lib/rag/embeddings"
import type { RetrievedChunk, SourceLink } from "@/lib/rag/types"
import type { VectorStore } from "@/lib/rag/vector-store"

export type RetrievalOptions = {
  topK?: number
  minScore?: number
  maxContextChars?: number
  maxChunksPerDocument?: number
  timeoutMs?: number
}

export type RetrievalResult = {
  /** Chunks that passed the threshold and fit the context budget, best first. */
  chunks: RetrievedChunk[]
  /** Best raw score, even if below the threshold (for logging and scope decisions). */
  topScore: number | null
  candidates: number
}

/**
 * Picks the chunks to send to the model: above the score threshold, at most N per document,
 * within the context budget. Pure, so it can be tested without a vector store.
 */
export function selectChunks(
  matches: RetrievedChunk[],
  {
    minScore = RAG_CONFIG.retrieval.minScore,
    maxContextChars = RAG_CONFIG.retrieval.maxContextChars,
    maxChunksPerDocument = RAG_CONFIG.retrieval.maxChunksPerDocument,
  }: RetrievalOptions = {},
): RetrievedChunk[] {
  const perDocument = new Map<string, number>()
  const selected: RetrievedChunk[] = []
  let used = 0

  for (const match of [...matches].sort((a, b) => b.score - a.score)) {
    if (match.score < minScore) break
    if (match.metadata.publicationStatus !== "published") continue
    const count = perDocument.get(match.metadata.documentId) ?? 0
    if (count >= maxChunksPerDocument) continue
    if (used + match.text.length > maxContextChars) continue
    perDocument.set(match.metadata.documentId, count + 1)
    used += match.text.length
    selected.push(match)
  }
  return selected
}

export async function retrieve(
  query: string,
  { embedder, store }: { embedder: Embedder; store: VectorStore },
  options: RetrievalOptions = {},
): Promise<RetrievalResult> {
  const topK = options.topK ?? RAG_CONFIG.retrieval.topK
  const timeoutMs = options.timeoutMs ?? RAG_CONFIG.limits.retrievalTimeoutMs

  const matches = await withTimeout(
    (signal) => embedder.embedQuery(query, signal).then((vector) => store.query(vector, topK)),
    timeoutMs,
  )
  return {
    chunks: selectChunks(matches, options),
    topScore: matches.length > 0 ? Math.max(...matches.map((m) => m.score)) : null,
    candidates: matches.length,
  }
}

/** One source link per page, in order of first appearance (chunks arrive best first). */
export function toSources(chunks: RetrievedChunk[]): SourceLink[] {
  const byUrl = new Map<string, SourceLink>()
  for (const c of chunks) {
    if (!byUrl.has(c.metadata.url)) {
      byUrl.set(c.metadata.url, { id: c.metadata.documentId, url: c.metadata.url, title: c.metadata.title })
    }
  }
  return [...byUrl.values()]
}

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Timed out after ${ms}ms`)
    this.name = "TimeoutError"
  }
}

export async function withTimeout<T>(run: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new TimeoutError(ms))
    }, ms)
  })
  try {
    return await Promise.race([run(controller.signal), timeout])
  } finally {
    clearTimeout(timer)
  }
}
