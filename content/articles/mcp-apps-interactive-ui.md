## Introduction

In January 2026 MCP Apps became the first official extension to the Model Context Protocol. It lets an MCP tool return an interactive UI (a chart, a form, a small dashboard) that the host renders inside the conversation in Claude, ChatGPT, VS Code and other clients. For frontend engineers this is a new place to ship UI: not your own website, but inside someone else's AI assistant. These are my learning notes on how it works.

## Problem statement

Plain MCP tools return text or JSON. That is fine for "what is the weather", but poor for "compare these five plans" or "pick a time slot". Before MCP Apps, each host had its own way to show richer output (MCP-UI, the OpenAI Apps SDK). Teams had to build the same widget several times. MCP Apps standardises it.

## Learning objectives

1. Explain the two primitives MCP Apps adds: UI resources and tool-to-UI linkage.
2. Describe how the host renders and isolates the UI.
3. Understand how the UI talks back to the host and the model.
4. Know when an MCP App is better than returning structured data.

## Core concepts

- **UI resource**: an HTML bundle the server exposes under a `ui://` URI.
- **Tool linkage**: a tool declares, in its metadata, which UI resource renders its result.
- **Sandboxed iframe**: the host renders the UI in an isolated frame, not in its own DOM.
- **JSON-RPC messages**: the UI and host communicate through logged MCP messages, so there is no hidden back channel.

## Technical explanation

```text
model ─► calls tool "showPlans"
host  ─► sees _meta.ui.resourceUri = "ui://plans/compare"
host  ─► fetches the ui:// resource (HTML + JS) from the MCP server
host  ─► renders it in a sandboxed iframe, passes tool input and result in
UI    ─► user clicks "Choose Pro" ─► message to host ─► host can call another tool
```

The model still decides which tool to call. The UI only handles the part that text is bad at: direct manipulation, filtering, choosing.

## Code example

The shape of a tool that links to a UI resource (simplified from the spec):

```ts
server.registerTool(
  "showPlans",
  {
    description: "Show membership plans as an interactive comparison",
    inputSchema: { city: z.string() },
    _meta: { ui: { resourceUri: "ui://plans/compare" } },
  },
  async ({ city }) => ({
    content: [{ type: "text", text: `Plans available in ${city}` }],
    structuredContent: { plans: await getPlans(city) },
  }),
)
```

The UI bundle receives `structuredContent` and renders it. Because it runs in a sandbox, external scripts and fonts must be declared in the resource's content-security metadata.

## Production considerations

- Bundle the UI into a single file where possible; every external domain must be allow-listed.
- Always return a useful text result too, for hosts that do not support the extension.
- Treat every message from the UI as untrusted input on the server, like any form post.

## Trade-offs and alternatives

AG-UI keeps the UI in your own app and streams agent events to it. A2UI sends a declarative description that the client renders with its own components. MCP Apps ships the actual HTML from the server. MCP Apps gives the most control over visuals but the least integration with the host's design system.

## Common mistakes

- Returning only the UI and no text fallback.
- Loading third-party scripts without declaring them, then wondering why the iframe is blank.
- Putting business logic in the iframe instead of behind tools the host can audit.

## Key takeaways

- MCP Apps let tools return interactive, sandboxed UI inside AI assistants.
- The building blocks are `ui://` resources, tool metadata and JSON-RPC messages.
- It is a new distribution surface for frontend work, with web security rules still applying.
