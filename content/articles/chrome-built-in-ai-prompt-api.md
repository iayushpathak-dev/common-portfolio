## Introduction

Chrome ships Gemini Nano, a small model that runs on the user's device, and exposes it through built-in AI APIs: Prompt, Summarizer, Writer, Rewriter, Proofreader, Translator and Language Detector. The Prompt API reached stable on the web in Chrome 148 in 2026. For frontend engineers this means some AI features need no server, no API key and no per-request cost. These are my notes on when that is a good idea.

## Problem statement

Every cloud model call adds latency, cost and a privacy question. Many small features (summarise this review, rewrite this note more politely, classify this message) do not need a frontier model. Sending that text to a server can be overkill, and it does not work offline.

## Learning objectives

1. Check availability and handle the model download.
2. Create a session and stream a response.
3. Use structured output with a JSON Schema.
4. Design a hybrid fallback to a cloud model.

## Core concepts

- **Availability states**: unavailable, downloadable, downloading, available.
- **Sessions**: a `LanguageModel` session keeps context across prompts and can be cloned or destroyed.
- **Structured output**: pass a JSON Schema as a response constraint.
- **Hardware requirements**: desktop Chrome, enough disk space and either a capable GPU or 16 GB of RAM; not mobile yet.

## Technical explanation

```text
user action ─► LanguageModel.availability()
             ├─ "available"    ─► create session ─► promptStreaming()
             ├─ "downloadable" ─► create() with monitor, show progress, then prompt
             └─ "unavailable"  ─► call your server route (cloud model)
```

The model download happens once per browser, triggered by the first origin that asks, so the first run can take a while.

## Code example

```ts
async function summariseLocally(text: string, onChunk: (s: string) => void) {
  if (!("LanguageModel" in self)) return summariseOnServer(text)
  const availability = await LanguageModel.availability()
  if (availability === "unavailable") return summariseOnServer(text)

  const session = await LanguageModel.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => setProgress(e.loaded))
    },
  })
  try {
    const stream = session.promptStreaming(`Summarise in two sentences:\n\n${text}`)
    for await (const chunk of stream) onChunk(chunk)
  } finally {
    session.destroy()
  }
}
```

Typings are available in the `@types/dom-chromium-ai` package.

## Production considerations

- Trigger model creation on a user action, not on page load, and show download progress.
- Keep prompts short and tasks narrow; a small model degrades quickly on open-ended questions.
- Measure quality on your own examples before replacing a cloud call.

## Trade-offs and alternatives

On-device: private, free per call, offline-capable, but limited quality and not available on every device. Cloud: better quality and consistent availability, but cost and latency. A hybrid with the same interface for both lets you choose per device. Libraries like Transformers.js with WebGPU are another on-device route with models you choose yourself.

## Common mistakes

- Assuming every visitor has the model and shipping no fallback.
- Creating a new session per keystroke instead of reusing or cloning one.
- Using a small on-device model for tasks that need recent knowledge.

## Key takeaways

- Chrome's built-in AI runs Gemini Nano locally through web APIs.
- It suits narrow tasks: summarise, rewrite, classify, extract.
- Always feature-detect, show download progress and keep a server fallback.
