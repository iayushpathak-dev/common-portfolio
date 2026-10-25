# Interview Questions from Content

Private interview-preparation notes moved out of the public project case studies and articles.
Not rendered on the site and not indexed by the AI assistant (`docs/` is never ingested).

## Projects

### Personal AI Assistant with RAG and Web Search

Source: `content/projects/ai-portfolio-assistant.ts`

**Walk me through what happens when a visitor asks the assistant a question.**
The request is validated and rate-limited, a rule-based router decides scope and intent, the question is embedded, the vector store returns the top matching chunks of published content above a similarity threshold, those chunks go into a prompt that marks them as untrusted data, the answer streams back, and the source links are attached to the message.

**How do you stop the assistant from making up facts about you?**
Personal questions are answered only from retrieved chunks; if nothing passes the relevance threshold, the server returns a fixed 'not available' answer without calling the model, and web search is never used for personal questions.

**How do you keep the index in sync with the content?**
Each chunk's ID is deterministic and its metadata stores a content hash. The indexer compares hashes, embeds only new or changed chunks, upserts them, and deletes IDs that no longer exist. It runs after every production deploy and can be triggered manually.

**Why is a similarity score not a confidence score?**
_(no answer written yet)_

**What would you change to support thousands of documents?**
_(no answer written yet)_

### Backend-for-Frontend Architecture

Source: `content/projects/backend-for-frontend.ts`

**What is a Backend-for-Frontend, and when is it worth adding?**
A server layer owned by the frontend team that exposes an API shaped for one UI. It's worth it when the UI must combine several services, hide protocols like gRPC from the browser, keep secrets server-side, or share rules across clients.

**Why can't the browser call gRPC services directly?**
Browsers don't expose the HTTP/2 trailers gRPC relies on. You need gRPC-Web with a proxy, or a server (like a BFF) that translates HTTP/JSON into gRPC calls.

**What logic belongs in a BFF and what should stay in backend services?**
_(no answer written yet)_

**How would you handle errors and timeouts from several upstream services in one BFF response?**
_(no answer written yet)_

### Claude Code Engineering Workflow

Source: `content/projects/claude-code-workflow.ts`

**How do you review AI-generated code before merging it?**
_(no answer written yet)_

**Which tasks would you not delegate to a coding agent, and why?**
_(no answer written yet)_

### Configuration-Driven Corporate Onboarding Journeys

Source: `content/projects/configurable-corporate-journeys.ts`

**How would you design a configuration schema for multi-tenant onboarding flows?**
_(no answer written yet)_

**How do you test every client's configuration without testing every client by hand?**
_(no answer written yet)_

### Corporate Dashboard and Integrations

Source: `content/projects/corporate-dashboard-integrations.ts`

**How do you design integrations so one client's failing system doesn't affect others?**
_(no answer written yet)_

**How do you handle authentication for corporate integrations (SSO, API keys)?**
_(no answer written yet)_

### Feedback Solution

Source: `content/projects/feedback-solution.ts`

**How would you design a reusable feedback widget that works across several apps?**
_(no answer written yet)_

### Fitpass Corporate PWA

Source: `content/projects/fitpass-corporate-pwa.ts`

**How does a service worker enable offline support?**
It intercepts network requests from the page. On install it can pre-cache the app shell, and on fetch it can answer from Cache Storage when the network fails, so the app still loads offline.

**How do you roll out a new version of a PWA safely?**
Version the caches, delete old caches in the activate event, and tell open tabs that an update is waiting (for example with a 'Reload to update' prompt) instead of swapping assets under a running page.

**Which caching strategy would you use for API data versus static assets, and why?**
_(no answer written yet)_

**What are the limits of PWAs on iOS compared with Android?**
_(no answer written yet)_

### Fitpass Website and Rendering Strategies

Source: `content/projects/fitpass-website-rendering.ts`

**How do you decide between SSR, SSG, ISR and CSR for a page?**
Ask how often the data changes, whether it's personalised, and how important SEO is. Static or ISR for public pages that change occasionally, SSR for per-request or personalised data, CSR for interactive areas behind login where SEO doesn't matter.

**What happens if a revalidation webhook fails?**
The page keeps serving the old version. Mitigate with retries at the sender, a fallback time-based revalidation window, and monitoring of webhook failures.

**Which Lighthouse and Core Web Vitals metrics matter most for SEO, and how do you improve LCP?**
_(no answer written yet)_

