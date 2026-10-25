import { chunkDocument } from "@/lib/rag/chunk"
import { documentProblem } from "@/lib/rag/documents"
import type { Embedder } from "@/lib/rag/embeddings"
import type { Chunk, KnowledgeDocument } from "@/lib/rag/types"
import type { VectorStore } from "@/lib/rag/vector-store"

export type SyncPlan = { toUpsert: Chunk[]; toDelete: string[]; unchanged: number }

export type SyncReport = {
  startedAt: string
  durationMs: number
  documents: number
  chunks: number
  upserted: number
  deleted: number
  unchanged: number
  skipped: { id: string; reason: string }[]
  failed: { ids: string[]; error: string }[]
  ok: boolean
}

/** Compares desired chunks with what's stored. Pure, so it's easy to test. */
export function planSync(desired: Chunk[], stored: Map<string, string>): SyncPlan {
  const desiredIds = new Set(desired.map((c) => c.id))
  return {
    toUpsert: desired.filter((c) => stored.get(c.id) !== c.metadata.hash),
    toDelete: [...stored.keys()].filter((id) => !desiredIds.has(id)),
    unchanged: desired.filter((c) => stored.get(c.id) === c.metadata.hash).length,
  }
}

/** Validates documents and drops invalid or duplicate ones (recorded in `skipped`). */
export function prepareDocuments(documents: KnowledgeDocument[]) {
  const valid: KnowledgeDocument[] = []
  const skipped: SyncReport["skipped"] = []
  const seen = new Set<string>()

  for (const doc of documents) {
    const problem = documentProblem(doc) ?? (seen.has(doc.id) ? "duplicate id" : null)
    if (problem) skipped.push({ id: doc.id ?? "(missing)", reason: problem })
    else {
      seen.add(doc.id)
      valid.push(doc)
    }
  }
  return { valid, skipped }
}

/**
 * Makes the vector store match the given documents: embeds only new or changed chunks,
 * upserts them, then deletes chunks that no longer exist (deleted or unpublished content).
 * Running it twice in a row does nothing the second time.
 */
export async function syncKnowledgeBase({
  documents,
  store,
  embedder,
  batchSize = 50,
}: {
  documents: KnowledgeDocument[]
  store: VectorStore
  embedder: Embedder
  batchSize?: number
}): Promise<SyncReport> {
  const start = Date.now()
  const { valid, skipped } = prepareDocuments(documents)
  const desired = valid.flatMap((doc) => chunkDocument(doc))
  const plan = planSync(desired, await store.listHashes())
  const failed: SyncReport["failed"] = []
  let upserted = 0

  // Upsert before deleting so the index is never empty part-way through.
  for (let i = 0; i < plan.toUpsert.length; i += batchSize) {
    const batch = plan.toUpsert.slice(i, i + batchSize)
    try {
      const vectors = await embedder.embedDocuments(batch.map((c) => c.text))
      if (vectors.length !== batch.length) throw new Error("embedding count mismatch")
      await store.upsert(batch.map((c, j) => ({ ...c, vector: vectors[j] })))
      upserted += batch.length
    } catch (error) {
      // Keep going: unchanged hashes mean the next run retries only what failed.
      failed.push({ ids: batch.map((c) => c.id), error: errorMessage(error) })
    }
  }

  // Never delete a document's old chunks while its new ones failed to upload.
  const failedDocs = new Set(failed.flatMap((f) => f.ids.map((id) => id.split(":")[0])))
  const toDelete = plan.toDelete.filter((id) => !failedDocs.has(id.split(":")[0]))
  let deleted = 0
  if (toDelete.length > 0) {
    try {
      await store.delete(toDelete)
      deleted = toDelete.length
    } catch (error) {
      failed.push({ ids: toDelete, error: errorMessage(error) })
    }
  }

  return {
    startedAt: new Date(start).toISOString(),
    durationMs: Date.now() - start,
    documents: valid.length,
    chunks: desired.length,
    upserted,
    deleted,
    unchanged: plan.unchanged,
    skipped,
    failed,
    ok: failed.length === 0,
  }
}

/** Short, secret-free error description for reports and logs. */
export function errorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error)
  return raw.replace(/(key|token|secret)=[^&\s]+/gi, "$1=[redacted]").slice(0, 300)
}
