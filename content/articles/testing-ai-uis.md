## Introduction

My earlier note on evaluating RAG covered answer quality. This one covers the other half: testing the UI around the model. Streaming, tool states, errors and approvals are deterministic code, and they can be tested like any React component, as long as the model is taken out of the loop. These are notes on the approach.

## Problem statement

Tests that call a real model are slow, cost money and give different results each run, so teams often skip testing AI features altogether. Then a refactor breaks the stop button, the error state or the source list, and nobody notices until a user does.

## Learning objectives

1. Separate UI behaviour tests from answer quality evals.
2. Replace the model with recorded or scripted streams.
3. Test streaming, error and tool-approval states.
4. Add a small end-to-end smoke test against a mock route.

## Core concepts

- **Two kinds of checks**: UI tests (deterministic, run on every commit) and evals (model quality, run before releases).
- **Mock provider**: a fake model that returns scripted chunks, tool calls or errors.
- **Fixture streams**: recorded real responses saved as files and replayed in tests.
- **State coverage**: every request state (submitted, streaming, ready, error, stopped) has at least one test.

## Technical explanation

```text
unit / component tests   mock provider ─► scripted stream ─► assert rendered states
route handler tests      fake model + fake retriever ─► assert route, status codes, logs
e2e smoke (Playwright)   page ─► mocked /api/chat ─► type, send, see answer, press stop
evals (separate job)     real model ─► fixed questions ─► scored results
```

## Code example

A component test with a scripted stream that fails halfway, checking that the partial answer stays and a retry appears:

```tsx
it("keeps partial text and offers retry when the stream errors", async () => {
  mockChatRoute([
    { type: "text-delta", delta: "FITPASS uses " },
    { type: "text-delta", delta: "Next.js for" },
    { type: "error", errorText: "provider error" },
  ])

  render(<Chat />)
  await userEvent.type(screen.getByRole("textbox"), "What stack does FITPASS use?")
  await userEvent.click(screen.getByRole("button", { name: /send/i }))

  expect(await screen.findByText(/FITPASS uses Next.js for/)).toBeInTheDocument()
  expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
})
```

`mockChatRoute` is a test helper that serves the chunks in the same format as the real endpoint.

## Production considerations

- Record fixtures from real responses occasionally so mocks do not drift from reality.
- Test with slow streams (delays between chunks) to catch race conditions with the stop button.
- Keep evals out of the main CI path if they are slow, but block releases on them.

## Trade-offs and alternatives

Snapshot-testing whole answers is brittle and tells you little. Asserting on roles, states and key phrases is more stable. Visual regression tools help for generative UI components rendered from fixed props.

## Common mistakes

- Only testing the happy path where the stream completes.
- Calling the real model in unit tests.
- Mixing quality evals and UI tests in one suite, so flaky model output blocks unrelated changes.

## Key takeaways

- UI around a model is deterministic code; test it with scripted streams.
- Cover every request state, especially errors and stop.
- Keep evals separate and run them before releases.
