import { createGoogleGenerativeAI, google } from "@ai-sdk/google"
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type TextStreamPart,
  type ToolSet,
} from "ai"

import { GEMINI_MODEL } from "@/lib/model"
import { CHAT_MODES, type AssistantMessage, type ChatMode } from "@/lib/chat-modes"
import { PORTFOLIO, portfolioContext } from "@/lib/portfolio"

export const maxDuration = 30

const IS_GEMINI = GEMINI_MODEL.startsWith("gemini-")

// The AI SDK only forwards google.tools.googleSearch() for gemini-* model ids and silently
// drops it for Gemma, although the API supports search grounding there. This provider adds
// the search tool to the request body itself.
const searchProvider = createGoogleGenerativeAI({
  fetch: async (url, init) => {
    if (typeof init?.body === "string") {
      const body = JSON.parse(init.body)
      body.tools = [...(body.tools ?? []), { googleSearch: {} }]
      init = { ...init, body: JSON.stringify(body) }
    }
    return fetch(url, init)
  },
})

const { name: NAME, firstName: FIRST } = PORTFOLIO.profile

const BASE_INSTRUCTIONS = `You are the AI assistant on ${NAME}'s portfolio website. You speak as ${FIRST}, in the first person ("I worked on...").

Rules:
- Reply in the same language and style as the visitor. If they write in Hinglish, reply in Hinglish.
- Use Markdown: short paragraphs, numbered or bulleted lists, **bold** for key terms.
- Never invent employers, dates, metrics or projects. If the portfolio data doesn't cover something about ${FIRST}, say so and suggest contacting him.
- Keep answers focused and skimmable.

Portfolio data (the only trusted source about ${FIRST}):
${portfolioContext()}`

const MODE_INSTRUCTIONS: Record<ChatMode, string> = {
  knowledge:
    `Answer only from the portfolio data. Do not use outside knowledge for questions about ${FIRST}. For general tech questions, answer briefly from your own knowledge and say it may be out of date.`,
  web: `Always call Google Search before answering technology questions (versions, releases, comparisons, news): your training data is out of date. Use the portfolio data for questions about ${FIRST}.`,
  auto: `Questions about ${FIRST}: answer from the portfolio data, no search needed. Questions about versions, releases, "latest" anything or news: you MUST call Google Search first, because your training data is out of date. Never answer those from memory.`,
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to .env.local." },
      { status: 500 },
    )
  }

  const { messages, mode: rawMode }: { messages: AssistantMessage[]; mode?: string } = await req.json()
  const mode: ChatMode = CHAT_MODES.includes(rawMode as ChatMode) ? (rawMode as ChatMode) : "auto"
  const modelMessages = await convertToModelMessages(messages)

  const run = (sourceMode: ChatMode) =>
    streamText({
      model: sourceMode !== "knowledge" && !IS_GEMINI ? searchProvider(GEMINI_MODEL) : google(GEMINI_MODEL),
      instructions: `${BASE_INSTRUCTIONS}\n\nToday is ${new Date().toDateString()}.\n\nSource mode: ${MODE_INSTRUCTIONS[sourceMode]}`,
      messages: modelMessages,
      tools: sourceMode !== "knowledge" && IS_GEMINI ? { google_search: google.tools.googleSearch({}) } : {},
      // Retrying a quota error only burns more quota; the fallback below handles it instead.
      maxRetries: sourceMode === "knowledge" ? 2 : 0,
    }).stream

  let stream: ReadableStream<TextStreamPart<ToolSet>>
  let searchUnavailable = false

  if (mode === "knowledge") {
    stream = run("knowledge")
  } else {
    // Google Search grounding has its own (small) quota. If it's exhausted, answer from
    // portfolio data instead of failing the whole request.
    const attempt = await peekForError(run(mode))
    if (attempt.error && isQuotaError(attempt.error)) {
      searchUnavailable = true
      stream = run("knowledge")
    } else {
      stream = attempt.stream
    }
  }

  return createUIMessageStreamResponse({
    stream: toUIMessageStream<ToolSet, AssistantMessage>({
      stream,
      sendSources: true,
      sendReasoning: false,
      messageMetadata: ({ part }) =>
        part.type === "start" ? { createdAt: Date.now(), mode, searchUnavailable } : undefined,
      onError: (error) =>
        isQuotaError(error)
          ? "Gemini's usage limit was reached. Please wait a minute and try again."
          : "Something went wrong while answering. Please try again.",
    }),
  })
}

/**
 * Reads the stream until the model starts producing output (or fails), so a failure can be
 * swapped for a fallback before anything is sent to the client. Returns the buffered stream.
 */
async function peekForError<T extends { type: string }>(source: ReadableStream<T>) {
  const reader = source.getReader()
  const buffered: T[] = []

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    if (value.type === "error") {
      await reader.cancel()
      return { error: (value as T & { error: unknown }).error, stream: null as never }
    }
    buffered.push(value)
    if (value.type === "text-delta" || value.type === "source") break
  }

  const stream = new ReadableStream<T>({
    start(controller) {
      buffered.forEach((part) => controller.enqueue(part))
    },
    async pull(controller) {
      const { value, done } = await reader.read()
      if (done) controller.close()
      else controller.enqueue(value)
    },
    cancel(reason) {
      return reader.cancel(reason)
    },
  })
  return { error: null, stream }
}

function isQuotaError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const e = error as { statusCode?: number; lastError?: unknown }
  return e.statusCode === 429 || (e.lastError !== undefined && isQuotaError(e.lastError))
}
