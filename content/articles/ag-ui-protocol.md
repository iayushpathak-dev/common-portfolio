## Introduction

MCP gives agents tools. A2A lets agents talk to other agents. AG-UI (the Agent-User Interaction protocol) covers the last gap: how an agent running on a server talks to the user-facing app in real time. It is an open, event-based protocol from the CopilotKit team with integrations for LangGraph, CrewAI, LlamaIndex and others. These notes cover why a frontend engineer would want it and what the event stream looks like.

## Problem statement

User-facing agents are long-running. They stream text, call tools, update shared state and sometimes need the user to approve something mid-run. Every framework exposes this differently, so each frontend ends up with custom parsing code for one agent backend. Switching the backend means rewriting the UI layer.

## Learning objectives

1. Explain where AG-UI sits relative to MCP and A2A.
2. Read the main AG-UI event types.
3. Understand shared state sync with JSON Patch.
4. Decide when a protocol like AG-UI is worth adopting.

## Core concepts

- **Event stream**: the agent emits typed events over SSE, WebSockets or another transport.
- **Lifecycle events**: run started, run finished, run error.
- **Message events**: text message start, content delta, end.
- **Tool call events**: start, arguments delta, end, so the UI can show "searching…" while arguments stream.
- **State events**: a full snapshot or a JSON Patch delta to keep client and agent state aligned.

## Technical explanation

```text
RUN_STARTED
TEXT_MESSAGE_START   { messageId }
TEXT_MESSAGE_CONTENT { messageId, delta: "Looking at your plans" }
TOOL_CALL_START      { toolCallId, toolCallName: "getPlans" }
TOOL_CALL_ARGS       { toolCallId, delta: "{\"city\":\"Noida\"}" }
TOOL_CALL_END        { toolCallId }
STATE_DELTA          [{ op: "replace", path: "/selectedPlan", value: "pro" }]
TEXT_MESSAGE_END     { messageId }
RUN_FINISHED
```

The frontend subscribes to this stream and reduces it into UI state, the same way a Redux reducer handles actions. It does not need to know how the agent reasons, only what to show.

## Code example

A small reducer that turns AG-UI-style events into renderable state:

```ts
type UiState = { text: string; activeTool?: string; shared: Record<string, unknown> }

function reduce(state: UiState, event: AgUiEvent): UiState {
  switch (event.type) {
    case "TEXT_MESSAGE_CONTENT":
      return { ...state, text: state.text + event.delta }
    case "TOOL_CALL_START":
      return { ...state, activeTool: event.toolCallName }
    case "TOOL_CALL_END":
      return { ...state, activeTool: undefined }
    case "STATE_DELTA":
      return { ...state, shared: applyPatch(state.shared, event.delta).newDocument }
    default:
      return state
  }
}
```

In practice you would use the official client package instead of writing this by hand, but the mental model is a reducer over events.

## Production considerations

- Show tool activity ("Checking availability…") from `TOOL_CALL_START`; it makes long runs feel responsive.
- Validate state patches before applying them; the agent is not a trusted source.
- Handle `RUN_ERROR` with a retry option rather than a silent stop.

## Trade-offs and alternatives

If your app uses one backend and the Vercel AI SDK on both ends, its UI message stream already gives you typed parts and tool states, and AG-UI may add little. AG-UI pays off when the agent runtime is in Python or another framework, or when several agent backends must feed one frontend.

## Common mistakes

- Rendering only the final text and hiding all intermediate events.
- Keeping a second copy of shared state on the client that drifts from the agent's.
- Assuming events always arrive in order without testing reconnects.

## Key takeaways

- AG-UI standardises the agent-to-frontend stream with about sixteen event types.
- The frontend becomes a reducer over events, independent of the agent framework.
- It complements MCP and A2A rather than replacing them.
