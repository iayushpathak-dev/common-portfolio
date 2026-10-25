## Introduction

The Vercel AI SDK is a TypeScript toolkit that puts one interface in front of many model providers and connects server-side generation to React UIs. These notes trace a single request through it, from the prompt a user types to the streamed response on screen, using the API surface of AI SDK v7, which this site uses.

## Problem statement

Every provider has its own HTTP API, streaming format, tool-calling shape and error types. Writing that glue per provider, plus a streaming protocol for the browser, is a lot of undifferentiated work. The SDK standardises it, but you need to understand its layers to debug it.

## Learning objectives

1. Name the SDK's layers: providers, core, UI.
2. Follow a request through `useChat`, the route handler, `streamText` and back.
3. Understand UI messages vs model messages.
4. Know where to add validation, sources, metadata and error handling.

## Core concepts

- **Provider packages** (`@ai-sdk/google`, `@ai-sdk/anthropic`, …) adapt a vendor API to a common model interface.
- **AI SDK Core** (`ai`) has the functions: `generateText`, `streamText`, `embed`, `embedMany`, plus tools and structured output.
- **AI SDK UI** (`@ai-sdk/react`) has hooks like `useChat` that manage client state and the streaming protocol.
- **UI messages** are what the client stores (with parts and metadata). **Model messages** are what the provider receives. `convertToModelMessages` translates between them.

## Technical explanation

```text
Browser                                  Server (Route Handler)
───────                                  ──────────────────────
useChat.sendMessage({ text })
  └─ POST /api/chat { messages } ──────► validate body
                                          convertToModelMessages(messages)
                                          streamText({ model, instructions, messages, tools })
                                            └─ provider adapter ──► model API
                                          toUIMessageStream(result.stream)
  ◄──────── SSE: start, text-delta, ─────  createUIMessageStreamResponse(...)
            source-url, finish
useChat appends parts → React re-renders
```

Key points:

- `instructions` (called `system` in older versions) is the system prompt.
- `result.stream` is a stream of typed parts: `text-delta`, `source`, `tool-call`, `finish` (with token usage), `error`.
- `toUIMessageStream` turns those into UI message chunks; options like `sendSources` and `messageMetadata` control what the client receives.
- `createUIMessageStream({ execute })` lets you write your own chunks (for example, citations from your own retrieval) and merge the model's stream in.

## Code example

Attaching your own sources and metadata to a streamed answer:

```ts
import { createUIMessageStream, createUIMessageStreamResponse, streamText, toUIMessageStream } from "ai"

export async function POST(req: Request) {
  const { question, messages } = await parseAndValidate(req) // your validation
  const chunks = await retrieve(question) // your RAG step

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({ model, instructions: buildPrompt(chunks), messages })
      writer.merge(
        toUIMessageStream({
          stream: result.stream,
          messageMetadata: ({ part }) => (part.type === "start" ? { route: "rag" } : undefined),
        }),
      )
      for (const c of chunks) {
        writer.write({ type: "source-url", sourceId: c.id, url: c.url, title: c.title })
      }
    },
    onError: () => "Something went wrong. Please try again.", // never leak internals
  })

  return createUIMessageStreamResponse({ stream })
}
```

## Production considerations

- **Validate the request body** before converting messages; the client can send anything.
- **Mask errors**: `onError` should return a safe message; log the real error server-side.
- **Abort**: pass `req.signal` as `abortSignal` so cancelled requests stop generating.
- **Limits**: set `maxOutputTokens`, and `maxRetries` deliberately (retrying a quota error just burns quota).
- **Usage**: read token usage from the `finish` part or `result.usage` and log it with a request ID.
- **Version drift**: the SDK evolves quickly. Check the installed version's docs; names like `system` → `instructions` changed between majors.

## Trade-offs and alternatives

- **AI SDK vs provider SDKs.** The AI SDK makes switching providers easy and handles UI streaming; a provider's own SDK exposes vendor-specific features first.
- **AI SDK vs LangChain-style frameworks.** The AI SDK is closer to the metal (functions, not chains), which makes behaviour easier to follow; heavier frameworks offer more ready-made components but more abstraction.
- **Streaming vs non-streaming.** `generateText` is simpler for background jobs and evaluations; `streamText` is better for interactive UIs.

## Common mistakes

- Sending UI messages straight to the provider without `convertToModelMessages`.
- Trusting `mode` or other flags from the client without validating them.
- Returning provider error messages to the browser.
- Copying examples from an older major version (for example, using `system` where the installed version expects `instructions`).

## Key takeaways

- Providers adapt vendors; Core generates; UI streams to React.
- A request flows: `useChat` → route handler → `streamText` → UI message stream → `useChat`.
- Custom streams let you add sources and metadata alongside model output.
- Validate input, mask errors, forward aborts and log usage.
