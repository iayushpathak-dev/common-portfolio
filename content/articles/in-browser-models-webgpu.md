## Introduction

Chrome's built-in AI gives you one model chosen by the browser. Another option is to ship your own small model to the browser and run it with WebGPU, using libraries such as Transformers.js or WebLLM. In 2026 this is practical for embeddings, classification, speech-to-text and small text models. These are learning notes on when it is worth the download.

## Problem statement

Some features need AI on every keystroke or on private data: semantic search over a user's notes, live transcription, smart filters. Sending each event to a server is slow and expensive, and some data should not leave the device at all.

## Learning objectives

1. Explain what WebGPU adds over WebAssembly-only inference.
2. Load and run a small model in a Web Worker.
3. Cache model files and show download progress.
4. Choose between in-browser, built-in and server models.

## Core concepts

- **WebGPU**: a browser API for GPU compute; much faster than CPU for model inference.
- **Quantised models**: smaller weight formats (8-bit, 4-bit) that trade a little accuracy for size and speed.
- **Web Worker**: runs inference off the main thread so the UI stays responsive.
- **Cache Storage**: model files are cached after the first download.

## Technical explanation

```text
main thread ─► postMessage({ text }) ─► worker
worker       ─► first run: download model (progress events) ─► cache
worker       ─► run pipeline on WebGPU (fallback: WASM)
worker       ─► postMessage({ embedding }) ─► main thread ─► cosine search in memory
```

## Code example

An embedding worker using Transformers.js (API shape from its documentation; check the current version):

```ts
// embed.worker.ts
import { pipeline } from "@huggingface/transformers"

let extractor: Awaited<ReturnType<typeof pipeline>> | null = null

self.onmessage = async (event: MessageEvent<{ id: number; text: string }>) => {
  extractor ??= await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
    device: "webgpu",
    progress_callback: (p: unknown) => self.postMessage({ type: "progress", p }),
  })
  const output = await extractor(event.data.text, { pooling: "mean", normalize: true })
  self.postMessage({ type: "result", id: event.data.id, embedding: Array.from(output.data as Float32Array) })
}
```

With normalised vectors, similarity is a simple dot product, so search over a few thousand items runs in memory.

## Production considerations

- Download models on demand, behind a user action, with clear size and progress.
- Feature-detect WebGPU and fall back to WASM or to a server route.
- Watch memory on low-end devices; one model at a time.
- Check model licences before shipping them to users.

## Trade-offs and alternatives

In-browser models: private, no per-call cost, offline, but a large first download and limited model size. Chrome's built-in AI: no download for you to manage, but one fixed model and limited platforms. Server models: best quality, but latency and cost per call. Embeddings and classification are the best first candidates for the browser.

## Common mistakes

- Running inference on the main thread and freezing the page.
- Downloading a large model on page load for a feature most users never open.
- Assuming WebGPU is available on every device.

## Key takeaways

- WebGPU makes small models practical in the browser.
- Run them in a worker, cache the files and show progress.
- Start with embeddings or classification; keep a server fallback.
