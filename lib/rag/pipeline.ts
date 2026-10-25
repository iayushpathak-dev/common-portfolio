import {
  createUIMessageStream,
  generateId,
  streamText,
  toUIMessageStream,
  type TextStreamPart,
  type ToolSet,
  type UIMessageStreamWriter,
} from "ai"

import type { AssistantMessage } from "@/lib/chat-modes"
import { PORTFOLIO } from "@/lib/portfolio"
import { RAG_CONFIG } from "@/lib/rag/config"
import type { Embedder } from "@/lib/rag/embeddings"
import { buildInstructions } from "@/lib/rag/prompt"
import { retrieve, toSources, type RetrievalResult } from "@/lib/rag/retrieve"
import { classify, routeFor } from "@/lib/rag/router"
import { errorClass, type Trace } from "@/lib/rag/telemetry"
import type { ChatRoute, RetrievedChunk } from "@/lib/rag/types"
import type { HistoryMessage, ParsedChatRequest } from "@/lib/rag/validation"
import type { VectorStore } from "@/lib/rag/vector-store"
import type { ModelFactory } from "@/lib/rag/models"

const { replies } = PORTFOLIO.chat

export type ChatDeps = {
  models: ModelFactory
  /** null when the vector store isn't configured (the assistant falls back to core profile docs). */
  retrieval: { embedder: Embedder; store: VectorStore } | null
  /** Core profile chunks used when the vector store isn't configured. */
  fallbackChunks: () => RetrievedChunk[]
  now?: () => Date
  /** Defaults to RAG_CONFIG.limits.modelTimeoutMs; overridable for tests. */
  modelTimeoutMs?: number
}

type Writer = UIMessageStreamWriter<AssistantMessage>

/** Follow-ups like "tell me more" are classified and searched together with the previous question. */
export function effectiveQuery({ question, previousQuestion }: Pick<ParsedChatRequest, "question" | "previousQuestion">) {
  const words = question.split(/\s+/).filter(Boolean).length
  return previousQuestion && words <= 6 ? `${previousQuestion}\n${question}` : question
}

/**
 * Runs one chat request and returns a UI message stream:
 * classify → (retrieve) → decide route → fixed reply or grounded generation → sources → log.
 */
export function runChat({
  request,
  deps,
  trace,
  abortSignal,
}: {
  request: ParsedChatRequest
  deps: ChatDeps
  trace: Trace
  abortSignal?: AbortSignal
}): ReadableStream {
  const { mode, history } = request
  const query = effectiveQuery(request)
  const now = deps.now ?? (() => new Date())

  return createUIMessageStream<AssistantMessage>({
    onError: (error) => userMessageFor(error),
    execute: async ({ writer }) => {
      const meta = (route: ChatRoute, extra: { searchUnavailable?: boolean } = {}) => ({
        createdAt: Date.now(),
        mode,
        route,
        requestId: trace.requestId,
        ...extra,
      })

      try {
        const intent = classify(query)
        let route = routeFor(intent, mode)
        trace.set("mode", mode)
        trace.set("intent", intent)

        if (route === "blocked" || route === "greeting") {
          return writeFixedReply(writer, meta(route), route === "blocked" ? replies.blocked : replies.greeting, trace)
        }

        // Retrieval (also used to rescue questions the keyword router doesn't recognise).
        let retrieval: RetrievalResult = { chunks: [], topScore: null, candidates: 0 }
        let retrievalFailed = false
        if (deps.retrieval) {
          try {
            retrieval = await trace.time("retrievalMs", () => retrieve(query, deps.retrieval!))
          } catch (error) {
            retrievalFailed = true
            trace.set("error", `retrieval_${errorClass(error)}`)
          }
        }
        trace.set("candidates", retrieval.candidates)
        trace.set("topScore", retrieval.topScore === null ? null : Number(retrieval.topScore.toFixed(3)))

        let chunks = retrieval.chunks
        if (route === "out_of_scope") {
          const strong = (retrieval.topScore ?? -1) >= RAG_CONFIG.retrieval.scopeOverrideScore && chunks.length > 0
          if (!strong) return writeFixedReply(writer, meta("out_of_scope"), replies.outOfScope, trace)
          route = "technical_rag"
        }

        if (route === "personal_rag") {
          if (!deps.retrieval) {
            route = "fallback"
            chunks = deps.fallbackChunks()
          } else if (retrievalFailed) {
            return writeFixedReply(writer, meta("no_context"), replies.knowledgeUnavailable, trace)
          } else if (chunks.length === 0) {
            // No evidence: answer without the model rather than risk an invented one.
            return writeFixedReply(writer, meta("no_context"), replies.noContext, trace)
          }
        }
        if (route === "technical_rag" && chunks.length === 0) route = "general"
        trace.set("chunkCount", chunks.length)

        await generate({ writer, route, chunks, history, deps, trace, abortSignal, now, meta })
      } catch (error) {
        trace.set("error", `model_${errorClass(error)}`)
        throw error // createUIMessageStream turns it into a safe error message via onError
      } finally {
        trace.end()
      }
    },
  })
}

