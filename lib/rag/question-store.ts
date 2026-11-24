import "server-only"

import type { Redis } from "@upstash/redis"

import { getRedis } from "@/lib/redis"
import { MAX_PENDING, questionId, type LearnedFaq, type PendingQuestion, type QuestionStore } from "@/lib/rag/question-log"
import type { ChatRoute } from "@/lib/rag/types"

const PENDING = "uq:pending"
const item = (id: string) => `uq:item:${id}`
const LEARNED = "faq:learned"

/** Unanswered questions and learned answers in Upstash Redis (null when Redis isn't configured). */
export function getQuestionStore(): QuestionStore | null {
  const redis = getRedis()
  return redis ? createRedisQuestionStore(redis) : null
}

export function createRedisQuestionStore(redis: Redis): QuestionStore {
  return {
    async record({ question, route, at }) {
      const id = questionId(question)
      const p = redis.pipeline()
      p.hsetnx(item(id), "question", question)
      p.hsetnx(item(id), "firstSeen", at)
      p.hset(item(id), { route, lastSeen: at })
      p.hincrby(item(id), "count", 1)
      p.zadd(PENDING, { score: at, member: id })
      p.zcard(PENDING)
      const results = await p.exec()
      const size = Number(results[results.length - 1] ?? 0)
      if (size > MAX_PENDING) {
        const overflow = await redis.zrange<string[]>(PENDING, 0, size - MAX_PENDING - 1)
        if (overflow.length) {
          await redis.zrem(PENDING, ...overflow)
          await redis.del(...overflow.map(item))
        }
      }
    },

    async listPending(limit) {
      const ids = await redis.zrange<string[]>(PENDING, 0, limit - 1, { rev: true })
      if (ids.length === 0) return []
      const p = redis.pipeline()
      for (const id of ids) p.hgetall(item(id))
      const rows = (await p.exec()) as (Record<string, unknown> | null)[]
      return ids.flatMap((id, i): PendingQuestion[] => {
        const row = rows[i]
        if (!row?.question) return []
        return [
          {
            id,
            question: String(row.question),
            count: Number(row.count ?? 1),
            route: String(row.route ?? "no_context") as ChatRoute,
            firstSeen: Number(row.firstSeen ?? 0),
            lastSeen: Number(row.lastSeen ?? 0),
          },
        ]
      })
    },

    async dismiss(id) {
      await redis.zrem(PENDING, id)
      await redis.del(item(id))
    },

    async saveLearned(entry, answeredQuestionId) {
      await redis.hset(LEARNED, { [entry.id]: JSON.stringify(entry) })
      if (answeredQuestionId) {
        await redis.zrem(PENDING, answeredQuestionId)
        await redis.del(item(answeredQuestionId))
      }
    },

    async listLearned() {
      const all = (await redis.hgetall<Record<string, unknown>>(LEARNED)) ?? {}
      return Object.values(all).flatMap((value) => {
        try {
          const entry = (typeof value === "string" ? JSON.parse(value) : value) as LearnedFaq
          return entry?.id && entry.question && entry.answer ? [entry] : []
        } catch {
          return []
        }
      })
    },

    async deleteLearned(id) {
      await redis.hdel(LEARNED, id)
    },
  }
}
