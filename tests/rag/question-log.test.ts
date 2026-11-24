import { describe, expect, it } from "vitest"

import { faqDocument } from "@/lib/rag/documents"
import { parseAdminAction, questionId, recordUnanswered, redactQuestion, type QuestionStore } from "@/lib/rag/question-log"
import { createMemoryQuestionStore } from "../helpers/fakes"

const PAGES = ["/about", "/projects/fitshop"]

describe("redactQuestion", () => {
  it("removes emails, links and long numbers", () => {
    const out = redactQuestion("Mail me at a.b@example.com or call +91 98765 43210, see https://x.dev/y")
    expect(out).not.toMatch(/example\.com|98765|x\.dev/)
    expect(out).toContain("[email]")
    expect(out).toContain("[number]")
    expect(out).toContain("[link]")
  })

  it("keeps short numbers such as years and versions", () => {
    expect(redactQuestion("What did you do in 2022 with Next.js 16?")).toBe("What did you do in 2022 with Next.js 16?")
  })

  it("caps the length", () => {
    expect(redactQuestion("a".repeat(1000)).length).toBe(300)
  })
})

describe("questionId", () => {
  it("is the same for the same question asked with different case, spacing or punctuation", () => {
    expect(questionId("What is your salary?")).toBe(questionId("  what is your   SALARY "))
    expect(questionId("What is your salary?")).not.toBe(questionId("What is your notice period?"))
  })
})

describe("recordUnanswered", () => {
  it("saves only unanswered routes and counts repeats", async () => {
    const { store, pending } = createMemoryQuestionStore()
    await recordUnanswered(store, "What is your notice period?", "no_context")
    await recordUnanswered(store, "what is your notice period", "no_context")
    await recordUnanswered(store, "Tell me about Fitshop", "personal_rag")
    expect(pending.size).toBe(1)
    expect([...pending.values()][0].count).toBe(2)
  })

  it("never throws or blocks when the store fails or hangs", async () => {
    const failing = { record: async () => Promise.reject(new Error("down")) } as unknown as QuestionStore
    await expect(recordUnanswered(failing, "Some question here", "general")).resolves.toBeUndefined()
    const hanging = { record: () => new Promise(() => {}) } as unknown as QuestionStore
    const start = Date.now()
    await recordUnanswered(hanging, "Another question", "general")
    expect(Date.now() - start).toBeLessThan(3000)
  })

  it("does nothing without a store", async () => {
    await expect(recordUnanswered(null, "Anything at all", "general")).resolves.toBeUndefined()
  })
})

describe("parseAdminAction", () => {
  it("builds a learned FAQ entry from an answer", () => {
    const res = parseAdminAction(
      { action: "answer", questionId: "abc123", question: "What is your notice period?", answer: "Thirty days, negotiable.", href: "/about", variants: ["Notice period?", "x"] },
      PAGES,
      1,
    )
    expect(res.ok).toBe(true)
    if (!res.ok || res.value.action !== "answer") return
    expect(res.value.entry.id).toMatch(/^learned-[a-f0-9]{16}$/)
    expect(res.value.entry.variants).toEqual(["Notice period?"])
    expect(res.value.answeredQuestionId).toBe("abc123")
    expect(faqDocument(res.value.entry).id).toMatch(/^faq-learned-/)
  })

  it("rejects pages that don't exist, short answers and bad ids", () => {
    expect(parseAdminAction({ action: "answer", question: "Valid question?", answer: "Long enough answer.", href: "/admin" }, PAGES).ok).toBe(false)
    expect(parseAdminAction({ action: "answer", question: "Valid question?", answer: "short", href: "/about" }, PAGES).ok).toBe(false)
    expect(parseAdminAction({ action: "dismiss", questionId: "../etc" }, PAGES).ok).toBe(false)
    expect(parseAdminAction({ action: "delete", id: "faq-who-is-ayush" }, PAGES).ok).toBe(false)
    expect(parseAdminAction({ action: "nope" }, PAGES).ok).toBe(false)
  })
})
