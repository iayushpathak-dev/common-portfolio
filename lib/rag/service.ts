import "server-only"

import { chunkDocument } from "@/lib/rag/chunk"
import { buildKnowledgeDocuments } from "@/lib/rag/documents"
import { createGeminiEmbedder, withQueryCache } from "@/lib/rag/embeddings"
import { googleModels } from "@/lib/rag/models"
import type { ChatDeps } from "@/lib/rag/pipeline"
import type { RetrievedChunk } from "@/lib/rag/types"
import { createUpstashVectorStore, isVectorStoreConfigured } from "@/lib/rag/vector-store"

// Wires the real providers together. Kept separate from the pipeline so tests can inject fakes.

let deps: ChatDeps | undefined

/** Profile and experience documents, sent in full when the vector store isn't configured. */
function fallbackChunks(): RetrievedChunk[] {
  return buildKnowledgeDocuments()
    .filter((d) => d.contentType !== "project" && d.contentType !== "article")
    .flatMap((d) => chunkDocument(d))
    .map((c) => ({ ...c, score: 1 }))
}

export function getChatDeps(): ChatDeps {
  if (!deps) {
    deps = {
      models: googleModels,
      retrieval: isVectorStoreConfigured()
        ? { embedder: withQueryCache(createGeminiEmbedder()), store: createUpstashVectorStore() }
        : null,
      fallbackChunks,
    }
  }
  return deps
}
