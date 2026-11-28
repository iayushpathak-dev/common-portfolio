"use client"

import { useState } from "react"

import { field, type Save } from "@/components/findjobs/shared"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CITIES, COMPANY_STATUS_LABELS, COMPANY_STATUSES, type CompanyStatus } from "@/lib/jobs/constants"
import type { Company, CompanyInput } from "@/lib/jobs/schema"

type City = (typeof CITIES)[number]

const empty = (): CompanyInput => ({ name: "", city: "Noida", stack: "React, Next.js", careersUrl: "", contact: "", status: "to_contact", notes: "" })

export function CompaniesPanel({ companies, save, busy }: { companies: Company[]; save: Save; busy: boolean }) {
  const [city, setCity] = useState<City | "all">("all")
  const [editing, setEditing] = useState<CompanyInput | null>(null)

  const shown = companies.filter((c) => city === "all" || c.city === city)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setEditing(empty())} disabled={busy}>
          Add company
        </Button>
        <select value={city} onChange={(e) => setCity(e.target.value as City | "all")} className={field} aria-label="Filter by city">
          <option value="all">All cities ({companies.length})</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c} ({companies.filter((x) => x.city === c).length})
            </option>
          ))}
        </select>
      </div>

      {editing && (
        <CompanyForm
          draft={editing}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={async (d) => {
            if (await save.company(d)) setEditing(null)
          }}
        />
      )}

      {shown.length === 0 && <p className="text-sm text-muted-foreground">No companies yet. Add the ones you want to reach out to.</p>}

      <ul className="grid gap-2 sm:grid-cols-2">
        {shown.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">
                  {c.careersUrl ? (
                    <a href={c.careersUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {c.name}
                    </a>
                  ) : (
                    c.name
                  )}
                </p>
                <p className="text-muted-foreground">
                  {c.city}
                  {c.stack && ` · ${c.stack}`}
                </p>
              </div>
              <select
                value={c.status}
                disabled={busy}
                onChange={(e) => save.company({ ...c, status: e.target.value as CompanyStatus }, "Status updated.")}
                className="rounded-md border bg-background px-2 py-1 text-sm"
                aria-label={`Status for ${c.name}`}
              >
                {COMPANY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {COMPANY_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            {c.contact && <p className="text-xs text-muted-foreground">Contact: {c.contact}</p>}
            {c.notes && <p className="whitespace-pre-wrap text-muted-foreground">{c.notes}</p>}
            <div className="flex gap-2">
              <Button size="xs" variant="outline" disabled={busy} onClick={() => setEditing({ ...c })}>
                Edit
              </Button>
              <Button
                size="xs"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`Delete ${c.name}?`)) void save.remove("company", c.id)
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

function CompanyForm({ draft, busy, onSave, onCancel }: { draft: CompanyInput; busy: boolean; onSave: (d: CompanyInput) => void; onCancel: () => void }) {
  const [d, setD] = useState(draft)
  const set = <K extends keyof CompanyInput>(key: K, value: CompanyInput[K]) => setD((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(d)
      }}
    >
      <input required value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Company name" className={field} aria-label="Company name" />
      <select value={d.city} onChange={(e) => set("city", e.target.value as City)} className={field} aria-label="City">
        {CITIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input value={d.stack} onChange={(e) => set("stack", e.target.value)} placeholder="Tech stack" className={field} aria-label="Tech stack" />
      <input value={d.careersUrl} onChange={(e) => set("careersUrl", e.target.value)} placeholder="Careers page (https://…)" className={field} aria-label="Careers page" type="url" />
      <input value={d.contact} onChange={(e) => set("contact", e.target.value)} placeholder="HR / recruiter email or name" className={`${field} sm:col-span-2`} aria-label="Contact" />
      <Textarea value={d.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Notes: what they build, who you know there…" rows={3} className="sm:col-span-2" />
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={busy || !d.name.trim()}>
          {d.id ? "Save changes" : "Add"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
