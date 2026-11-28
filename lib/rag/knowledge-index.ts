import "server-only"

import { EMBEDDING_PROVIDER } from "@/lib/rag/config"
import { createGeminiEmbedder, withQueryCache } from "@/lib/rag/embeddings"
import type { RetrievalDeps } from "@/lib/rag/retrieve"
import { createUpstashVectorStore, isVectorStoreConfigured } from "@/lib/rag/vector-store"

// One place that wires the vector store to whoever embeds text (RAG_EMBEDDING_PROVIDER).

/** True when the knowledge base can be indexed and searched with the current settings. */
export function isKnowledgeIndexConfigured() {
  if (!isVectorStoreConfigured()) return false
  return EMBEDDING_PROVIDER === "upstash" || Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
}

/**
 * The store plus its embedder. With the "upstash" provider the index embeds text itself,
 * so there's no embedder (and no embedding API key or bill).
 */
export function createKnowledgeIndex({ cacheQueries = false }: { cacheQueries?: boolean } = {}): RetrievalDeps {
  if (EMBEDDING_PROVIDER === "upstash") {
    return { embedder: null, store: createUpstashVectorStore({ embedsText: true }) }
  }
  const embedder = createGeminiEmbedder()
  return {
    embedder: cacheQueries ? withQueryCache(embedder) : embedder,
    store: createUpstashVectorStore({ embedsText: false }),
  }
}
