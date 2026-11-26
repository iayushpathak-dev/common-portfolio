## Introduction

Once a model can call tools that change things (send an email, book a slot, update a record), the most important UI in the product is the moment where a human says yes or no. Agent frameworks added first-class support for this in late 2025, including tool approval states in the Vercel AI SDK. These notes cover how to design and build approval UI that people actually read.

## Problem statement

Letting an agent act without review is risky. Asking for confirmation on every step is so annoying that users click "approve" without reading. The frontend has to show the right amount of information, at the right moment, and resume the agent cleanly afterwards.

## Learning objectives

1. Classify tools by risk and decide which need approval.
2. Render an approval request from a tool part's state.
3. Resume the run after approval or denial.
4. Write approval copy that states the consequence.

## Core concepts

- **Risk tiers**: read-only (no approval), reversible writes (light approval), irreversible or external actions (explicit approval with details).
- **Approval-requested state**: the tool call is paused, its input is known, execution waits for a decision.
- **Approval response**: the client sends approve or deny, optionally with a reason the model can use.
- **Auto-continue**: once every pending approval has a response, the conversation continues.

## Technical explanation

```text
model ─► tool call "cancelBooking" { bookingId: "B-123" }
server ─► tool marked needsApproval ─► part.state = "approval-requested"
client ─► renders <ApprovalCard> with the exact input
user   ─► Approve ─► approval response sent ─► tool executes ─► model continues
user   ─► Deny    ─► denial (with reason) sent ─► model explains or suggests an alternative
```

## Code example

Rendering a pending approval from message parts (shape based on the AI SDK's approval flow):

```tsx
if (part.type === "tool-cancelBooking" && part.state === "approval-requested") {
  return (
    <div role="group" aria-labelledby={`approve-${part.toolCallId}`}>
      <p id={`approve-${part.toolCallId}`}>
        Cancel booking <strong>{part.input.bookingId}</strong>? This can't be undone and the slot
        will be released.
      </p>
      <button onClick={() => respond(part.approval.id, true)}>Cancel booking</button>
      <button onClick={() => respond(part.approval.id, false, "User wants to keep it")}>
        Keep booking
      </button>
    </div>
  )
}
```

Button labels name the action ("Cancel booking"), not "Yes" and "No".

## Production considerations

- Enforce approval on the server. A hidden button on the client is not a security control.
- Show the exact arguments the tool will run with, formatted for humans.
- Expire stale approvals; an approval from yesterday should not run today.
- Log who approved what, with the tool input, for audit.

## Trade-offs and alternatives

A deterministic workflow (form, then confirm screen) is often better than an agent for high-risk actions. Approval UI shines when the agent assembles the action from a conversation and the user just needs to check it. For bulk actions, one summary approval beats twenty individual ones.

## Common mistakes

- Asking for approval on read-only tools, which trains users to click through.
- Summarising the action vaguely ("Proceed with changes?").
- Losing the pending approval on page refresh.

## Key takeaways

- Approval is a state in the tool lifecycle; render it from that state.
- Gate by risk tier, enforce on the server, show exact inputs.
- Good approval copy states the consequence and labels buttons with the action.
