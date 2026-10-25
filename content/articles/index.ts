import type { Article } from "@/content/types"

import agentsVsWorkflows from "./agents-vs-workflows.md"
import aiApplicationSecurity from "./ai-application-security.md"
import aiObservability from "./ai-observability.md"
import buildingAiChatInterfaces from "./building-ai-chat-interfaces.md"
import buildingRagFromScratch from "./building-rag-from-scratch.md"
import embeddingsAndVectorDatabases from "./embeddings-and-vector-databases.md"
import engineeringWithClaudeCode from "./engineering-with-claude-code.md"
import generativeUi from "./generative-ui.md"
import howLlmsWork from "./how-llms-work.md"
import hybridAiAssistant from "./hybrid-ai-assistant.md"
import keepingKnowledgeBaseInSync from "./keeping-knowledge-base-in-sync.md"
import productionReadyAiProduct from "./production-ready-ai-product.md"
import testingAndEvaluatingRag from "./testing-and-evaluating-rag.md"
import toolCallingAndStructuredOutputs from "./tool-calling-and-structured-outputs.md"
import vercelAiSdkArchitecture from "./vercel-ai-sdk-architecture.md"

// Every article starts as a draft: it shows in `next dev` only. After reviewing an article,
// set its publicationStatus to "published" and update updatedAt.

const AI_SDK_DOCS = { title: "AI SDK documentation", url: "https://ai-sdk.dev/docs" }
const PROJECT_ASSISTANT = "project-ai-portfolio-assistant"

type ArticleInput = Omit<Article, "contentType" | "id" | "body"> & { body?: string }

const article = (input: ArticleInput): Article => ({
  ...input,
  id: `article-${input.slug}`,
  contentType: "article",
  body: input.body ?? "",
})

