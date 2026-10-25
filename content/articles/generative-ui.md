## Introduction

Generative UI means a model's response is rendered as interactive components instead of a wall of text: a weather card, a comparison table, a booking form. For frontend engineers this is the most natural meeting point between UI work and AI. These are learning notes on how it works and how to keep it safe and maintainable.

## Problem statement

Some answers are better as UI: comparing three frameworks, showing a timeline, or asking the user to confirm an action. But letting a model generate arbitrary markup is unsafe and inconsistent with a design system. We need a controlled way for the model to choose *which* trusted component to show and *with what data*.

## Learning objectives

1. Explain the "model picks, app renders" pattern.
2. Implement generative UI using tool calls and typed message parts.
3. Keep components accessible and consistent with a design system.
4. Handle loading, error and partial states.

## Core concepts

- **Component registry**: a fixed set of React components the model may use.
- **Tool as UI intent**: each tool corresponds to a component; its input schema is the component's props.
- **Typed tool parts**: the client receives tool calls and results as message parts and renders the matching component.
- **States**: a tool part can be streaming its input, waiting for output, complete, or errored, and each state needs UI.

## Technical explanation

```text
model ─► tool call "showProjectCard" { slug }  ─► server validates, loads data
                                                  └─► tool result { title, summary, url }
client: message.parts ─► part.type === "tool-showProjectCard" ─► <ProjectCard {...output} />
```

The model never writes JSX or HTML. It only chooses a tool and arguments; the application validates them and renders its own components.

## Code example

Server: define a tool whose output is component data.

```ts
const showProjectCard = tool({
  description: "Show a card for one portfolio project",
  inputSchema: z.object({ slug: z.enum(publishedProjectSlugs) }), // only real projects
  execute: async ({ slug }) => {
    const p = getProject(slug)
    return { title: p.title, summary: p.summary, url: `/projects/${p.slug}` }
  },
})
```

Client: render parts by type.

```tsx
{message.parts.map((part, i) => {
  if (part.type === "text") return <Markdown key={i}>{part.text}</Markdown>
  if (part.type === "tool-showProjectCard") {
    if (part.state === "output-available") return <ProjectCard key={i} {...part.output} />
    if (part.state === "output-error") return <p key={i} role="alert">Couldn't load the project.</p>
    return <CardSkeleton key={i} />
  }
  return null
})}
```

Exact part type names and states depend on the SDK version; check the installed version's documentation.

## Production considerations

- **Allow-list data**: use enums or lookups so the model can only reference real records.
- **Design system first**: generative components are ordinary components; they must follow the same tokens, spacing and accessibility rules.
- **Accessibility**: announce new content politely (`aria-live="polite"`), keep focus stable, label interactive elements.
- **Skeletons** for pending tool calls so the layout doesn't jump.
- **Persistence**: stored chats must re-render the same components later, so keep tool outputs serialisable and versioned.
- **Fallbacks**: always include a text summary so the answer still makes sense if a component fails.

## Trade-offs and alternatives

- **Generative UI vs Markdown.** Markdown tables and lists cover many cases with zero extra code; components add interactivity at the cost of more surface to maintain.
- **Tool-based vs streamed server components.** Streaming React Server Components from the model loop is powerful but couples UI tightly to the server; tool parts rendered on the client keep a clean data contract.
- **Model-chosen vs rule-chosen UI.** Sometimes simple rules ("if the answer cites three projects, show cards") are more predictable than letting the model decide.

## Common mistakes

- Letting the model produce raw HTML or styles.
- Forgetting loading and error states for tool parts.
- Components that work only in light mode or on desktop.
- Tool outputs that change shape between deploys and break stored chats.

## Key takeaways

- The model picks; the application renders.
- Tools double as component contracts.
- Handle every state, keep components accessible and keep a text fallback.
