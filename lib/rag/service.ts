import "server-only"

import { chunkDocument } from "@/lib/rag/chunk"
import { buildKnowledgeDocuments } from "@/lib/rag/documents"
import { createKnowledgeIndex, isKnowledgeIndexConfigured } from "@/lib/rag/knowledge-index"
import { googleModels } from "@/lib/rag/models"
import { getQuestionStore } from "@/lib/rag/question-store"
import type { ChatDeps } from "@/lib/rag/pipeline"
import type { RetrievedChunk } from "@/lib/rag/types"

// Wires the real providers together. Kept separate from the pipeline so tests can inject fakes.

let deps: ChatDeps | undefined

/** Profile and experience documents, sent in full when the vector store isn't configured. */
function fallbackChunks(): RetrievedChunk[] {
  return buildKnowledgeDocuments()
    .filter((d) => d.contentType !== "project" && d.contentType !== "article" && d.contentType !== "faq")
    .flatMap((d) => chunkDocument(d))
    .map((c) => ({ ...c, score: 1 }))
}

export function getChatDeps(): ChatDeps {
  if (!deps) {
    deps = {
      models: googleModels,
      retrieval: isKnowledgeIndexConfigured() ? createKnowledgeIndex({ cacheQueries: true }) : null,
      fallbackChunks,
      questions: getQuestionStore(),
    }
  }
  return deps
}
