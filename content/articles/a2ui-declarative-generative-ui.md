## Introduction

My earlier note on generative UI covered the "model picks a component, app renders it" pattern. Google's A2UI (Agent-to-UI), open-sourced in December 2025, goes a step further: the agent sends a declarative JSON description of a UI tree, built from a catalogue of components the client already has, and the client renders it with its own React, Flutter, Angular or Lit components. These are learning notes on how it differs and when it makes sense.

## Problem statement

With one-tool-per-component generative UI, every new layout needs a new tool and a new component. That does not scale when an agent needs to compose many layouts, or when a third-party agent must render UI inside your product. Sending executable code (HTML or JSX) across that trust boundary is not acceptable.

## Learning objectives

1. Explain "declarative, not executable" UI.
2. Compare A2UI with tool-based generative UI and MCP Apps.
3. Describe how a client renders an A2UI tree with its own design system.
4. Identify the security boundary in the design.

## Core concepts

- **Component catalogue**: the set of primitives (card, row, text, button, input, date picker…) the client is willing to render.
- **UI tree as data**: the agent sends a JSON structure that references catalogue components and data bindings.
- **Client-owned styling**: the client decides how a "card" looks, so the result matches the brand.
- **Incremental updates**: the agent can stream changes to the tree as the conversation moves on.

## Technical explanation

```text
agent ─► { component: "Card", children: [
            { component: "Text", text: "Pick a time" },
            { component: "DatePicker", bind: "/booking/date" },
            { component: "Button", label: "Confirm", action: "confirmBooking" } ] }
client ─► looks up Card, Text, DatePicker, Button in its own registry
client ─► renders native components; user action ─► "confirmBooking" sent back to agent
```

No markup or CSS crosses the wire. Unknown components are simply not rendered.

## Code example

The core of a client renderer is a recursive lookup into an allow-listed registry:

```tsx
const registry = { Card, Text, Button, DatePicker } as const

function Render({ node, onAction }: { node: UiNode; onAction: (a: string) => void }) {
  const Component = registry[node.component as keyof typeof registry]
  if (!Component) return null // not in the catalogue: ignore, never eval
  return (
    <Component {...node.props} onAction={onAction}>
      {node.children?.map((child, i) => <Render key={i} node={child} onAction={onAction} />)}
    </Component>
  )
}
```

The official renderers add schema validation, data binding and streaming updates, but the safety model is exactly this: render only what is in the catalogue.

## Production considerations

- Validate the tree against a schema before rendering; reject unknown props.
- Keep catalogue components accessible by default, because the agent will not add ARIA for you.
- Log the trees you receive. They are the easiest way to debug a strange layout.

## Trade-offs and alternatives

Tool-based generative UI gives tight control and typed props but limited flexibility. A2UI lets the agent compose layouts freely within a safe vocabulary. MCP Apps ships real HTML from the server, giving full visual control but none of the host's design system. A2UI is the best fit when the same agent must render on web and mobile.

## Common mistakes

- Allowing a "raw HTML" component in the catalogue, which defeats the whole design.
- Letting the agent pick colours and spacing instead of semantic variants.
- Forgetting empty and loading states for components bound to data that has not arrived.

## Key takeaways

- A2UI sends a UI description, not code, and the client renders it natively.
- The component catalogue is the security boundary and the design system at once.
- It suits multi-platform agents and third-party agents rendering inside your product.