async function generate({
  writer,
  route,
  chunks,
  history,
  deps,
  trace,
  abortSignal,
  now,
  meta,
}: {
  writer: Writer
  route: ChatRoute
  chunks: RetrievedChunk[]
  history: HistoryMessage[]
  deps: ChatDeps
  trace: Trace
  abortSignal?: AbortSignal
  now: () => Date
  meta: (route: ChatRoute, extra?: { searchUnavailable?: boolean }) => object
}) {
  const timeout = AbortSignal.timeout(deps.modelTimeoutMs ?? RAG_CONFIG.limits.modelTimeoutMs)
  const signal = abortSignal ? AbortSignal.any([abortSignal, timeout]) : timeout

  const start = (r: ChatRoute, searchUnavailable = false) => {
    const { model, tools, providerOptions } = deps.models({ webSearch: r === "web_search" })
    return streamText({
      model,
      tools,
      providerOptions,
      instructions: buildInstructions({ route: r, chunks, today: now(), searchUnavailable }),
      messages: history,
      maxOutputTokens: RAG_CONFIG.limits.maxOutputTokens,
      abortSignal: signal,
      // Retrying a quota error only burns more quota; the web route falls back instead.
      maxRetries: r === "web_search" ? 0 : 1,
    }).stream
  }

  let searchUnavailable = false
  let stream: ReadableStream<TextStreamPart<ToolSet>>
  const modelStart = performance.now()

  if (route === "web_search") {
    // Search grounding has its own small quota and can fail on its own. If it does, answer
    // without search (clearly flagged) instead of failing the whole request.
    const attempt = await peekForError(start("web_search"))
    if (attempt.error) {
      trace.set("error", `search_${errorClass(attempt.error)}`)
      searchUnavailable = true
      route = chunks.length > 0 ? "technical_rag" : "general"
      stream = start(route, true)
    } else {
      stream = attempt.stream
    }
  } else {
    stream = start(route)
  }

  trace.set("route", route)
  trace.set("searchUnavailable", searchUnavailable)
  writer.write({ type: "start", messageMetadata: meta(route, { searchUnavailable }) as AssistantMessage["metadata"] })

  let failed = false
  let textChars = 0
  const tapped = stream.pipeThrough(
    new TransformStream<TextStreamPart<ToolSet>, TextStreamPart<ToolSet>>({
      transform(part, controller) {
        if (part.type === "text-delta") textChars += part.text.trim().length
        if (part.type === "finish") {
          trace.set("inputTokens", part.totalUsage.inputTokens)
          trace.set("outputTokens", part.totalUsage.outputTokens)
        }
        if (part.type === "error") {
          failed = true
          trace.set("error", `model_${errorClass(part.error)}`)
        }
        if (part.type === "abort") failed = true
        controller.enqueue(part)
      },
    }),
  )

  const ui = toUIMessageStream<ToolSet, AssistantMessage>({
    stream: tapped,
    sendStart: false,
    sendFinish: false,
    sendReasoning: false,
    // Web sources come from the search provider; portfolio sources are added below.
    sendSources: route === "web_search",
    onError: userMessageFor,
  })

  const reader = ui.getReader()
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    writer.write(value)
  }
  trace.set("modelMs", Math.round(performance.now() - modelStart))

  // A timeout ends the stream with "abort", which would otherwise look like a finished (but
  // truncated) answer. Tell the user so they can retry.
  if (timeout.aborted && !abortSignal?.aborted) {
    trace.set("error", "model_timeout")
    writer.write({ type: "error", errorText: replies.timeout })
    return
  }

  // A model can finish without any text (e.g. it spent its whole token budget reasoning).
  // Don't show an empty bubble with citations: report it so the user can retry.
  if (!failed && textChars === 0) {
    trace.set("error", "model_empty")
    writer.write({ type: "error", errorText: replies.emptyAnswer })
    return
  }

  // Cite exactly the documents the model was given, one link per page.
  if (!failed && route !== "general" && route !== "web_search") {
    for (const source of toSources(chunks)) {
      writer.write({ type: "source-url", sourceId: source.id, url: source.url, title: source.title })
    }
  }
  writer.write({ type: "finish" })
}

function writeFixedReply(writer: Writer, metadata: object, text: string, trace: Trace) {
  const id = generateId()
  const route = (metadata as { route: ChatRoute }).route
  trace.set("route", route)
  writer.write({ type: "start", messageMetadata: metadata as AssistantMessage["metadata"] })
  writer.write({ type: "text-start", id })
  writer.write({ type: "text-delta", id, delta: text })
  writer.write({ type: "text-end", id })
  writer.write({ type: "finish" })
}

export function userMessageFor(error: unknown) {
  switch (errorClass(error)) {
    case "quota":
      return replies.quota
    case "timeout":
    case "aborted":
      return replies.timeout
    default:
      return PORTFOLIO.chat.genericError
  }
}

/**
 * Reads the stream until the model starts producing output (or fails), so a failure can be
 * swapped for a fallback before anything is sent to the client. Returns the buffered stream.
 */
export async function peekForError<T extends { type: string }>(source: ReadableStream<T>) {
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
