import "server-only"

import { createHash } from "node:crypto"
import { Ratelimit } from "@upstash/ratelimit"

import { RAG_CONFIG } from "@/lib/rag/config"
import { getRedis } from "@/lib/redis"

export type RateLimitResult = { success: boolean; remaining: number; reset: number }

export interface RateLimiter {
  readonly kind: "redis" | "memory"
  limit(key: string): Promise<RateLimitResult>
}

/**
 * Fixed-window limiter kept in memory. On serverless platforms every instance has its own
 * memory, so this is a best-effort fallback only, used when Upstash Redis isn't configured.
 */
export function createMemoryRateLimiter(requests: number, windowMs: number, now = () => Date.now()): RateLimiter {
  const windows = new Map<string, { start: number; count: number }>()
  return {
    kind: "memory",
    async limit(key) {
      const t = now()
      let w = windows.get(key)
      if (!w || t - w.start >= windowMs) {
        w = { start: t, count: 0 }
        windows.set(key, w)
      }
      w.count++
      if (windows.size > 5000) {
        for (const [k, v] of windows) if (t - v.start >= windowMs) windows.delete(k)
      }
      return { success: w.count <= requests, remaining: Math.max(0, requests - w.count), reset: w.start + windowMs }
    },
  }
}

let limiter: RateLimiter | undefined

/** Shared (Redis) limiter when configured, so the limit holds across all serverless instances. */
export function getChatRateLimiter(): RateLimiter {
  if (limiter) return limiter
  const { requests, windowSeconds } = RAG_CONFIG.rateLimit
  const redis = getRedis()
  if (redis) {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
      prefix: "rl:chat",
    })
    limiter = { kind: "redis", limit: (key) => ratelimit.limit(key) }
  } else {
    limiter = createMemoryRateLimiter(requests, windowSeconds * 1000)
  }
  return limiter
}

/** A hashed client identifier, so raw IP addresses are never stored. */
export function clientKey(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
  return createHash("sha256").update(`chat:${ip}`).digest("hex").slice(0, 32)
}