**How does ISR behave when many users request a page that is being regenerated?**
_(no answer written yet)_

### Fitshop

Source: `content/projects/fitshop.ts`

**What's the difference between a Server Component and a Client Component?**
Server Components render only on the server, can access data directly and ship no JavaScript for themselves. Client Components ('use client') hydrate in the browser and can use state, effects and event handlers.

**Why must Server Actions validate input and check authorisation?**
Each action is exposed as an HTTP endpoint that anyone can call with any payload, so it must treat input as untrusted like any API route.

**How did you decide where to place 'use client' boundaries?**
_(no answer written yet)_

**How do you revalidate cached data after a Server Action mutation?**
_(no answer written yet)_

### Liveness Verification and QR Attendance

Source: `content/projects/liveness-verification.ts`

**Why run face landmark detection in the browser instead of on a server?**
It keeps the camera feed on the device (better privacy), removes server inference cost and gives instant feedback, at the price of relying on the device's performance and a model download.

**How would you keep a camera-based flow usable on low-end phones?**
Lower the input resolution and frame rate, run inference on a throttled loop, show clear guidance (lighting, position), and offer a fallback path when the camera or model fails.

**What are common ways to spoof a liveness check, and how can you mitigate them?**
_(no answer written yet)_

**How do you handle camera permissions and errors gracefully?**
_(no answer written yet)_

### LOGITRACK

Source: `content/projects/logitrack.ts`

**When would you choose polling over WebSockets for live data?**
Polling is fine when updates every few seconds are acceptable and the API is already REST; push (WebSockets/SSE) is better when updates must be instant or polling would create too much load.

**How does TypeScript help when integrating with REST APIs?**
_(no answer written yet)_

**How would you keep a dashboard responsive with thousands of live rows?**
_(no answer written yet)_

### Marketing Landing Pages

Source: `content/projects/marketing-landing-pages.ts`

**How do you let marketing ship landing pages quickly without hurting performance?**
_(no answer written yet)_

**How do you keep analytics tags from slowing a landing page down?**
_(no answer written yet)_

### Native Mobile App WebView Integration

Source: `content/projects/native-app-webview-integration.ts`

**How do a native app and a WebView page exchange data securely?**
_(no answer written yet)_

**What are the performance and UX pitfalls of WebView-based screens?**
_(no answer written yet)_

### Nutrition Dashboard

Source: `content/projects/nutrition-dashboard.ts`

**How would you design a JSON-driven (configuration-driven) UI?**
Define a typed schema for screens and fields, map each field type to a component in a registry, validate configs before rendering, and keep an escape hatch for custom components that the schema can't express.

**How do you migrate chat history between systems safely?**
Migrate in batches with idempotent writes, keep a mapping from old to new IDs, verify counts and samples after each batch, and keep the old system readable until the migration is verified.

**How do you keep a configuration-driven UI accessible and testable?**
_(no answer written yet)_

**What would you monitor in a real-time chat and calling integration?**
_(no answer written yet)_

### QTickets

Source: `content/projects/qtickets.ts`

**How do you prevent two users booking the same seat?**
The server must own seat state: hold seats with an expiry when checkout starts, confirm atomically on payment, and refresh the seat map so the UI reflects holds made by others.

**Why shouldn't the frontend mark an order as paid after the gateway redirect?**
Redirects can be faked, lost or interrupted. The backend should confirm payment status with the gateway, and the frontend should display that confirmed status.

**How would you design the seat map UI for accessibility?**
_(no answer written yet)_

**What changes when a booking platform supports multiple regions?**
_(no answer written yet)_

## Articles

### agents-vs-workflows

Source: `content/articles/agents-vs-workflows.md`

**What's the difference between an agent and a workflow?**
In a workflow, code defines the steps and the model performs some of them. In an agent, the model decides the next step itself, typically by choosing tools in a loop.

**When would you choose an agent?**
When the steps can't be known in advance (open-ended research, multi-file code changes) and the value justifies extra cost, latency and risk.

**How do you make an agent safe?**
Least-privilege tools, approval for side effects, step limits, timeouts, budgets, full step logging and scenario-based evaluation.

### ai-application-security

Source: `content/articles/ai-application-security.md`

**What is indirect prompt injection?**
Malicious instructions placed in content the model reads (documents, web pages, tool results) rather than typed by the user.

**Why can't a system prompt prevent prompt injection?**
The model treats all text as potential instructions; there's no hard boundary between "rules" and "data". Security must come from what the model can access and do.

