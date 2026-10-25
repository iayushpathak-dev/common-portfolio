import { z } from "zod"

import { CHAT_MODES, type ChatMode } from "@/lib/chat-modes"
import { RAG_CONFIG } from "@/lib/rag/config"

const { maxMessages, maxQuestionChars, maxTotalChars, historyMessages } = RAG_CONFIG.limits

const Part = z.looseObject({ type: z.string().max(64) })

const ChatRequestSchema = z.object({
  mode: z.enum(CHAT_MODES).optional(),
  messages: z
    .array(
      z.looseObject({
        id: z.string().max(200),
        role: z.enum(["user", "assistant"]),
        parts: z.array(Part).max(200),
      }),
    )
    .min(1)
    .max(maxMessages),
})

export type HistoryMessage = { role: "user" | "assistant"; content: string }

export type ParsedChatRequest = {
  mode: ChatMode
  question: string
  /** Text-only history, newest last, ending with the question. Non-text parts are dropped. */
  history: HistoryMessage[]
  /** The previous user message, used to make short follow-ups ("tell me more") searchable. */
  previousQuestion: string | null
}

export type ParseResult = { ok: true; value: ParsedChatRequest } | { ok: false; error: string }

const textOf = (parts: z.infer<typeof Part>[]) =>
  parts
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("")

/**
 * Validates the body sent by useChat and reduces it to plain text. Files, tool parts and
 * client-supplied system messages are never forwarded to the model.
 */
export function parseChatRequest(body: unknown): ParseResult {
  const parsed = ChatRequestSchema.safeParse(body)
  if (!parsed.success) return { ok: false, error: "Invalid request." }

  const messages = parsed.data.messages.map((m) => ({ role: m.role, content: textOf(m.parts).trim() }))
  const last = messages[messages.length - 1]
  if (last.role !== "user" || last.content === "") return { ok: false, error: "The last message must be a question." }
  if (last.content.length > maxQuestionChars) {
    return { ok: false, error: `Please keep questions under ${maxQuestionChars} characters.` }
  }

  // Keep the newest messages that fit the history budget; the question itself always fits.
  const history: HistoryMessage[] = []
  let total = 0
  for (const m of messages.slice(-historyMessages).reverse()) {
    if (m.content === "") continue
    const content = m.content.slice(0, maxQuestionChars * 2)
    if (history.length > 0 && total + content.length > maxTotalChars) break
    total += content.length
    history.unshift({ role: m.role, content })
  }

  const previousUser = messages.slice(0, -1).findLast((m) => m.role === "user" && m.content !== "")
  return {
    ok: true,
    value: {
      mode: parsed.data.mode ?? "auto",
      question: last.content,
      history,
      previousQuestion: previousUser?.content.slice(0, maxQuestionChars) ?? null,
    },
  }
}
