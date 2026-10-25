import { isAdminRequest } from "@/lib/admin-auth"
import { buildKnowledgeDocuments } from "@/lib/rag/documents"
import { createGeminiEmbedder } from "@/lib/rag/embeddings"
import { readIndexStatus, saveIndexStatus } from "@/lib/rag/index-status"
import { errorMessage, syncKnowledgeBase } from "@/lib/rag/ingest"
import { createUpstashVectorStore, isVectorStoreConfigured } from "@/lib/rag/vector-store"

// Protected reindex endpoint: syncs the vector store with published content (idempotent).
// Called after each production deploy by .github/workflows/rag-reindex.yml, or manually with
// `npm run rag:reindex`. GET returns the last run's report.

export const maxDuration = 60

const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 })

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized()
  if (!isVectorStoreConfigured() || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ error: "Vector store or embedding provider is not configured." }, { status: 503 })
  }

  try {
    const report = await syncKnowledgeBase({
      documents: buildKnowledgeDocuments(),
      store: createUpstashVectorStore(),
      embedder: createGeminiEmbedder(),
    })
    await saveIndexStatus(report)
    return Response.json(report, { status: report.ok ? 200 : 207 })
  } catch (error) {
    const message = errorMessage(error)
    console.error(JSON.stringify({ event: "rag_index_failed", error: message }))
    return Response.json({ error: "Reindex failed.", detail: message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized()
  return Response.json({ lastRun: await readIndexStatus(), vectorStoreConfigured: isVectorStoreConfigured() })
}
