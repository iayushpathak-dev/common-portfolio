"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Pending = { id: string; question: string; count: number; route: string; firstSeen: number; lastSeen: number }
type Learned = { id: string; question: string; answer: string; href: string; createdAt: number }
type Data = { pending: Pending[]; learned: Learned[]; pages: string[] }

const SECRET_KEY = "rag-admin-secret"

const ROUTE_LABELS: Record<string, string> = {
  no_context: "About me, nothing published",
  out_of_scope: "Out of scope",
  general: "Technical, no matching content",
}

function readSecret() {
  try {
    return sessionStorage.getItem(SECRET_KEY) ?? ""
  } catch {
    return ""
  }
}

export function QuestionsAdmin() {
  const [secret, setSecret] = useState("")
  const [data, setData] = useState<Data | null>(null)
  const [status, setStatus] = useState("")
  const [busy, setBusy] = useState(false)

  async function call(method: "GET" | "POST", body?: unknown, key = secret || readSecret()) {
    const res = await fetch("/api/admin/questions", {
      method,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`)
    return json
  }

  async function load(key = secret || readSecret()) {
    setBusy(true)
    setStatus("")
    try {
      const json = (await call("GET", undefined, key)) as Data
      setData(json)
      try {
        sessionStorage.setItem(SECRET_KEY, key)
      } catch {}
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function act(body: Record<string, unknown>, done: string) {
    setBusy(true)
    setStatus("")
    try {
      const json = await call("POST", body)
      setStatus(json.note ?? (json.indexed ? `${done} Added to the knowledge base.` : done))
      await load()
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!data) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-3 p-6">
        <h1 className="text-xl font-semibold">User questions</h1>
        <p className="text-sm text-muted-foreground">Enter the admin secret (RAG_ADMIN_SECRET) to review questions.</p>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-base"
          placeholder="Admin secret"
          autoComplete="off"
        />
        <Button onClick={() => load(secret)} disabled={busy || secret.length === 0}>
          {busy ? "Loading…" : "Open"}
        </Button>
        {status && <p className="text-sm text-destructive">{status}</p>}
      </main>
    )
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">User questions</h1>
        <Button variant="outline" size="sm" onClick={() => load()} disabled={busy}>
          Refresh
        </Button>
      </header>
      {status && <p className="rounded-md border p-3 text-sm">{status}</p>}

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Waiting for an answer ({data.pending.length})</h2>
        {data.pending.length === 0 && <p className="text-sm text-muted-foreground">Nothing new.</p>}
        {data.pending.map((q) => (
          <PendingCard
            key={q.id}
            question={q}
            pages={data.pages}
            busy={busy}
            onAnswer={(fields) => act({ action: "answer", questionId: q.id, ...fields }, "Answer saved.")}
            onDismiss={() => act({ action: "dismiss", questionId: q.id }, "Dismissed.")}
          />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Answers you added ({data.learned.length})</h2>
        {data.learned.map((l) => (
          <div key={l.id} className="rounded-lg border p-3 text-sm">
            <p className="font-medium">{l.question}</p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{l.answer}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Source: {l.href}</span>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => act({ action: "delete", id: l.id }, "Deleted.")}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}

function PendingCard({
  question,
  pages,
  busy,
  onAnswer,
  onDismiss,
}: {
  question: Pending
  pages: string[]
  busy: boolean
  onAnswer: (fields: { question: string; answer: string; href: string; variants: string[] }) => void
  onDismiss: () => void
}) {
  const [text, setText] = useState(question.question)
  const [answer, setAnswer] = useState("")
  const [href, setHref] = useState("/about")
  const [variants, setVariants] = useState("")

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Asked {question.count}×</span>
        <span>·</span>
        <span>{ROUTE_LABELS[question.route] ?? question.route}</span>
        <span>·</span>
        <span>Last: {new Date(question.lastSeen).toLocaleString()}</span>
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="rounded-md border bg-background px-3 py-2 text-base font-medium"
        aria-label="Question"
      />
      <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer, in the first person" rows={4} />
      <input
        value={variants}
        onChange={(e) => setVariants(e.target.value)}
        className="rounded-md border bg-background px-3 py-2 text-base"
        placeholder="Other ways to ask it (optional, separate with |)"
      />
      <div className="flex flex-wrap items-center gap-2">
        <select value={href} onChange={(e) => setHref(e.target.value)} className="rounded-md border bg-background px-2 py-2 text-base" aria-label="Source page">
          {pages.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          disabled={busy || answer.trim().length < 10}
          onClick={() => onAnswer({ question: text, answer, href, variants: variants.split("|") })}
        >
          Save answer
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
