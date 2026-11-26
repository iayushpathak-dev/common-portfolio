## Introduction

Design systems now have two new kinds of user. Coding agents (Claude Code, Codex, Copilot) generate components with them, and runtime agents render them through generative UI. Both need the system to be explicit: clear component APIs, documented variants and rules written down instead of living in someone's head. These notes cover what makes a design system "agent-ready".

## Problem statement

When a coding agent does not know your components, it writes a new button with hard-coded colours. When a generative UI agent has too many loosely typed components, it composes layouts that break your brand. In both cases the problem is the same: the design system was written for humans who already knew the conventions.

## Learning objectives

1. Make component APIs predictable for code generation.
2. Write instructions that coding agents actually follow.
3. Expose a small, typed component catalogue for runtime agents.
4. Enforce the rules with tooling, not hope.

## Core concepts

- **Semantic tokens**: `--color-danger` instead of `#e11d48`; agents use names correctly more often than raw values.
- **Constrained props**: variants as unions (`"primary" | "secondary"`), not free strings.
- **Instruction files**: `AGENTS.md` or `CLAUDE.md` with component rules and examples.
- **Catalogue for generative UI**: a subset of components with Zod schemas as props.
- **Guardrails**: lint rules that ban raw colours and direct HTML where a component exists.

## Technical explanation

```text
tokens (CSS variables)  ─► components (typed variants) ─► docs + examples
       │                         │                            │
       ▼                         ▼                            ▼
   lint rules            generative UI catalogue        AGENTS.md / CLAUDE.md
 (no raw hex)          (schema per component)         (rules for coding agents)
```

## Code example

A catalogue entry that serves both runtime agents (schema) and coding agents (description):

```ts
export const catalogue = {
  StatCard: {
    description: "One metric with a label. Use for numbers like '20+ partners'. Not for prose.",
    props: z.object({
      label: z.string().max(30),
      value: z.string().max(12),
      tone: z.enum(["neutral", "positive", "warning"]).default("neutral"),
    }),
    component: StatCard,
  },
} as const
```

The description reads like a rule a reviewer would give a new teammate, because that is what it is.

## Production considerations

- Keep the generative UI catalogue small (ten to twenty components); more choice means worse choices.
- Put the "do and don't" examples in the instruction file; agents copy examples.
- Run the same lint and visual checks on agent-written code as on human-written code.

## Trade-offs and alternatives

Exposing the full component library to runtime agents gives flexibility but produces inconsistent layouts. A curated catalogue limits expression but keeps the brand intact. Documentation sites help humans; for agents, short structured rules close to the code work better.

## Common mistakes

- Variant props typed as `string`.
- Instruction files that describe philosophy but contain no concrete examples.
- No lint rule for raw colours, so generated code slowly drifts.

## Key takeaways

- Agents are now design system consumers, both at build time and at runtime.
- Semantic tokens, typed variants and short rules with examples make systems agent-ready.
- Enforce with linting and keep the generative UI catalogue small.
