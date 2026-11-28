import "server-only"

import type { SearchQuery } from "@/lib/jobs/schema"

// Job search through the Adzuna API (India: country code "in", salaries in INR).
// Runs on the server only, so the app id and key never reach the browser.
// Free keys: https://developer.adzuna.com

export type JobResult = {
  externalId: string
  title: string
  company: string
  location: string
  url: string
  created: string
  salaryMin: number | null
  salaryMax: number | null
  salaryPredicted: boolean
  snippet: string
}

export type SearchResponse =
  | { ok: true; results: JobResult[]; total: number; page: number }
  | { ok: false; error: string; status: number }

const ADZUNA = "https://api.adzuna.com/v1/api/jobs/in/search"
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map<string, { at: number; value: SearchResponse }>()

export const isJobSearchConfigured = () => Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY)

const str = (v: unknown) => (typeof v === "string" ? v : "")
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null)
const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()

/** Maps one raw Adzuna result to the fields the dashboard shows. Exported for tests. */
export function mapAdzunaResult(raw: unknown): JobResult | null {
  if (typeof raw !== "object" || raw === null) return null
  const r = raw as Record<string, unknown>
  const company = (r.company as Record<string, unknown> | undefined)?.display_name
  const location = (r.location as Record<string, unknown> | undefined)?.display_name
  const url = str(r.redirect_url)
  const id = r.id === undefined ? "" : String(r.id)
  if (!id || !/^https?:\/\//.test(url)) return null
  return {
    externalId: `adzuna-${id}`.slice(0, 80),
    title: stripHtml(str(r.title)).slice(0, 200),
    company: stripHtml(str(company)).slice(0, 120) || "Unknown company",
    location: stripHtml(str(location)).slice(0, 80),
    url,
    created: str(r.created),
    salaryMin: num(r.salary_min),
    salaryMax: num(r.salary_max),
    salaryPredicted: r.salary_is_predicted === "1" || r.salary_is_predicted === 1,
    snippet: stripHtml(str(r.description)).slice(0, 300),
  }
}

export async function searchJobs(query: SearchQuery, fetchImpl: typeof fetch = fetch): Promise<SearchResponse> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) {
    return { ok: false, error: "Job search isn't set up yet. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to .env.local.", status: 503 }
  }

  const cacheKey = JSON.stringify(query)
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: query.what,
    results_per_page: "20",
    max_days_old: String(query.maxDaysOld),
    sort_by: "date",
    "content-type": "application/json",
  })
  if (query.where) params.set("where", query.where)

  let res: Response
  try {
    res = await fetchImpl(`${ADZUNA}/${query.page}?${params}`, { signal: AbortSignal.timeout(10_000), cache: "no-store" })
  } catch {
    return { ok: false, error: "Couldn't reach the job search service. Try again.", status: 502 }
  }
  if (res.status === 401 || res.status === 403) return { ok: false, error: "The Adzuna key was rejected. Check ADZUNA_APP_ID and ADZUNA_APP_KEY.", status: 502 }
  if (res.status === 429) return { ok: false, error: "Adzuna's free limit was reached. Try again later.", status: 429 }
  if (!res.ok) return { ok: false, error: `Job search failed (${res.status}).`, status: 502 }

  const body = (await res.json().catch(() => null)) as { results?: unknown[]; count?: unknown } | null
  const results = (body?.results ?? []).map(mapAdzunaResult).filter((r): r is JobResult => r !== null)
  const value: SearchResponse = { ok: true, results, total: num(body?.count) ?? results.length, page: query.page }

  cache.set(cacheKey, { at: Date.now(), value })
  if (cache.size > 100) cache.delete(cache.keys().next().value!)
  return value
}