export const ARTICLES: Article[] = [
  article({
    slug: "how-llms-work",
    title: "How LLMs Work: Tokens, Context Windows, and Inference",
    summary:
      "What tokens, context windows and next-token inference mean for engineers building UIs on top of language models, and how they drive cost and latency.",
    category: "AI Engineering",
    tags: ["LLM", "Tokens", "Context Window", "Inference"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-10-18",
    icon: "brain",
    body: howLlmsWork,
    sourceUrls: [
      { title: "Gemini API: understand and count tokens", url: "https://ai.google.dev/gemini-api/docs/tokens" },
      { title: "Attention Is All You Need (Vaswani et al., 2017)", url: "https://arxiv.org/abs/1706.03762" },
      { title: "Lost in the Middle: How Language Models Use Long Contexts", url: "https://arxiv.org/abs/2307.03172" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-building-rag-from-scratch", "article-ai-observability"],
  }),
  article({
    slug: "building-ai-chat-interfaces",
    title: "Building AI Chat Interfaces with React and Next.js",
    summary:
      "Designing a streaming chat UI: message parts, request states, stop and retry, safe Markdown, accessibility and where chat history should live.",
    category: "AI Engineering",
    tags: ["React", "Next.js", "Streaming", "AI SDK", "Accessibility"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-10-18",
    icon: "message-circle",
    featured: true,
    body: buildingAiChatInterfaces,
    sourceUrls: [
      { title: "AI SDK UI: Chatbot", url: "https://ai-sdk.dev/docs/ai-sdk-ui/chatbot" },
      { title: "Next.js Route Handlers", url: "https://nextjs.org/docs/app/api-reference/file-conventions/route" },
      { title: "MDN: Server-sent events", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-vercel-ai-sdk-architecture", "article-generative-ui"],
  }),
  article({
    slug: "vercel-ai-sdk-architecture",
    title: "Vercel AI SDK Architecture: From Prompt to Streaming Response",
    summary:
      "Following one request through the AI SDK's provider, core and UI layers, and where to add validation, sources, metadata and error handling.",
    category: "AI Engineering",
    tags: ["AI SDK", "Streaming", "TypeScript", "Next.js"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-10-18",
    icon: "layers",
    body: vercelAiSdkArchitecture,
    sourceUrls: [AI_SDK_DOCS, { title: "AI SDK Core: Generating text", url: "https://ai-sdk.dev/docs/ai-sdk-core/generating-text" }],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-building-ai-chat-interfaces", "article-tool-calling-and-structured-outputs"],
  }),
  article({
    slug: "embeddings-and-vector-databases",
    title: "Embeddings and Vector Databases Explained for Frontend Engineers",
    summary:
      "How embeddings turn meaning into vectors, how cosine similarity compares them, and what a vector database adds over an array.",
    category: "AI Engineering",
    tags: ["Embeddings", "Vector Database", "Cosine Similarity", "Upstash Vector"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-10-18",
    icon: "database",
    body: embeddingsAndVectorDatabases,
    sourceUrls: [
      { title: "Gemini API: Embeddings", url: "https://ai.google.dev/gemini-api/docs/embeddings" },
      { title: "Upstash Vector documentation", url: "https://upstash.com/docs/vector/overall/getstarted" },
      { title: "AI SDK Core: Embeddings", url: "https://ai-sdk.dev/docs/ai-sdk-core/embeddings" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-building-rag-from-scratch", "article-keeping-knowledge-base-in-sync"],
  }),
  article({
    slug: "building-rag-from-scratch",
    title: "Building RAG from Scratch: Documents to Grounded Answers",
    summary:
      "The full retrieval-augmented generation pipeline: chunking, embedding, retrieval with thresholds, grounded prompts, citations and abstention.",
    category: "AI Engineering",
    tags: ["RAG", "Retrieval", "Grounding", "Citations"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-10-18",
    icon: "search",
    featured: true,
    body: buildingRagFromScratch,
    sourceUrls: [
      { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)", url: "https://arxiv.org/abs/2005.11401" },
      { title: "AI SDK: RAG chatbot guide", url: "https://ai-sdk.dev/cookbook/guides/rag-chatbot" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: [
      "article-embeddings-and-vector-databases",
      "article-keeping-knowledge-base-in-sync",
      "article-testing-and-evaluating-rag",
    ],
  }),
  article({
    slug: "keeping-knowledge-base-in-sync",
    title: "Keeping an AI Knowledge Base in Sync with Published Blogs",
    summary:
      "Idempotent indexing with deterministic chunk IDs and content hashes, handling deletions, choosing triggers and protecting the ingestion endpoint.",
    category: "AI Engineering",
    tags: ["RAG", "Ingestion", "Idempotency", "Webhooks"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-10-18",
    icon: "refresh",
    body: keepingKnowledgeBaseInSync,
    sourceUrls: [
      { title: "Upstash Vector: upsert, delete and range", url: "https://upstash.com/docs/vector/sdks/ts/getting-started" },
      { title: "GitHub Actions: deployment_status event", url: "https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#deployment_status" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-building-rag-from-scratch", "article-ai-application-security"],
  }),
  article({
    slug: "hybrid-ai-assistant",
    title: "Building a Hybrid AI Assistant: RAG vs Web Search vs Abstention",
    summary:
      "Routing questions in code to personal retrieval, web search or a clear 'I don't know', and why personal facts must never come from the web.",
    category: "AI Engineering",
    tags: ["RAG", "Web Search", "Routing", "Abstention"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-10-18",
    icon: "git-branch",
    body: hybridAiAssistant,
    sourceUrls: [
      { title: "Gemini API: Grounding with Google Search", url: "https://ai.google.dev/gemini-api/docs/google-search" },
      { title: "Anthropic: Building effective agents (routing pattern)", url: "https://www.anthropic.com/engineering/building-effective-agents" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-building-rag-from-scratch", "article-agents-vs-workflows"],
  }),
  article({
    slug: "tool-calling-and-structured-outputs",
    title: "Tool Calling and Structured Outputs with TypeScript",
    summary:
      "Typed tools and schema-validated outputs with Zod and the AI SDK, the multi-step tool loop, and the safety rules that keep tools from becoming a liability.",
    category: "AI Engineering",
    tags: ["Tool Calling", "Structured Output", "Zod", "TypeScript"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-10-18",
    icon: "wrench",
    body: toolCallingAndStructuredOutputs,
    sourceUrls: [
      { title: "AI SDK Core: Tools and tool calling", url: "https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling" },
      { title: "AI SDK Core: Generating structured data", url: "https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data" },
      { title: "Zod documentation", url: "https://zod.dev" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-generative-ui", "article-agents-vs-workflows"],
  }),
  article({
    slug: "generative-ui",
    title: "Generative UI: Building Interactive AI-Powered Interfaces",
    summary:
      "Letting a model choose trusted React components and validated props instead of emitting markup, with loading, error and accessibility handled properly.",
    category: "AI Engineering",
    tags: ["Generative UI", "React", "Tool Calling", "Design Systems"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-10-18",
    icon: "boxes",
    body: generativeUi,
    sourceUrls: [
      { title: "AI SDK UI: Generative user interfaces", url: "https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces" },
      { title: "WAI-ARIA: live regions", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-tool-calling-and-structured-outputs", "article-building-ai-chat-interfaces"],
  }),
  article({
    slug: "testing-and-evaluating-rag",
    title: "Testing and Evaluating RAG Applications",
    summary:
      "Unit-testing the deterministic parts of a RAG system and evaluating retrieval, grounding, abstention and failure handling with a versioned dataset.",
    category: "AI Engineering",
    tags: ["Testing", "Evaluation", "RAG", "Vitest"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-10-18",
    icon: "flask",
    body: testingAndEvaluatingRag,
    sourceUrls: [
      { title: "Vitest documentation", url: "https://vitest.dev" },
      { title: "Ragas: evaluation metrics for RAG", url: "https://docs.ragas.io" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-building-rag-from-scratch", "article-ai-observability"],
  }),
  article({
    slug: "ai-observability",
    title: "AI Observability: Tokens, Latency, Failures, and Cost",
    summary:
      "What to measure for every LLM request (route, phase timings, tokens, errors) and how to do it without logging users' conversations.",
    category: "AI Engineering",
    tags: ["Observability", "Logging", "Cost", "Latency"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-10-18",
    icon: "activity",
    body: aiObservability,
    sourceUrls: [
      { title: "OpenTelemetry: semantic conventions for generative AI", url: "https://opentelemetry.io/docs/specs/semconv/gen-ai/" },
      { title: "Vercel: runtime logs", url: "https://vercel.com/docs/logs/runtime" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-production-ready-ai-product", "article-testing-and-evaluating-rag"],
  }),
  article({
    slug: "ai-application-security",
    title: "AI Application Security: Prompt Injection, Privacy, and Guardrails",
    summary:
      "Direct and indirect prompt injection, data leakage and abuse, and a defence-in-depth design where architecture, not the prompt, does the heavy lifting.",
    category: "AI Engineering",
    tags: ["Security", "Prompt Injection", "Privacy", "Rate Limiting"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-10-18",
    icon: "shield",
    body: aiApplicationSecurity,
    sourceUrls: [
      { title: "OWASP Top 10 for LLM Applications", url: "https://genai.owasp.org/llm-top-10/" },
      { title: "Simon Willison: prompt injection series", url: "https://simonwillison.net/series/prompt-injection/" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-hybrid-ai-assistant", "article-tool-calling-and-structured-outputs"],
  }),
  article({
    slug: "agents-vs-workflows",
    title: "AI Agents vs Workflows: When Should You Use Each?",
    summary:
      "A practical distinction between code-controlled workflows and model-controlled agents, common workflow patterns, and guardrails for agent loops.",
    category: "AI Engineering",
    tags: ["Agents", "Workflows", "Architecture"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-10-18",
    icon: "bot",
    body: agentsVsWorkflows,
    sourceUrls: [
      { title: "Anthropic: Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents" },
      { title: "AI SDK: Agents", url: "https://ai-sdk.dev/docs/agents/overview" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-hybrid-ai-assistant", "article-tool-calling-and-structured-outputs"],
  }),
  article({
    slug: "engineering-with-claude-code",
    title: "Engineering with Claude Code: From Prompting to Reliable Agent Workflows",
    summary:
      "Using a coding agent with durable project context, small reviewable tasks and automated checks as the feedback loop, illustrated with this portfolio.",
    category: "Engineering Workflow",
    tags: ["Claude Code", "AI-assisted Engineering", "CI", "Code Review"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-10-18",
    icon: "terminal",
    body: engineeringWithClaudeCode,
    sourceUrls: [{ title: "Claude Code documentation", url: "https://docs.claude.com/en/docs/claude-code/overview" }],
    relatedProjects: ["project-claude-code-workflow", PROJECT_ASSISTANT],
    relatedArticles: ["article-agents-vs-workflows"],
  }),
  article({
    slug: "production-ready-ai-product",
    title: "Designing a Production-Ready AI Product: Architecture, Caching, and Scaling",
    summary:
      "Request flow, safe caching, cost control, serverless scaling and failure handling for AI features that real users depend on.",
    category: "Architecture",
    tags: ["Architecture", "Caching", "Scaling", "Cost"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-10-18",
    icon: "cpu",
    body: productionReadyAiProduct,
    sourceUrls: [
      { title: "Vercel Functions: duration limits", url: "https://vercel.com/docs/functions/configuring-functions/duration" },
      { title: "Upstash Ratelimit", url: "https://upstash.com/docs/redis/sdks/ratelimit-ts/overview" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-ai-observability", "article-ai-application-security"],
  }),

  // Planned topics: listed on the blog as upcoming, with no article page yet.
  ...(
    [
      ["react-internals-and-rendering", "React Internals and Rendering", "React", "atom", "How React schedules, renders and commits updates, and what that means for performance."],
      ["nextjs-rendering-and-caching", "Next.js Rendering and Caching", "Next.js", "code", "SSR, SSG, ISR, CSR and the caching model in modern Next.js, with when to use each."],
      ["typescript-patterns", "TypeScript Patterns for Frontend Apps", "TypeScript", "type", "Practical typing patterns for components, API clients and configuration-driven UIs."],
      ["frontend-system-design", "Frontend System Design", "Architecture", "layers", "Approaching frontend system design: data flow, BFFs, state, rendering and trade-offs."],
      ["performance-optimization", "Performance Optimization in Production React Apps", "Performance", "gauge", "Measuring and improving Core Web Vitals in real applications."],
      ["state-management", "State Management: Redux, Zustand and React Query", "React", "boxes", "Choosing between client state, server state and URL state."],
      ["debugging-production-applications", "Debugging Production Applications", "Engineering Workflow", "bug", "A practical process for finding and fixing bugs that only happen in production."],
    ] as const
  ).map(([slug, title, category, icon, summary]) =>
    article({
      slug,
      title,
      summary,
      category,
      tags: [category],
      publicationStatus: "planned",
      learningStatus: "Planned",
      updatedAt: "2026-10-18",
      icon,
      sourceUrls: [],
      relatedProjects: [],
      relatedArticles: [],
    }),
  ),
]
