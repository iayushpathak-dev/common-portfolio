import { createUIMessageStreamResponse } from "ai"

import { PORTFOLIO } from "@/lib/portfolio"
import { runChat } from "@/lib/rag/pipeline"
import { getChatDeps } from "@/lib/rag/service"
import { createTrace } from "@/lib/rag/telemetry"
import { parseChatRequest } from "@/lib/rag/validation"
import { clientKey, getChatRateLimiter } from "@/lib/rate-limit"

export const maxDuration = 60

const MAX_BODY_BYTES = 100_000

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ error: PORTFOLIO.chat.notConfigured }, { status: 500 })
  }

  const limit = await getChatRateLimiter()
    .limit(clientKey(req))
    .catch(() => ({ success: true, remaining: 0, reset: 0 })) // a limiter outage shouldn't take chat down
  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))
    return Response.json(
      { error: PORTFOLIO.chat.replies.rateLimited },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    )
  }

  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) return Response.json({ error: "Request too large." }, { status: 413 })
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 })
  }

  const parsed = parseChatRequest(body)
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })

  const trace = createTrace()
  const stream = runChat({ request: parsed.value, deps: getChatDeps(), trace, abortSignal: req.signal })
  return createUIMessageStreamResponse({ stream, headers: { "x-request-id": trace.requestId } })
}
