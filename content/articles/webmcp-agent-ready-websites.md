## Introduction

Browser agents today mostly "use" websites by reading the DOM or screenshots and clicking like a person. That is slow and breaks whenever a class name changes. WebMCP is a proposed web standard, incubated in the W3C Web Machine Learning group and shipped by Chrome as an origin trial in 2026, that lets a page register typed tools on `navigator.modelContext` so an agent in the browser can call them directly. These are learning notes on what it means for frontend engineers.

## Problem statement

A booking flow that takes a human five clicks can take an agent dozens of screenshot-and-guess steps, and it fails on modals, custom selects and A/B tests. The site owner knows exactly what "book a class for Tuesday 7am" should do, but has no way to tell the agent.

## Learning objectives

1. Explain the imperative and declarative WebMCP APIs.
2. Register a tool from a React app and clean it up.
3. Decide which actions to expose and which to keep human-only.
4. Understand the current browser support and its limits.

## Core concepts

- **Tool contract**: a name, a description, a JSON Schema for input and an `execute` function.
- **Imperative API**: `navigator.modelContext.registerTool()` from JavaScript.
- **Declarative API**: annotating existing HTML forms so they can be exposed as tools.
- **Same session**: tools run in the page with the user's existing login, so permissions stay those of the user.

## Technical explanation

```text
page    ─► navigator.modelContext.registerTool({ name: "searchClasses", … })
agent   ─► (built into the browser) lists tools on the active tab
agent   ─► calls searchClasses({ city: "Noida", day: "tuesday" })
page    ─► runs its own code, returns structured results
agent   ─► presents options to the user, who confirms the booking in the page
```

The page stays in control: it decides what is exposed, validates inputs and can require the user to confirm in the UI.

## Code example

Registering a read-only tool from a client component, with feature detection and cleanup:

```tsx
"use client"
import { useEffect } from "react"

export function ClassSearchTool() {
  useEffect(() => {
    const mc = (navigator as Navigator & { modelContext?: ModelContext }).modelContext
    if (!mc) return // unsupported browser: nothing to do
    const registration = mc.registerTool({
      name: "searchClasses",
      description: "Find fitness classes by city and day",
      inputSchema: {
        type: "object",
        properties: { city: { type: "string" }, day: { type: "string" } },
        required: ["city"],
      },
      async execute({ city, day }) {
        const res = await fetch(`/api/classes?city=${encodeURIComponent(city)}&day=${day ?? ""}`)
        return { content: [{ type: "text", text: JSON.stringify(await res.json()) }] }
      },
    })
    return () => registration?.unregister?.()
  }, [])
  return null
}
```

The exact API surface is still changing during the origin trial, so check the current explainer before shipping.

## Production considerations

- Start with read-only tools (search, filter, compare). Keep payments and deletions behind a human confirmation.
- Validate every input on the server, exactly as you would for a form post.
- Feature-detect and degrade silently; most browsers do not support it yet.

## Trade-offs and alternatives

A remote MCP server serves agents that are not in a browser. WebMCP serves the agent sitting in the user's browser, using their session. Good semantic HTML and accessible forms already help screenshot-based agents, and they remain the baseline.

## Common mistakes

- Exposing a "do anything" tool instead of narrow, well-described actions.
- Trusting the agent's input because "it came from our page".
- Registering tools on every render without cleanup.

## Key takeaways

- WebMCP lets a page publish typed tools for in-browser agents via `navigator.modelContext`.
- It replaces fragile DOM scraping with explicit contracts the site owner controls.
- Expose narrow, read-first tools and keep risky actions behind user confirmation.
