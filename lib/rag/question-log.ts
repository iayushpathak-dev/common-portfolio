import { createHash } from "node:crypto"

import type { FaqEntry } from "@/content/faq"
import type { ChatRoute } from "@/lib/rag/types"

// Questions the assistant couldn't answer from the portfolio are saved (redacted) so Ayush can
// review them, write an answer, and add it to the knowledge base. Answers are stored as
// "learned" FAQ entries and indexed like the FAQ in content/faq.ts.

/** Routes that mean "no published content answered this". */
export const UNANSWERED_ROUTES: ReadonlySet<ChatRoute> = new Set(["no_context", "out_of_scope", "general"])

export const MAX_QUESTION_CHARS = 300
export const MAX_PENDING = 500

export type PendingQuestion = {
  id: string
  question: string
  count: number
  route: ChatRoute
  firstSeen: number
  lastSeen: number
}

export type LearnedFaq = FaqEntry & { createdAt: number }

export interface QuestionStore {
  record(input: { question: string; route: ChatRoute; at: number }): Promise<void>
  listPending(limit: number): Promise<PendingQuestion[]>
  dismiss(id: string): Promise<void>
  saveLearned(entry: LearnedFaq, answeredQuestionId?: string): Promise<void>
  listLearned(): Promise<LearnedFaq[]>
  deleteLearned(id: string): Promise<void>
}

/** Removes emails, links and long numbers (phones, IDs) so no personal data is stored. */
export function redactQuestion(question: string) {
  return question
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email]")
    .replace(/https?:\/\/\S+/gi, "[link]")
    .replace(/\+?\d[\d\s-]{5,}\d/g, "[number]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_QUESTION_CHARS)
}

/** Same question asked with different case, spacing or punctuation gets the same id. */
export function questionId(question: string) {
  const normalized = question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16)
}

/** Saves an unanswered question; failures are swallowed so chat never breaks because of it. */
export async function recordUnanswered(store: QuestionStore | null | undefined, question: string, route: ChatRoute) {
  if (!store || !UNANSWERED_ROUTES.has(route)) return
  const clean = redactQuestion(question)
  if (clean.length < 5) return
  try {
    // Never let a slow store hold up the answer.
    await Promise.race([
      store.record({ question: clean, route, at: Date.now() }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("question log timeout")), 1500)),
    ])
  } catch (error) {
    console.error(JSON.stringify({ event: "question_log_error", error: String(error).slice(0, 200) }))
  }
}

export type AdminAction =
  | { action: "answer"; entry: LearnedFaq; answeredQuestionId?: string }
  | { action: "dismiss"; questionId: string }
  | { action: "delete"; id: string }

const ID = /^[a-z0-9-]{1,64}$/

/** Validates an admin request body. Returns an error message or the action to run. */
export function parseAdminAction(
  body: unknown,
  allowedPaths: readonly string[],
  now = Date.now(),
): { ok: true; value: AdminAction } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid request." }
  const b = body as Record<string, unknown>
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")

  if (b.action === "dismiss") {
    const id = str(b.questionId)
    return ID.test(id) ? { ok: true, value: { action: "dismiss", questionId: id } } : { ok: false, error: "Invalid question id." }
  }

  if (b.action === "delete") {
    const id = str(b.id)
    return ID.test(id) && id.startsWith("learned-")
      ? { ok: true, value: { action: "delete", id } }
      : { ok: false, error: "Invalid answer id." }
  }

  if (b.action === "answer") {
    const question = redactQuestion(str(b.question))
    const answer = str(b.answer).slice(0, 2000)
    const href = str(b.href)
    const answeredQuestionId = str(b.questionId) || undefined
    if (question.length < 5) return { ok: false, error: "Question is too short." }
    if (answer.length < 10) return { ok: false, error: "Answer is too short." }
    if (!allowedPaths.includes(href)) return { ok: false, error: "Pick a page that exists on the site." }
    if (answeredQuestionId && !ID.test(answeredQuestionId)) return { ok: false, error: "Invalid question id." }
    const variants = Array.isArray(b.variants)
      ? b.variants.map(str).filter((v) => v.length >= 3).map(redactQuestion).slice(0, 5)
      : []
    return {
      ok: true,
      value: {
        action: "answer",
        answeredQuestionId,
        entry: {
          id: `learned-${questionId(question)}`,
          question,
          variants,
          answer,
          href,
          tags: ["Learned"],
          createdAt: now,
        },
      },
    }
  }

  return { ok: false, error: "Unknown action." }
}
