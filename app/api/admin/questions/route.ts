import { isAdminRequest } from "@/lib/admin-auth"
import { createGeminiEmbedder } from "@/lib/rag/embeddings"
import { saveIndexStatus } from "@/lib/rag/index-status"
import { errorMessage, syncKnowledgeBase } from "@/lib/rag/ingest"
import { buildAllKnowledgeDocuments, citablePaths } from "@/lib/rag/learned"
import { parseAdminAction } from "@/lib/rag/question-log"
import { getQuestionStore } from "@/lib/rag/question-store"
import { createUpstashVectorStore, isVectorStoreConfigured } from "@/lib/rag/vector-store"

// Review queue for questions the assistant couldn't answer. Protected by RAG_ADMIN_SECRET.
// GET lists pending questions and learned answers; POST answers, dismisses or deletes.
// Answering or deleting re-syncs the vector index (only changed chunks are embedded).

export const maxDuration = 60

const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 })
const noStore = () => Response.json({ error: "Redis is not configured." }, { status: 503 })

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorized()
  const store = getQuestionStore()
  if (!store) return noStore()
  const [pending, learned] = await Promise.all([store.listPending(100), store.listLearned()])
  return Response.json({ pending, learned, pages: citablePaths() }, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized()
  const store = getQuestionStore()
  if (!store) return noStore()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 })
  }
  const parsed = parseAdminAction(body, citablePaths())
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })

  const action = parsed.value
  if (action.action === "dismiss") {
    await store.dismiss(action.questionId)
    return Response.json({ ok: true })
  }
  if (action.action === "answer") await store.saveLearned(action.entry, action.answeredQuestionId)
  if (action.action === "delete") await store.deleteLearned(action.id)

  if (!isVectorStoreConfigured() || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ ok: true, indexed: false, note: "Saved. It will be indexed once the vector store is configured." })
  }
  try {
    const report = await syncKnowledgeBase({
      documents: await buildAllKnowledgeDocuments(),
      store: createUpstashVectorStore(),
      embedder: createGeminiEmbedder(),
    })
    await saveIndexStatus(report)
    return Response.json({ ok: report.ok, indexed: true, report })
  } catch (error) {
    return Response.json({ ok: false, indexed: false, error: errorMessage(error) }, { status: 500 })
  }
}