**How would you secure a RAG chatbot?**
Index only public content, validate and limit input, rate-limit, route in code, delimit retrieved text, give no unnecessary tools, cap output, render safely and keep secrets server-side.

**What is denial of wallet?**
Abuse that drives up usage-based costs; mitigated with rate limits, input/output caps and quotas.

### ai-observability

Source: `content/articles/ai-observability.md`

**What would you log for each LLM request?**
A request ID, route, phase timings, retrieved chunk count, token usage, model, and an error class, without raw user content.

**How do you estimate the cost of an AI feature?**
Multiply average input and output tokens by their prices and by request volume, plus embedding and vector database operations; validate the estimate against logged usage.

**Why is time to first token important?**
With streaming, it's when the user sees that something is happening; it's dominated by routing, retrieval and prompt processing.

### building-ai-chat-interfaces

Source: `content/articles/building-ai-chat-interfaces.md`

**Why model messages as parts instead of strings?**
An answer can contain text, citations, tool calls and files. Parts keep them typed and separate, so the UI can render each kind properly without parsing text.

**How does streaming work end to end?**
The route handler calls the model with streaming enabled and returns an SSE response; the client hook reads events and appends them to the current message, re-rendering as tokens arrive.

**What should happen when the user presses Stop?**
The client aborts the fetch, and the server should pass that abort signal to the model call so generation (and billing) stops too.

**Where should chat history live?**
It depends on requirements: client storage for privacy and simplicity, server storage for cross-device history, with authentication and retention policies.

### building-rag-from-scratch

Source: `content/articles/building-rag-from-scratch.md`

**Explain RAG in one sentence.**
Retrieve the most relevant passages for a question from your own data, and have the model answer using only those passages, with citations.

**How do you prevent the model from inventing an answer?**
Apply a relevance threshold, skip generation when nothing qualifies, instruct the model to answer only from context, and evaluate grounding with test questions.

**How do you choose chunk size?**
Start with structure (sections), then a size that keeps one idea per chunk (a few hundred words), add small overlap, and tune using retrieval tests.

**Why are deterministic chunk IDs important?**
They make re-indexing idempotent: the same content maps to the same ID, so upserts replace rather than duplicate.

### embeddings-and-vector-databases

Source: `content/articles/embeddings-and-vector-databases.md`

**What is an embedding?**
A vector representation of text produced by a model, where semantically similar texts are close together.

**Why cosine similarity?**
It compares direction rather than length, which suits embeddings where meaning is encoded in direction. For normalised vectors it equals the dot product.

**Why not just use an array?**
An array has no persistence, no index (every query scans everything), no efficient filtering and isn't shared across serverless instances.

**What happens if you change embedding models?**
Old and new vectors aren't comparable, so you must re-embed and re-index all content.

### engineering-with-claude-code

Source: `content/articles/engineering-with-claude-code.md`

**How do you use AI coding tools without lowering quality?**
Give them accurate project context, keep tasks small, make automated checks the acceptance criteria, and review every diff as if a colleague wrote it.

**What would you not delegate to a coding agent?**
Decisions that need business context or carry high risk (security models, data migrations, irreversible operations) without close review and testing.

**Why are project instruction files useful?**
They give the agent durable, repository-specific context (conventions, commands, pitfalls) every session, reducing repeated mistakes.

### generative-ui

Source: `content/articles/generative-ui.md`

**What is generative UI?**
A pattern where the model selects a predefined component and supplies validated data, and the application renders it, so answers can be interactive.

**How do you keep generative UI safe?**
The model never emits markup; it calls allow-listed tools with schema-validated, enum-restricted inputs, and the app renders trusted components.

**How would you render a tool call that's still running?**
Use the part's state to show a skeleton, then the component when the output is available, or an inline error.

### how-llms-work

Source: `content/articles/how-llms-work.md`

**What is a token, and why does it matter for a frontend engineer?**
A token is a chunk of text from the model's vocabulary. Limits, latency and pricing are all measured in tokens, so UI decisions like how much history to send or how long answers can be directly affect cost and speed.

**What counts towards the context window?**
Everything in the request (instructions, messages, retrieved documents, tool results) plus the generated output.

**Why does a long prompt increase time to first token?**
The model must process (prefill) all input tokens before it can generate the first output token.

**What does temperature control?**
How random the choice of the next token is. Lower values make output more focused and repeatable; higher values make it more varied.

