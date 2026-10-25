## Introduction

Plain text answers are fine for chat, but applications usually need data they can act on: a JSON object to render, a function to call, a form to fill. **Tool calling** lets a model ask your code to run a function; **structured outputs** make the model return data that matches a schema. These are my learning notes on using both safely with TypeScript and the Vercel AI SDK v7.

## Problem statement

Parsing free-form model text with regular expressions is fragile. Letting a model decide which functions to run is powerful but risky. We need typed, validated contracts between the model and our code.

## Learning objectives

1. Define tools with typed input schemas.
2. Understand the tool-calling loop and step limits.
3. Generate structured objects validated by a schema.
4. Apply safety rules: validation, authorisation, allow-lists.

## Core concepts

- **Tool**: a description, an input schema and an `execute` function. The model sees the description and schema; your server runs `execute`.
- **Tool call**: the model outputs "call `getWeather` with `{ city: 'Delhi' }`" instead of text.
- **Multi-step loop**: the SDK runs the tool, sends the result back, and lets the model continue, up to a step limit.
- **Structured output**: the model is constrained or instructed to return JSON matching a schema, which the SDK validates.

## Technical explanation

```text
user question ─► model ─► tool call { name, input }
                              │  validate input against schema
                              ▼
                        your execute() ─► result
                              │
                 model ◄──────┘ (next step) ─► final text answer
```

Zod schemas serve three purposes at once: they describe the input to the model, validate the model's output at runtime, and give TypeScript types.

## Code example

A tool with a validated input:

```ts
import { generateText, isStepCount, tool } from "ai"
import { z } from "zod"

const searchProjects = tool({
  description: "Search portfolio projects by technology",
  inputSchema: z.object({
    technology: z.string().min(1).max(50).describe("e.g. 'Next.js' or 'PWA'"),
  }),
  execute: async ({ technology }) => {
    // Read-only, allow-listed data access. Never run model-provided code or SQL.
    return projects.filter((p) => p.tags.includes(technology)).map(({ title, url }) => ({ title, url }))
  },
})

const { text } = await generateText({
  model,
  tools: { searchProjects },
  stopWhen: isStepCount(3), // bound the loop
  prompt: "Which projects used Next.js?",
})
```

Structured output for a UI component:

```ts
import { generateText, Output } from "ai"
import { z } from "zod"

const Summary = z.object({
  title: z.string(),
  skills: z.array(z.string()).max(8),
  seniority: z.enum(["junior", "mid", "senior"]),
})

const { output } = await generateText({
  model,
  output: Output.object({ schema: Summary }),
  prompt: `Summarise this job description: ${jobDescription}`,
})
// output is typed as z.infer<typeof Summary> and has been validated
```

## Production considerations

- **Least privilege**: give the model only the tools a route needs. Read-only tools by default.
- **Validate and authorise inside `execute`**: the schema checks shape, not permission. The user's session decides what data a tool may access.
- **Human confirmation** for anything with side effects (sending email, payments, deletions).
- **Bound the loop** with a step limit and timeouts; tools can fail or hang.
- **Treat tool results as untrusted** if they include external content; they go back into the model's context.
- **Handle validation failures**: models occasionally produce invalid output; catch the error and retry or degrade.

## Trade-offs and alternatives

- **Tools vs code-driven orchestration.** Letting the model choose tools is flexible; deciding in code which function to call is predictable and easier to test. Use tools when the choice genuinely depends on language understanding.
- **Structured output vs tool calls for data extraction.** Both produce JSON; structured output is simpler when you just need one object back.
- **Strict schemas vs loose ones.** Strict schemas (enums, max lengths) catch errors early but fail more often; loose schemas pass more but push validation downstream.

## Common mistakes

- Executing model-generated code, SQL or shell commands.
- Trusting the schema as an authorisation check.
- No step limit, causing long or costly loops.
- Huge tool results that blow the context window.
- Vague tool descriptions, so the model picks the wrong tool.

## Key takeaways

- Tools let models request actions; your code decides whether and how they run.
- Schemas give you validation and types in one place.
- Bound loops, minimise permissions and require approval for side effects.
- Never execute arbitrary model output.
