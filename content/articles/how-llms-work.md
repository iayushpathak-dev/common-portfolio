## Introduction

Most frontend engineers meet large language models (LLMs) through an API call: send text, get text back. That works until a response gets cut off, a long chat suddenly "forgets" its beginning, or the bill is ten times higher than expected. All three problems come from the same three ideas: **tokens**, **context windows** and **inference**.

These are my learning notes on those ideas, written from the point of view of someone building UIs on top of LLMs rather than training them.

## Problem statement

If you treat an LLM as a black box that takes a string, you can't reason about:

- why the same prompt costs different amounts in different languages,
- why a chat breaks after many messages,
- why streaming starts quickly but the full answer takes seconds,
- why the model sometimes gives a different answer to the same question.

## Learning objectives

After reading this you should be able to:

1. Explain what a token is and estimate token counts.
2. Explain what a context window is and what happens when you exceed it.
3. Describe how a model generates text one token at a time.
4. Explain temperature and why outputs are non-deterministic.
5. Connect these ideas to cost, latency and UX decisions.

## Core concepts

**Token.** Models don't read characters or words; they read tokens, which are chunks of text from a fixed vocabulary. Common English words are often one token; rare words, code and many non-English scripts are split into several. A rough rule for English is about **4 characters per token**, but always measure with the provider's token counter.

**Context window.** The maximum number of tokens the model can consider at once, counting *both* the input (instructions, history, retrieved documents) and the output it generates.

**Inference.** Running a trained model to produce output. For LLMs this is **autoregressive**: the model predicts the next token, appends it, and repeats.

**Sampling.** At each step the model outputs a probability for every token in its vocabulary. Settings like **temperature** and **top-p** control how a token is picked from that distribution.

## Technical explanation

### From text to tokens

A tokenizer converts text into integer IDs. The model never sees your string, only those IDs. That's why:

- Pricing and limits are in tokens, not characters.
- Hindi, Hinglish or code can use noticeably more tokens than the same idea in plain English.
- Whitespace and formatting cost tokens too, so a pretty-printed JSON blob is more expensive than a compact one.

### The generation loop

```text
prompt tokens ──► model ──► probabilities for next token ──► pick one ──► append
      ▲                                                                     │
      └─────────────────────────── repeat until stop ◄──────────────────────┘
```

Two phases matter for latency:

1. **Prefill**: the model processes all input tokens. Long prompts make this slower, which shows up as *time to first token*.
2. **Decode**: the model generates output tokens one by one. Each token needs a forward pass, so long answers take longer. Streaming shows tokens as they're decoded.

### Temperature and determinism

Temperature rescales the probabilities before sampling. Low temperature makes the most likely token win almost every time (more predictable); higher temperature spreads probability out (more varied). Even at temperature 0, providers don't always guarantee identical outputs, so don't build features that depend on exact repeatability.

### What the context window really limits

Everything you send counts: the system instructions, every previous chat message, retrieved documents and tool results, plus the tokens the model will generate. When a conversation grows past the limit, something must be dropped or summarised, either by you or by the provider (often with an error).

## Code example

Estimating whether a request will fit before sending it, and capping the output:

```ts
import { streamText } from "ai"
import { google } from "@ai-sdk/google"

const CONTEXT_BUDGET = 8_000 // tokens we allow ourselves to send, well below the model limit
const roughTokens = (text: string) => Math.ceil(text.length / 4) // English-only estimate

function trimHistory(messages: { role: string; content: string }[]) {
  const kept = []
  let used = 0
  // Keep the most recent messages that fit in the budget.
  for (const m of [...messages].reverse()) {
    used += roughTokens(m.content)
    if (used > CONTEXT_BUDGET) break
    kept.unshift(m)
  }
  return kept
}

const result = streamText({
  model: google("gemini-2.5-flash"),
  instructions: "Answer briefly.",
  messages: trimHistory(history),
  maxOutputTokens: 800, // output also consumes the context window and costs money
})
```

The 4-characters rule is only an estimate; use the provider's token-counting endpoint when accuracy matters.

## Production considerations

- **Cost** is roughly input tokens × input price + output tokens × output price. Output tokens are usually more expensive.
- **Latency** grows with prompt length (prefill) and answer length (decode). Stream responses so users see progress.
- **Limits**: set `maxOutputTokens` so a runaway answer can't consume your budget.
- **History**: trim or summarise old messages instead of sending the whole conversation forever.
- **Logging**: record token usage per request; it's the main driver of cost.

## Trade-offs and alternatives

- **Bigger context window vs retrieval.** Sending everything is simple but slow and expensive; retrieving only relevant passages (RAG) keeps prompts small.
- **Smaller vs larger models.** Small models are cheaper and faster, large ones reason better. Many products route easy requests to small models.
- **Summarising history vs truncating.** Summaries keep meaning but cost an extra model call; truncation is free but forgets.

## Common mistakes

- Estimating cost from characters or words instead of tokens.
- Forgetting that the system prompt and retrieved documents are sent on *every* request.
- Not setting an output limit.
- Assuming temperature 0 means perfectly deterministic output.
- Assuming a long context window means the model uses all of it equally well; information in the middle of very long prompts can be used less reliably.

## Key takeaways

- Models work in tokens; measure cost, limits and latency in tokens.
- The context window covers input and output together.
- Generation is a loop of next-token predictions; streaming exposes that loop to users.
- Control cost with output limits, history trimming and retrieval.
