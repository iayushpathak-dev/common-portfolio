"use client"

import { useState } from "react"

import { field, today, type Save } from "@/components/findjobs/shared"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { APPLICATION_STATUSES, SOURCES, STATUS_LABELS, type ApplicationStatus } from "@/lib/jobs/constants"
import type { Application, ApplicationInput } from "@/lib/jobs/schema"


type Draft = Omit<ApplicationInput, "externalId"> & { externalId?: string }

const empty = (): Draft => ({
  company: "",
  role: "",
  location: "",
  url: "",
  source: "LinkedIn",
  status: "applied",
  appliedOn: today(),
  followUpOn: "",
  salary: "",
  notes: "",
})

export function ApplicationsPanel({ applications, save, busy }: { applications: Application[]; save: Save; busy: boolean }) {
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all")
  const [editing, setEditing] = useState<Draft | null>(null)
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const shown = applications.filter(
    (a) => (filter === "all" || a.status === filter) && (!q || `${a.company} ${a.role} ${a.location}`.toLowerCase().includes(q)),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setEditing(empty())} disabled={busy}>
          Add application
        </Button>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company or role" className={`${field} min-w-0 flex-1`} aria-label="Search applications" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as ApplicationStatus | "all")} className={field} aria-label="Filter by status">
          <option value="all">All ({applications.length})</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]} ({applications.filter((a) => a.status === s).length})
            </option>
          ))}
        </select>
      </div>

      {editing && (
        <ApplicationForm
          draft={editing}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={async (d) => {
            if (await save.application(d)) setEditing(null)
          }}
        />
      )}

      {shown.length === 0 && <p className="text-sm text-muted-foreground">No applications here yet.</p>}

      <ul className="flex flex-col gap-2">
        {shown.map((a) => (
          <li key={a.id} className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">
                  {a.url ? (
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {a.role}
                    </a>
                  ) : (
                    a.role
                  )}
                </p>
                <p className="text-muted-foreground">
                  {a.company}
                  {a.location && ` · ${a.location}`} · {a.source}
                </p>
              </div>
              <select
                value={a.status}
                disabled={busy}
                onChange={(e) => save.application({ ...a, status: e.target.value as ApplicationStatus }, "Status updated.")}
                className="rounded-md border bg-background px-2 py-1 text-sm"
                aria-label={`Status for ${a.role} at ${a.company}`}
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {a.appliedOn && <span>Applied {a.appliedOn}</span>}
              {a.followUpOn && <span>Follow up {a.followUpOn}</span>}
              {a.salary && <span>{a.salary}</span>}
            </div>
            {a.notes && <p className="whitespace-pre-wrap text-muted-foreground">{a.notes}</p>}
            <div className="flex gap-2">
              <Button size="xs" variant="outline" disabled={busy} onClick={() => setEditing({ ...a })}>
                Edit
              </Button>
              <Button
                size="xs"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`Delete ${a.role} at ${a.company}?`)) void save.remove("application", a.id)
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ApplicationForm({ draft, busy, onSave, onCancel }: { draft: Draft; busy: boolean; onSave: (d: Draft) => void; onCancel: () => void }) {
  const [d, setD] = useState(draft)
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(d)
      }}
    >
      <input required value={d.company} onChange={(e) => set("company", e.target.value)} placeholder="Company" className={field} aria-label="Company" />
      <input required value={d.role} onChange={(e) => set("role", e.target.value)} placeholder="Role" className={field} aria-label="Role" />
      <input value={d.location} onChange={(e) => set("location", e.target.value)} placeholder="Location" className={field} aria-label="Location" />
      <input value={d.url} onChange={(e) => set("url", e.target.value)} placeholder="Job link (https://…)" className={field} aria-label="Job link" type="url" />
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Source
        <select value={d.source} onChange={(e) => set("source", e.target.value as Draft["source"])} className={field}>
          {SOURCES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Status
        <select value={d.status} onChange={(e) => set("status", e.target.value as ApplicationStatus)} className={field}>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Applied on
        <input type="date" value={d.appliedOn} onChange={(e) => set("appliedOn", e.target.value)} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Follow up on
        <input type="date" value={d.followUpOn} onChange={(e) => set("followUpOn", e.target.value)} className={field} />
      </label>
      <input value={d.salary} onChange={(e) => set("salary", e.target.value)} placeholder="Salary / CTC notes (optional)" className={`${field} sm:col-span-2`} aria-label="Salary" />
      <Textarea value={d.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Notes: recruiter, rounds, what was asked…" rows={3} className="sm:col-span-2" />
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={busy || !d.company.trim() || !d.role.trim()}>
          {d.id ? "Save changes" : "Add"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
