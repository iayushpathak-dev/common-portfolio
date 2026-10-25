## Introduction

A chat UI looks simple: a list of messages and a text box. In practice an AI chat has states that ordinary forms don't: responses arrive token by token, users want to stop generation halfway, answers contain Markdown and source links, and failures happen mid-stream. These notes cover how I structure an AI chat interface in React and Next.js, using the assistant on this site as the running example.

## Problem statement

A naive implementation (send a request, wait, render the reply) produces a UI that feels frozen for several seconds, can't be cancelled, loses context on refresh and shows raw errors. We need a design that handles streaming, cancellation, retries, rich content and persistence.

## Learning objectives

1. Model chat state as messages made of typed parts.
2. Handle the request lifecycle: idle, submitted, streaming, error.
3. Stream responses from a Next.js Route Handler.
4. Support stop, retry and keyboard shortcuts accessibly.
5. Render Markdown and citations safely.

## Core concepts

**Message parts.** Instead of one text string, each message holds an array of parts: text, source links, tool calls, files. This lets one answer contain text *and* citations without string parsing.

**Status machine.** A chat request moves through `ready → submitted → streaming → ready`, or ends in `error`. The UI should look different in each state.

**Server-Sent Events (SSE).** The server keeps the HTTP response open and writes small events as they're produced; the browser appends them to the message.

## Technical explanation

The Vercel AI SDK splits the problem in two:

- `useChat` (from `@ai-sdk/react`) holds messages and status on the client and sends requests.
- `streamText` (from `ai`) calls the model on the server, and the result is converted into a UI message stream the hook understands.

```text
<ChatComposer> ──sendMessage──► useChat ──POST /api/chat──► Route Handler
                                   ▲                          │ streamText(model)
                                   └──── SSE: text, sources ◄─┘
```

Each SSE event updates the last assistant message, and React re-renders it.

## Code example

A minimal client:

```tsx
"use client"
import { useChat } from "@ai-sdk/react"

export function Chat() {
  const { messages, sendMessage, status, stop, error, regenerate } = useChat()
  const busy = status === "submitted" || status === "streaming"

  return (
    <div>
      {messages.map((m) => (
        <article key={m.id} aria-label={m.role === "user" ? "You" : "Assistant"}>
          {m.parts.map((part, i) =>
            part.type === "text" ? <p key={i}>{part.text}</p>
            : part.type === "source-url" ? <a key={i} href={part.url}>{part.title ?? part.url}</a>
            : null,
          )}
        </article>
      ))}

      {error && (
        <div role="alert">
          Something went wrong. <button onClick={() => regenerate()}>Retry</button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement
          if (!busy && input.value.trim()) sendMessage({ text: input.value })
          input.value = ""
        }}
      >
        <input name="q" aria-label="Ask a question" />
        {busy ? <button type="button" onClick={stop}>Stop</button> : <button>Send</button>}
      </form>
    </div>
  )
}
```

And the matching Route Handler:

```ts
import { convertToModelMessages, streamText, toUIMessageStream, createUIMessageStreamResponse } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = streamText({
    model: google("gemini-2.5-flash"),
    instructions: "You are a helpful assistant.",
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal, // stop generating when the user presses Stop
  })
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })
}
```

## Architecture

On this site the chat is split into small components: a sidebar with saved chats, the message list, a composer with source-mode selection, and an insights panel. Chats are saved to `localStorage` after each completed answer, so nothing personal is stored on the server.

## Production considerations

- **Validate input on the server** (message count, text length, allowed modes). The client is not a security boundary.
- **Rate-limit** the endpoint; every request costs money.
- **Show useful errors**: quota reached, network failure, generic failure. Never show stack traces.
- **Accessibility**: label the input, announce errors with `role="alert"`, keep focus in the composer, support keyboard submission.
- **Auto-scroll carefully**: scroll to new content only if the user is already near the bottom.
- **Render Markdown safely**: use a renderer that doesn't execute raw HTML, and open model-provided links in a new tab with `rel="noreferrer"`.
- **Persistence**: decide whether chats live on the client (private, simple) or the server (cross-device, but now you store user data).

## Trade-offs and alternatives

- **SDK vs hand-written SSE.** The SDK handles the stream protocol, parts and status; writing it yourself gives full control but means re-implementing reconnection and part merging.
- **Client vs server persistence.** `localStorage` is private and free but per-device; a database enables history across devices but needs auth and data retention rules.
- **Streaming vs waiting.** Streaming improves perceived speed but makes post-processing (like validating the whole answer) harder.

## Common mistakes

- Using array indexes as keys for messages, causing re-render bugs.
- Allowing a second send while a response is still streaming.
- Not forwarding the abort signal, so "Stop" hides the answer but the server keeps paying for tokens.
- Rendering model output with `dangerouslySetInnerHTML`.
- Showing the raw error message from the provider to users.

## Key takeaways

- Treat chat as a state machine with streaming as a first-class state.
- Use typed message parts for text, sources and tools.
- Validate and rate-limit on the server; forward abort signals.
- Render Markdown safely and design for accessibility from the start.
