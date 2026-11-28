"use client"

import { useState } from "react"

import type { Save } from "@/components/findjobs/shared"
import { Button } from "@/components/ui/button"
import type { PrepTopic } from "@/lib/jobs/prep-topics"
import type { PrepProgress } from "@/lib/jobs/schema"

export function PrepPanel({ topics, progress, save, busy }: { topics: PrepTopic[]; progress: PrepProgress[]; save: Save; busy: boolean }) {
  const byId = new Map(progress.map((p) => [p.topicId, p]))
  const groups = [...new Set(topics.map((t) => t.group))]
  const done = topics.filter((t) => byId.get(t.id)?.done).length
  const pct = topics.length ? Math.round((done / topics.length) * 100) : 0

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm">
          {done} of {topics.length} topics done ({pct}%)
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Prep progress">
          <div className="h-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {groups.map((group) => {
        const items = topics.filter((t) => t.group === group)
        const groupDone = items.filter((t) => byId.get(t.id)?.done).length
        return (
          <section key={group} className="flex flex-col gap-2">
            <h2 className="font-semibold">
              {group}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                {groupDone}/{items.length}
              </span>
            </h2>
            <ul className="flex flex-col gap-2">
              {items.map((t) => (
                <TopicRow key={t.id} topic={t} progress={byId.get(t.id)} save={save} busy={busy} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function TopicRow({ topic, progress, save, busy }: { topic: PrepTopic; progress?: PrepProgress; save: Save; busy: boolean }) {
  const [notes, setNotes] = useState(progress?.notes ?? "")
  const [open, setOpen] = useState(false)
  const done = progress?.done ?? false

  return (
    <li className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          disabled={busy}
          onChange={(e) => save.prep(topic.id, e.target.checked, notes)}
          className="mt-1 size-4"
          aria-label={`Mark ${topic.title} as done`}
        />
        <div className="min-w-0 flex-1">
          <p className={done ? "text-muted-foreground line-through" : "font-medium"}>{topic.title}</p>
          <p className="text-xs text-muted-foreground">{topic.hint}</p>
          {progress?.notes && !open && <p className="mt-1 whitespace-pre-wrap text-xs">{progress.notes}</p>}
        </div>
        <Button size="xs" variant="ghost" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Notes"}
        </Button>
      </div>
      {open && (
        <div className="flex flex-col gap-2 pl-7">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="What you practised, links, questions to revisit…"
            className="rounded-md border bg-background px-3 py-2 text-base"
          />
          <div>
            <Button
              size="sm"
              disabled={busy}
              onClick={async () => {
                if (await save.prep(topic.id, done, notes)) setOpen(false)
              }}
            >
              Save notes
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}
