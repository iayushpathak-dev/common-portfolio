import "server-only"

import { getRedis } from "@/lib/redis"
import type { SyncReport } from "@/lib/rag/ingest"

const KEY = "rag:index:last-run"

/** Records the latest indexing run (counts and errors only, no content) in Redis when configured. */
export async function saveIndexStatus(report: SyncReport) {
  console.log(JSON.stringify({ event: "rag_index", ...report }))
  try {
    await getRedis()?.set(KEY, report)
  } catch (error) {
    console.error(JSON.stringify({ event: "rag_index_status_error", error: String(error).slice(0, 200) }))
  }
}

export async function readIndexStatus(): Promise<SyncReport | null> {
  const redis = getRedis()
  return redis ? ((await redis.get<SyncReport>(KEY)) ?? null) : null
}
