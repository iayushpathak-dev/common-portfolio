"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { ApplicationsPanel } from "@/components/findjobs/applications-panel"
import { CompaniesPanel } from "@/components/findjobs/companies-panel"
import { PrepPanel } from "@/components/findjobs/prep-panel"
import { SearchPanel } from "@/components/findjobs/search-panel"
import { today, type Save } from "@/components/findjobs/shared"
import { ApiError, useJobApi } from "@/components/findjobs/use-admin-api"
import { Button } from "@/components/ui/button"
import { ACTIVE_STATUSES, APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/jobs/constants"
import type { PrepTopic } from "@/lib/jobs/prep-topics"
import type { Application, Company, PrepProgress } from "@/lib/jobs/schema"

export type DashboardData = {
  applications: Application[]
  companies: Company[]
  prep: PrepProgress[]
  topics: PrepTopic[]
  searchEnabled: boolean
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "applications", label: "Applications" },
  { id: "search", label: "Find jobs" },
  { id: "companies", label: "Companies" },
  { id: "prep", label: "Interview prep" },
] as const
type Tab = (typeof TABS)[number]["id"]

export function JobDashboard() {
  const call = useJobApi()
  const [data, setData] = useState<DashboardData | null>(null)
  const [checked, setChecked] = useState(false)
  const [tab, setTab] = useState<Tab>("overview")
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setBusy(true)
    try {
      setData(await call<DashboardData>("/api/findjobs"))
      return true
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) setData(null)
      else setStatus({ text: (error as Error).message, error: true })
      return false
    } finally {
      setBusy(false)
      setChecked(true)
    }
  }, [call])

  useEffect(() => {
    // Opens straight away when this browser is already logged in.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading saved data once on mount is intended
    void load()
  }, [load])

  const act = useCallback(
    async (body: unknown, done: string) => {
      setBusy(true)
      try {
        await call("/api/findjobs", { method: "POST", body })
        await load()
        setStatus({ text: done })
        return true
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) setData(null)
        setStatus({ text: (error as Error).message, error: true })
        return false
      } finally {
        setBusy(false)
      }
    },
    [call, load],
  )

  const save: Save = useMemo(
    () => ({
      application: (item, done = "Application saved.") => act({ action: "save_application", item }, done),
      company: (item, done = "Company saved.") => act({ action: "save_company", item }, done),
      remove: (kind, id) => act({ action: kind === "application" ? "delete_application" : "delete_company", id }, "Deleted."),
      prep: (topicId, done, notes) => act({ action: "set_prep", item: { topicId, done, notes } }, done ? "Marked as done." : "Progress saved."),
    }),
    [act],
  )

  async function logout() {
    await call("/api/findjobs/logout", { method: "POST" }).catch(() => {})
    setData(null)
    setStatus(null)
  }

  if (!checked) return <main className="p-6 text-sm text-muted-foreground">Loading…</main>
  if (!data) return <LoginForm call={call} onDone={load} />

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Find jobs</h1>
          <p className="text-sm text-muted-foreground">Applications, target companies, job search and interview prep.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => load()} disabled={busy}>
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b" aria-label="Dashboard sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm ${tab === t.id ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {status && (
        <p role="status" className={`rounded-md border p-3 text-sm ${status.error ? "border-destructive text-destructive" : ""}`}>
          {status.text}
        </p>
      )}

      {tab === "overview" && <Overview data={data} onOpen={setTab} />}
      {tab === "applications" && <ApplicationsPanel applications={data.applications} save={save} busy={busy} />}
      {tab === "search" && (
        <SearchPanel
          enabled={data.searchEnabled}
          savedIds={new Set(data.applications.map((a) => a.externalId).filter(Boolean))}
          call={call}
          save={save}
          busy={busy}
        />
      )}
      {tab === "companies" && <CompaniesPanel companies={data.companies} save={save} busy={busy} />}
      {tab === "prep" && <PrepPanel topics={data.topics} progress={data.prep} save={save} busy={busy} />}
    </main>
  )
}

function LoginForm({ call, onDone }: { call: ReturnType<typeof useJobApi>; onDone: () => Promise<boolean> }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-3 p-6">
      <h1 className="text-xl font-semibold">Find jobs</h1>
      <p className="text-sm text-muted-foreground">Private dashboard. Log in to continue.</p>
      <form
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          setError("")
          try {
            await call("/api/findjobs/login", { method: "POST", body: { username, password } })
            setPassword("")
            await onDone()
          } catch (err) {
            setError((err as Error).message)
          } finally {
            setBusy(false)
          }
        }}
      >
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-base"
          placeholder="Username"
          autoComplete="username"
          aria-label="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-base"
          placeholder="Password"
          autoComplete="current-password"
          aria-label="Password"
          required
        />
        <Button type="submit" disabled={busy || !username || !password}>
          {busy ? "Logging in…" : "Log in"}
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </main>
  )
}

function Overview({ data, onOpen }: { data: DashboardData; onOpen: (tab: Tab) => void }) {
  const now = today()
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, data.applications.filter((a) => a.status === s).length]))
  const followUps = data.applications
    .filter((a) => a.followUpOn && a.followUpOn <= now && ACTIVE_STATUSES.has(a.status))
    .sort((a, b) => a.followUpOn.localeCompare(b.followUpOn))
  const prepDone = data.prep.filter((p) => p.done).length
  const toContact = data.companies.filter((c) => c.status === "to_contact").length

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {APPLICATION_STATUSES.map((s) => (
          <button key={s} type="button" onClick={() => onOpen("applications")} className="rounded-lg border p-3 text-left hover:bg-muted">
            <p className="text-2xl font-semibold">{counts[s]}</p>
            <p className="text-xs text-muted-foreground">{STATUS_LABELS[s]}</p>
          </button>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onOpen("companies")} className="rounded-lg border p-3 text-left hover:bg-muted">
          <p className="text-2xl font-semibold">{toContact}</p>
          <p className="text-xs text-muted-foreground">Companies still to contact (of {data.companies.length})</p>
        </button>
        <button type="button" onClick={() => onOpen("prep")} className="rounded-lg border p-3 text-left hover:bg-muted">
          <p className="text-2xl font-semibold">
            {prepDone}/{data.topics.length}
          </p>
          <p className="text-xs text-muted-foreground">Interview prep topics done</p>
        </button>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Follow-ups due ({followUps.length})</h2>
        {followUps.length === 0 && <p className="text-sm text-muted-foreground">Nothing due today.</p>}
        {followUps.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
            <span>
              <span className="font-medium">{a.company}</span> · {a.role}
            </span>
            <span className={a.followUpOn < now ? "text-destructive" : "text-muted-foreground"}>
              {a.followUpOn < now ? "Overdue since" : "Due"} {a.followUpOn}
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}
