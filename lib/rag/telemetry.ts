import type { ChatRoute } from "@/lib/rag/types"

/** Fields logged once per chat request. Never includes the question, answer or retrieved text. */
export type TraceFields = {
  requestId: string
  mode?: string
  intent?: string
  route?: ChatRoute
  retrievalMs?: number
  candidates?: number
  chunkCount?: number
  topScore?: number | null
  modelMs?: number
  inputTokens?: number
  outputTokens?: number
  searchUnavailable?: boolean
  error?: string
}

export type Trace = {
  readonly requestId: string
  set<K extends keyof TraceFields>(key: K, value: TraceFields[K]): void
  /** Runs fn and records its duration under `key`. */
  time<T>(key: "retrievalMs" | "modelMs", fn: () => Promise<T>): Promise<T>
  end(): void
}

export function createTrace(log: (line: string) => void = console.log): Trace {
  const start = performance.now()
  const fields: TraceFields = { requestId: crypto.randomUUID() }
  let ended = false

  return {
    requestId: fields.requestId,
    set: (key, value) => void (fields[key] = value),
    async time(key, fn) {
      const t = performance.now()
      try {
        return await fn()
      } finally {
        fields[key] = Math.round(performance.now() - t)
      }
    },
    end() {
      if (ended) return
      ended = true
      log(JSON.stringify({ event: "chat_request", ...fields, totalMs: Math.round(performance.now() - start) }))
    },
  }
}

/** Classifies provider errors for logs and user messages without exposing details. */
export function errorClass(error: unknown): "quota" | "timeout" | "aborted" | "provider" {
  if (typeof error !== "object" || error === null) return "provider"
  const e = error as { name?: string; statusCode?: number; lastError?: unknown }
  if (e.name === "TimeoutError") return "timeout"
  if (e.name === "AbortError") return "aborted"
  if (e.statusCode === 429) return "quota"
  if (e.lastError !== undefined) return errorClass(e.lastError)
  return "provider"
}
