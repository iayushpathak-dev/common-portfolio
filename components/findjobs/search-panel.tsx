"use client"

import { useState } from "react"

import { field, today, type Save } from "@/components/findjobs/shared"
import type { Call } from "@/components/findjobs/use-admin-api"
import { Button } from "@/components/ui/button"
import type { JobResult } from "@/lib/jobs/search"

const CITY_CHIPS = ["Noida", "Gurugram", "Greater Noida"]

type Results = { results: JobResult[]; total: number; page: number }

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`

function salary(r: JobResult) {
  if (!r.salaryMin && !r.salaryMax) return ""
  const range = r.salaryMin && r.salaryMax && r.salaryMin !== r.salaryMax ? `${inr(r.salaryMin)}–${inr(r.salaryMax)}` : inr((r.salaryMax ?? r.salaryMin)!)
  return `${range}/yr${r.salaryPredicted ? " (estimated)" : ""}`
}

export function SearchPanel({ enabled, savedIds, call, save, busy }: { enabled: boolean; savedIds: Set<string>; call: Call; save: Save; busy: boolean }) {
  const [what, setWhat] = useState("react next.js developer")
  const [where, setWhere] = useState("Noida")
  const [days, setDays] = useState(14)
  const [data, setData] = useState<Results | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!enabled) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
        <p className="font-medium">Job search isn&apos;t set up yet</p>
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>Create a free account at developer.adzuna.com.</li>
          <li>Copy your Application ID and Application Key from the dashboard.</li>
          <li>
            Add <code>ADZUNA_APP_ID</code> and <code>ADZUNA_APP_KEY</code> to <code>.env.local</code> (and to Vercel for the live site), then restart
            the dev server.
          </li>
        </ol>
      </div>
    )
  }

  async function run(page = 1) {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ what, where, page: String(page), maxDaysOld: String(days) })
      setData(await call<Results>(`/api/findjobs/search?${params}`))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void run(1)
        }}
      >
        <div className="flex flex-wrap gap-2">
          <input value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Job title or skill" className={`${field} min-w-0 flex-1`} aria-label="Job title or skill" />
          <input value={where} onChange={(e) => setWhere(e.target.value)} placeholder="City (empty = all India)" className={`${field} w-48`} aria-label="City" />
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={field} aria-label="Posted within">
            <option value={3}>Last 3 days</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <Button type="submit" disabled={loading || what.trim().length < 2}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CITY_CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setWhere(c)}
              className={`rounded-full border px-3 py-1 text-xs ${where === c ? "bg-foreground text-background" : "hover:bg-muted"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {data && (
        <p className="text-xs text-muted-foreground">
          {data.total.toLocaleString("en-IN")} jobs found · page {data.page}. Results from Adzuna; check the original posting before applying.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {data?.results.map((r) => {
          const saved = savedIds.has(r.externalId)
          return (
            <li key={r.externalId} className="flex flex-col gap-1 rounded-lg border p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium underline-offset-2 hover:underline">
                    {r.title}
                  </a>
                  <p className="text-muted-foreground">
                    {r.company}
                    {r.location && ` · ${r.location}`}
                    {r.created && ` · ${new Date(r.created).toLocaleDateString("en-IN")}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={saved ? "outline" : "default"}
                  disabled={busy || saved}
                  onClick={() =>
                    save.application(
                      {
                        company: r.company,
                        role: r.title.slice(0, 120),
                        location: r.location,
                        url: r.url,
                        source: "Adzuna",
                        status: "saved",
                        appliedOn: "",
                        followUpOn: today(),
                        externalId: r.externalId,
                        notes: r.snippet,
                      },
                      "Saved to Applications.",
                    )
                  }
                >
                  {saved ? "Saved" : "Save"}
                </Button>
              </div>
              {salary(r) && <p className="text-xs">{salary(r)}</p>}
              {r.snippet && <p className="text-muted-foreground">{r.snippet}…</p>}
            </li>
          )
        })}
      </ul>

      {data && data.results.length > 0 && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={loading || data.page <= 1} onClick={() => run(data.page - 1)}>
            Previous
          </Button>
          <Button size="sm" variant="outline" disabled={loading || data.results.length < 20} onClick={() => run(data.page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
