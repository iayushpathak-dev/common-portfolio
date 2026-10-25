## Introduction

"Agent" is one of the most overloaded words in AI engineering. These notes use a practical distinction: a **workflow** is a system where *your code* decides the sequence of steps and the model fills in parts; an **agent** is a system where *the model* decides which steps to take next, usually by calling tools in a loop. Knowing which one you need saves a lot of complexity.

## Problem statement

It's tempting to make everything an autonomous agent. But agents are harder to test, slower, more expensive and less predictable. Many real tasks are better solved by a fixed sequence of model calls. We need a way to decide.

## Learning objectives

1. Define workflows and agents precisely.
2. Recognise common workflow patterns.
3. Identify when an agent is genuinely needed.
4. Add guardrails to agent loops.

## Core concepts

Common **workflow** patterns:

- **Prompt chaining**: step 1's output feeds step 2 (outline → draft → edit).
- **Routing**: classify the input, then send it to a specialised path (like this site's assistant).
- **Parallelisation**: run independent model calls at once and combine the results.
- **Orchestrator–workers**: one call splits the task, others do the parts.
- **Evaluator–optimiser**: one call produces, another critiques, repeat a bounded number of times.

An **agent** loop:

```text
goal ─► model decides next action ─► tool runs ─► observation ─► model decides again … ─► done / step limit
```

## Technical explanation

| Question | Workflow | Agent |
|---|---|---|
| Are the steps known in advance? | Yes | No |
| Who chooses the next step? | Your code | The model |
| Predictability | High | Lower |
| Cost and latency | Bounded | Variable |
| Testing | Like normal code | Needs scenario evaluation |
| Good for | Repeatable business processes | Open-ended tasks (research, coding) |

Rule of thumb: start with the simplest thing that works (often a single well-prompted call with retrieval), move to a workflow when you need several steps, and use an agent only when the path genuinely can't be known ahead of time.

## Code example

A workflow (routing + RAG), where code controls everything:

```ts
const route = classify(question)
if (route === "out_of_scope") return scopeMessage
const context = route === "personal" ? await retrieve(question) : []
return streamText({ model, instructions: buildPrompt(context), prompt: question })
```

An agent loop with guardrails, where the model chooses tools:

```ts
const result = await generateText({
  model,
  tools: { searchDocs, readDoc }, // read-only tools only
  stopWhen: isStepCount(5), // hard step limit
  abortSignal: AbortSignal.timeout(20_000),
  prompt: `Research: ${task}. Cite every source you used.`,
})
```

## Production considerations

- **Step limits and timeouts** on every agent loop.
- **Least-privilege tools**; require human approval for anything with side effects.
- **Log every step** (tool, duration, tokens) to debug loops.
- **Budget**: agents can use many times the tokens of a single call.
- **Evaluation**: judge agents on task success across scenarios, not single outputs.

## Trade-offs and alternatives

- **Flexibility vs control.** Agents adapt to unexpected situations; workflows are predictable and cheaper.
- **Hybrid designs.** A workflow can contain a small, bounded agent step (for example, "research this one question with at most three searches").
- **Frameworks vs plain code.** Agent frameworks speed up prototypes but can hide prompts and control flow; plain code with an SDK keeps the behaviour visible.

## Common mistakes

- Building an agent for a task with a fixed sequence of steps.
- Unbounded loops with no step or cost limit.
- Giving agents write access "just in case".
- Evaluating an agent on one demo instead of many scenarios.

## Key takeaways

- Prefer the simplest design: single call → workflow → agent.
- Workflows are code-controlled; agents are model-controlled.
- Bound every agent loop and minimise its permissions.
