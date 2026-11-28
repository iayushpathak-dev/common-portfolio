import "server-only"

import { createHash } from "node:crypto"

import { chunkDocument } from "@/lib/rag/chunk"
import { saveIndexStatus } from "@/lib/rag/index-status"
import { syncKnowledgeBase, errorMessage, type SyncReport } from "@/lib/rag/ingest"
import { createKnowledgeIndex, isKnowledgeIndexConfigured } from "@/lib/rag/knowledge-index"
import { buildAllKnowledgeDocuments } from "@/lib/rag/learned"
import type { RetrievalDeps } from "@/lib/rag/retrieve"
import type { KnowledgeDocument } from "@/lib/rag/types"
import { getRedis } from "@/lib/redis"

// Keeps the vector index in step with the deployed content without anyone running a reindex.
//
// The first request an instance serves (and then at most every CHECK_INTERVAL_MS) compares a
// fingerprint of every chunk that *should* be indexed with the fingerprint saved after the last
// successful sync. If they differ (new deploy, edited article, new learned FAQ, new embedding
// model), it syncs in the background after the response. A Redis lock stops instances from
// syncing at the same time; syncKnowledgeBase is idempotent, so a repeated run costs one range call.

const FINGERPRINT_KEY = "rag:index:fingerprint"
const LOCK_KEY = "rag:index:sync-lock"
const LOCK_SECONDS = 90
const CHECK_INTERVAL_MS = 10 * 60 * 1000

export type AutoSyncResult = "skipped" | "fresh" | "locked" | "synced" | "failed"

/** Minimal Redis surface used here (Upstash Redis matches it; tests pass a fake). */
export interface AutoSyncRedis {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: string, opts?: { nx: true; ex: number }): Promise<unknown>
  del(key: string): Promise<unknown>
}

export type AutoSyncDeps = {
  redis: AutoSyncRedis
  index: RetrievalDeps
  buildDocuments: () => Promise<KnowledgeDocument[]>
  saveStatus?: (report: SyncReport) => Promise<void>
}

/** Hash of every chunk ID and content hash, so any content or embedding-setup change alters it. */
export function contentFingerprint(documents: KnowledgeDocument[]): string {
  const lines = documents
    .flatMap((d) => chunkDocument(d))
    .map((c) => `${c.id}=${c.metadata.hash}`)
    .sort()
  return createHash("sha256").update(lines.join("\n")).digest("hex")
}

/** Syncs the index when the stored fingerprint doesn't match the current content. */
export async function syncIfStale({ redis, index, buildDocuments, saveStatus }: AutoSyncDeps): Promise<AutoSyncResult> {
  const documents = await buildDocuments()
  const fingerprint = contentFingerprint(documents)
  // String(): Upstash Redis parses stored values as JSON, so an all-digit hash could come back as a number.
  if (String(await redis.get(FINGERPRINT_KEY)) === fingerprint) return "fresh"

  const acquired = await redis.set(LOCK_KEY, fingerprint, { nx: true, ex: LOCK_SECONDS })
  if (!acquired) return "locked"

  try {
    const report = await syncKnowledgeBase({ documents, ...index })
    await saveStatus?.(report)
    if (!report.ok) return "failed"
    await redis.set(FINGERPRINT_KEY, fingerprint)
    return "synced"
  } finally {
    await redis.del(LOCK_KEY)
  }
}

let lastCheckAt = 0

/**
 * Schedules a staleness check after the current response, at most once per CHECK_INTERVAL_MS
 * per instance. Pass Next's `after` so this module stays free of request-scope imports.
 */
export function scheduleIndexSync(after: (task: () => Promise<void>) => void) {
  const now = Date.now()
  if (now - lastCheckAt < CHECK_INTERVAL_MS) return
  lastCheckAt = now

  const redis = getRedis()
  if (!redis || !isKnowledgeIndexConfigured()) return

  after(async () => {
    try {
      const result = await syncIfStale({
        redis: redis as unknown as AutoSyncRedis,
        index: createKnowledgeIndex(),
        buildDocuments: buildAllKnowledgeDocuments,
        saveStatus: saveIndexStatus,
      })
      if (result !== "fresh") console.log(JSON.stringify({ event: "rag_auto_sync", result }))
    } catch (error) {
      console.error(JSON.stringify({ event: "rag_auto_sync_error", error: errorMessage(error) }))
    }
  })
}
