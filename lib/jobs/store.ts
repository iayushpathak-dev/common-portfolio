import "server-only"

import { randomUUID } from "node:crypto"
import type { Redis } from "@upstash/redis"

import { PREP_TOPIC_IDS } from "@/lib/jobs/prep-topics"
import type { Application, Company, JobAction, PrepProgress } from "@/lib/jobs/schema"
import { getRedis } from "@/lib/redis"

// Storage for the private /findjobs dashboard: one Redis hash per collection (id → JSON).
// Without Redis: an in-memory store under `next dev` (lost on restart), otherwise null.

const KEYS = { applications: "fj:applications", companies: "fj:companies", prep: "fj:prep" } as const
export const MAX_ITEMS = 1000

export type JobData = { applications: Application[]; companies: Company[]; prep: PrepProgress[] }

export interface JobStore {
  load(): Promise<JobData>
  put(collection: keyof typeof KEYS, id: string, value: unknown): Promise<void>
  count(collection: keyof typeof KEYS): Promise<number>
  remove(collection: keyof typeof KEYS, id: string): Promise<void>
  get<T>(collection: keyof typeof KEYS, id: string): Promise<T | null>
}

export function getJobStore(): JobStore | null {
  const redis = getRedis()
  if (redis) return createRedisJobStore(redis)
  return process.env.NODE_ENV === "development" ? getDevMemoryStore() : null
}

const devStore = globalThis as typeof globalThis & { __devJobStore?: JobStore }
function getDevMemoryStore(): JobStore {
  return (devStore.__devJobStore ??= createMemoryJobStore())
}

const parse = <T>(value: unknown): T | null => {
  try {
    return (typeof value === "string" ? JSON.parse(value) : value) as T
  } catch {
    return null
  }
}

const byUpdated = <T extends { updatedAt: number }>(rows: T[]) => rows.sort((a, b) => b.updatedAt - a.updatedAt)

export function createMemoryJobStore(): JobStore {
  const data = { applications: new Map<string, unknown>(), companies: new Map<string, unknown>(), prep: new Map<string, unknown>() }
  return {
    async load() {
      return {
        applications: byUpdated([...data.applications.values()] as Application[]),
        companies: byUpdated([...data.companies.values()] as Company[]),
        prep: [...data.prep.values()] as PrepProgress[],
      }
    },
    async put(c, id, value) {
      data[c].set(id, structuredClone(value))
    },
    async count(c) {
      return data[c].size
    },
    async remove(c, id) {
      data[c].delete(id)
    },
    async get<T>(c: keyof typeof KEYS, id: string) {
      return (data[c].get(id) as T) ?? null
    },
  }
}

export function createRedisJobStore(redis: Redis): JobStore {
  const all = async <T>(key: string) => {
    const rows = (await redis.hgetall<Record<string, unknown>>(key)) ?? {}
    return Object.values(rows).flatMap((v) => {
      const row = parse<T>(v)
      return row ? [row] : []
    })
  }
  return {
    async load() {
      const [applications, companies, prep] = await Promise.all([
        all<Application>(KEYS.applications),
        all<Company>(KEYS.companies),
        all<PrepProgress>(KEYS.prep),
      ])
      return { applications: byUpdated(applications), companies: byUpdated(companies), prep }
    },
    async put(c, id, value) {
      await redis.hset(KEYS[c], { [id]: JSON.stringify(value) })
    },
    async count(c) {
      return redis.hlen(KEYS[c])
    },
    async remove(c, id) {
      await redis.hdel(KEYS[c], id)
    },
    async get<T>(c: keyof typeof KEYS, id: string) {
      return parse<T>(await redis.hget(KEYS[c], id))
    },
  }
}

const newId = () => randomUUID().replace(/-/g, "").slice(0, 16)

/** Runs one validated dashboard action against the store. */
export async function applyJobAction(
  store: JobStore,
  action: JobAction,
  now = Date.now(),
): Promise<{ ok: true; id?: string } | { ok: false; error: string; status: number }> {
  switch (action.action) {
    case "save_application":
    case "save_company": {
      const collection = action.action === "save_application" ? "applications" : "companies"
      const { id: givenId, ...fields } = action.item
      const existing = givenId ? await store.get<{ createdAt: number }>(collection, givenId) : null
      if (givenId && !existing) return { ok: false, error: "That item no longer exists.", status: 404 }
      if (!existing && (await store.count(collection)) >= MAX_ITEMS) {
        return { ok: false, error: `Limit of ${MAX_ITEMS} items reached. Delete some first.`, status: 400 }
      }
      const id = givenId ?? newId()
      await store.put(collection, id, { ...fields, id, createdAt: existing?.createdAt ?? now, updatedAt: now })
      return { ok: true, id }
    }
    case "delete_application":
      await store.remove("applications", action.id)
      return { ok: true }
    case "delete_company":
      await store.remove("companies", action.id)
      return { ok: true }
    case "set_prep": {
      if (!PREP_TOPIC_IDS.has(action.item.topicId)) return { ok: false, error: "Unknown topic.", status: 400 }
      await store.put("prep", action.item.topicId, { ...action.item, updatedAt: now })
      return { ok: true }
    }
  }
}
