import "server-only"

import { google } from "@ai-sdk/google"
import { embed, embedMany } from "ai"

import { RAG_CONFIG } from "@/lib/rag/config"

export interface Embedder {
  readonly id: string
  embedDocuments(texts: string[], abortSignal?: AbortSignal): Promise<number[][]>
  embedQuery(text: string, abortSignal?: AbortSignal): Promise<number[]>
}

const { model, dimensions } = RAG_CONFIG.embedding

/** Gemini embeddings through the AI SDK, using the existing GOOGLE_GENERATIVE_AI_API_KEY. */
export function createGeminiEmbedder(): Embedder {
  const embeddingModel = google.embedding(model)
  const options = (taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") => ({
    google: { taskType, outputDimensionality: dimensions },
  })

  return {
    id: `${model}@${dimensions}`,
    async embedDocuments(texts, abortSignal) {
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: texts,
        providerOptions: options("RETRIEVAL_DOCUMENT"),
        maxParallelCalls: 2,
        abortSignal,
      })
      return embeddings
    },
    async embedQuery(text, abortSignal) {
      const { embedding } = await embed({
        model: embeddingModel,
        value: text,
        providerOptions: options("RETRIEVAL_QUERY"),
        maxRetries: 1,
        abortSignal,
      })
      return embedding
    },
  }
}

/**
 * Wraps an embedder with a small per-instance LRU cache for query embeddings. Safe because the
 * same text with the same model always produces the same vector; the key includes the model.
 */
export function withQueryCache(embedder: Embedder, maxEntries = 200): Embedder {
  const cache = new Map<string, number[]>()

  return {
    id: embedder.id,
    embedDocuments: (texts, signal) => embedder.embedDocuments(texts, signal),
    async embedQuery(text, signal) {
      const key = `${embedder.id}:${text.trim().toLowerCase().replace(/\s+/g, " ")}`
      const hit = cache.get(key)
      if (hit) {
        cache.delete(key)
        cache.set(key, hit)
        return hit
      }
      const vector = await embedder.embedQuery(text, signal)
      cache.set(key, vector)
      if (cache.size > maxEntries) cache.delete(cache.keys().next().value!)
      return vector
    },
  }
}