**How would you keep a long chat within limits?**
Keep a token budget, drop or summarise older messages, and retrieve relevant context instead of resending everything.

### hybrid-ai-assistant

Source: `content/articles/hybrid-ai-assistant.md`

**Why route in application code instead of in the prompt?**
Prompts can be overridden or misread. Code decides which tools and data the model receives, so certain behaviour (like never searching for personal questions) is guaranteed.

**When should an assistant abstain?**
When the allowed sources don't contain enough evidence, especially for factual claims about people or decisions.

**How do you combine RAG and web search?**
Route by intent: personal questions use only RAG; current external questions use search, optionally with relevant RAG context; label which sources were used.

**How would you test a router?**
A table of representative questions with expected routes, including edge cases and injection attempts, run as unit tests.

### keeping-knowledge-base-in-sync

Source: `content/articles/keeping-knowledge-base-in-sync.md`

**How do you make ingestion idempotent?**
Deterministic chunk IDs plus content hashes: unchanged chunks are skipped, changed ones are overwritten in place, and IDs no longer in the desired set are deleted.

**How do you remove unpublished content from retrieval?**
Build the desired set from published content only, delete indexed IDs that aren't in it, and also filter queries by `status = 'published'` as defence in depth.

**How would you secure a reindex endpoint?**
Require a secret in an Authorization header, compare it in constant time, refuse if unconfigured, rate-limit it, and only accept POST.

**What triggers would you use?**
Whatever matches where content lives: post-deploy for repository content, CMS webhooks for CMS content, plus a scheduled or manual run as a safety net.

### production-ready-ai-product

Source: `content/articles/production-ready-ai-product.md`

**What would you cache in a RAG application?**
Query embeddings (keyed by model), static content, and possibly retrieval results keyed by index version. Cache full answers only when they're identical, non-personal and not time-sensitive.

**How do you control the cost of an LLM feature?**
Retrieval to keep prompts small, output limits, smaller models where possible, skipping the model when not needed, rate limits and budgets with alerts.

**Why is rate limiting different on serverless platforms?**
Instances don't share memory, so in-memory counters are per instance; a shared store is needed for a global limit.

**How do you handle a provider outage?**
Timeouts, clear user messages, fallbacks (other model, reduced functionality), no aggressive retries, and alerts.

### testing-and-evaluating-rag

Source: `content/articles/testing-and-evaluating-rag.md`

**How do you test a non-deterministic system?**
Isolate deterministic parts and unit-test them; evaluate model behaviour with datasets and metrics (retrieval hit rate, grounding, abstention), and test failures with fakes.

**What is recall@K?**
The fraction of relevant documents that appear in the top K retrieved results.

**How would you check that citations are correct?**
Assert that every cited URL belongs to a chunk that was actually supplied to the model, and that expected sources appear for known questions.

**What belongs in a RAG evaluation set?**
Answerable questions, multi-chunk questions, unanswerable personal questions, out-of-scope and injection attempts, current-events questions and failure scenarios.

### tool-calling-and-structured-outputs

Source: `content/articles/tool-calling-and-structured-outputs.md`

**What is tool calling?**
The model returns a structured request to call a named function with arguments; the application validates and executes it, then feeds the result back so the model can continue.

**How do you keep tool calling safe?**
Least-privilege tool sets, schema validation, authorisation checks inside each tool, read-only defaults, human approval for side effects, step limits and treating tool output as untrusted.

**Why use Zod with the AI SDK?**
One schema provides the JSON schema the model sees, runtime validation of its output, and TypeScript types.

**When would you use structured output instead of a tool?**
When you just need data in a known shape (extraction, classification, UI props), not an action.

### vercel-ai-sdk-architecture

Source: `content/articles/vercel-ai-sdk-architecture.md`

**What problem does a provider abstraction solve?**
It gives one API for generation, streaming, tools and errors across vendors, so switching or mixing models doesn't require rewriting application code.

**What's the difference between UI messages and model messages?**
UI messages are the client's representation, with typed parts and metadata for rendering. Model messages are the provider-facing format. The server converts one into the other.

**How would you add citations from your own retrieval to a streamed answer?**
Use `createUIMessageStream`, merge the model's UI stream, and write `source-url` chunks for the retrieved documents.

**Where should errors be handled?**
Server-side: log full details with a request ID, and return a generic message to the client via `onError`. Client-side: show a retry option.
