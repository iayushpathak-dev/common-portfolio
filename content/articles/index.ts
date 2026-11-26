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
import frontendAiEngineerRole from "./frontend-ai-engineer-role.md"
import mcpAppsInteractiveUi from "./mcp-apps-interactive-ui.md"
import agUiProtocol from "./ag-ui-protocol.md"
import a2uiDeclarativeGenerativeUi from "./a2ui-declarative-generative-ui.md"
import webmcpAgentReadyWebsites from "./webmcp-agent-ready-websites.md"
import chromeBuiltInAiPromptApi from "./chrome-built-in-ai-prompt-api.md"
import humanInTheLoopToolApproval from "./human-in-the-loop-tool-approval.md"
import streamingUxPatterns from "./streaming-ux-patterns.md"
import streamingStructuredObjects from "./streaming-structured-objects.md"
import aiTrustUxPatterns from "./ai-trust-ux-patterns.md"
import rateLimitsQuotasAndModelFallbacks from "./rate-limits-quotas-and-model-fallbacks.md"
import agentReadableWebsites from "./agent-readable-websites.md"
import testingAiUis from "./testing-ai-uis.md"
import designSystemsForAiAgents from "./design-systems-for-ai-agents.md"
import aiFeatureProductMetrics from "./ai-feature-product-metrics.md"
import inBrowserModelsWebgpu from "./in-browser-models-webgpu.md"

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

  article({
    slug: "frontend-ai-engineer-role",
    title: "What a Frontend AI Engineer Actually Does in 2026",
    summary:
      "The skill map behind the role: model integration, retrieval, agent UX, quality and safety on top of React, Next.js and TypeScript.",
    category: "Engineering Workflow",
    tags: ["AI Engineering", "Career", "React", "Next.js"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "sparkles",
    featured: true,
    body: frontendAiEngineerRole,
    sourceUrls: [
      { title: "AI SDK documentation", url: "https://ai-sdk.dev/docs" },
      { title: "Model Context Protocol documentation", url: "https://modelcontextprotocol.io" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-streaming-ux-patterns", "article-ai-trust-ux-patterns", "article-building-ai-chat-interfaces"],
  }),
  article({
    slug: "mcp-apps-interactive-ui",
    title: "MCP Apps: Shipping Interactive UI Inside AI Assistants",
    summary:
      "How the first official MCP extension lets tools return sandboxed, interactive UI that renders inside Claude, ChatGPT and other hosts.",
    category: "AI Engineering",
    tags: ["MCP", "MCP Apps", "Generative UI", "Security"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "app-window",
    body: mcpAppsInteractiveUi,
    sourceUrls: [
      { title: "MCP Apps announcement (January 2026)", url: "https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/" },
      { title: "MCP Apps SDK documentation", url: "https://apps.extensions.modelcontextprotocol.io/api/" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-generative-ui", "article-ag-ui-protocol", "article-a2ui-declarative-generative-ui"],
  }),
  article({
    slug: "ag-ui-protocol",
    title: "AG-UI: The Protocol Between AI Agents and Your Frontend",
    summary:
      "An event-based protocol for streaming agent messages, tool calls and shared state into user-facing apps, and why the UI becomes a reducer over events.",
    category: "AI Engineering",
    tags: ["AG-UI", "Agents", "Streaming", "State"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "activity",
    body: agUiProtocol,
    sourceUrls: [
      { title: "AG-UI documentation", url: "https://docs.ag-ui.com/introduction" },
      { title: "AG-UI on GitHub", url: "https://github.com/ag-ui-protocol/ag-ui" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-mcp-apps-interactive-ui", "article-human-in-the-loop-tool-approval", "article-agents-vs-workflows"],
  }),
  article({
    slug: "a2ui-declarative-generative-ui",
    title: "A2UI and Declarative Generative UI",
    summary:
      "Agents that describe UI as data from a component catalogue, rendered natively by the client: safer than code, more flexible than one tool per component.",
    category: "AI Engineering",
    tags: ["A2UI", "Generative UI", "Design System", "Security"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "boxes",
    body: a2uiDeclarativeGenerativeUi,
    sourceUrls: [
      { title: "Introducing A2UI (Google Developers Blog)", url: "https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/" },
      { title: "A2UI on GitHub", url: "https://github.com/google/A2UI" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-generative-ui", "article-design-systems-for-ai-agents", "article-mcp-apps-interactive-ui"],
  }),
  article({
    slug: "webmcp-agent-ready-websites",
    title: "WebMCP: Letting Browser Agents Call Your Website's Tools",
    summary:
      "Registering typed tools on navigator.modelContext so in-browser agents call explicit contracts instead of scraping the DOM.",
    category: "AI Engineering",
    tags: ["WebMCP", "Agents", "Browser APIs", "Security"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "plug",
    body: webmcpAgentReadyWebsites,
    sourceUrls: [
      { title: "WebMCP explainer", url: "https://github.com/webmachinelearning/webmcp" },
      { title: "WebMCP specification draft", url: "https://webmachinelearning.github.io/webmcp" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-agent-readable-websites", "article-human-in-the-loop-tool-approval"],
  }),
  article({
    slug: "chrome-built-in-ai-prompt-api",
    title: "On-Device AI with Chrome's Prompt API and Gemini Nano",
    summary:
      "Using Chrome's built-in model for narrow tasks without a server: availability checks, download progress, streaming and a cloud fallback.",
    category: "AI Engineering",
    tags: ["Built-in AI", "Gemini Nano", "On-device", "Privacy"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "cpu",
    body: chromeBuiltInAiPromptApi,
    sourceUrls: [
      { title: "Chrome: The Prompt API", url: "https://developer.chrome.com/docs/ai/prompt-api" },
      { title: "AI with Chrome", url: "https://developer.chrome.com/docs/ai" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-in-browser-models-webgpu", "article-how-llms-work"],
  }),
  article({
    slug: "human-in-the-loop-tool-approval",
    title: "Human-in-the-Loop: Designing Tool Approval UI for Agents",
    summary:
      "Risk tiers, approval states in the tool lifecycle, consequence-first copy and server-side enforcement for agents that take actions.",
    category: "AI Engineering",
    tags: ["Agents", "Tool Calling", "UX", "Security"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "shield",
    body: humanInTheLoopToolApproval,
    sourceUrls: [
      { title: "AI SDK 6: agents and tool execution approval", url: "https://vercel.com/blog/ai-sdk-6" },
      { title: "AI SDK documentation", url: "https://ai-sdk.dev/docs" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-tool-calling-and-structured-outputs", "article-agents-vs-workflows", "article-ag-ui-protocol"],
  }),
  article({
    slug: "streaming-ux-patterns",
    title: "Streaming UX: Designing for Latency in AI Interfaces",
    summary:
      "The first second of an AI answer: optimistic messages, status lines, stable layout, stop controls and accessible completion announcements.",
    category: "AI Engineering",
    tags: ["Streaming", "UX", "Accessibility", "Performance"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-11-26",
    icon: "gauge",
    featured: true,
    body: streamingUxPatterns,
    sourceUrls: [
      { title: "AI SDK UI: Chatbot", url: "https://ai-sdk.dev/docs/ai-sdk-ui/chatbot" },
      { title: "Chrome: Render LLM responses", url: "https://developer.chrome.com/docs/ai/render-llm-responses" },
      { title: "MDN: AbortController", url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-building-ai-chat-interfaces", "article-ai-trust-ux-patterns", "article-testing-ai-uis"],
  }),
  article({
    slug: "streaming-structured-objects",
    title: "Streaming Structured Objects into React Components",
    summary:
      "Rendering partial, schema-defined JSON as it streams: defensive rendering, element-by-element updates and validating only the final object.",
    category: "AI Engineering",
    tags: ["Structured Output", "Streaming", "Zod", "React"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "layers",
    body: streamingStructuredObjects,
    sourceUrls: [
      { title: "AI SDK Core: Generating structured data", url: "https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data" },
      { title: "Zod documentation", url: "https://zod.dev" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-tool-calling-and-structured-outputs", "article-streaming-ux-patterns"],
  }),
  article({
    slug: "ai-trust-ux-patterns",
    title: "Trust UX for AI Features: Sources, Scope and Feedback",
    summary:
      "Patterns that help users trust AI answers the right amount: provenance, scope statements, abstention, editability and feedback tied to requests.",
    category: "AI Engineering",
    tags: ["UX", "Citations", "Feedback", "RAG"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "message-square",
    body: aiTrustUxPatterns,
    sourceUrls: [
      { title: "Google People + AI Guidebook", url: "https://pair.withgoogle.com/guidebook/" },
      { title: "Microsoft Guidelines for Human-AI Interaction", url: "https://www.microsoft.com/en-us/research/project/guidelines-for-human-ai-interaction/" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-building-rag-from-scratch", "article-ai-feature-product-metrics", "article-streaming-ux-patterns"],
  }),
  article({
    slug: "rate-limits-quotas-and-model-fallbacks",
    title: "Rate Limits, Quotas, Timeouts and Model Fallbacks",
    summary:
      "Treating provider failures as normal states: own rate limits, timeouts, error classification, fallbacks and specific user-facing messages.",
    category: "AI Engineering",
    tags: ["Reliability", "Rate Limiting", "Gemini", "Error Handling"],
    publicationStatus: "draft",
    learningStatus: "Hands-on Implementation",
    updatedAt: "2026-11-26",
    icon: "refresh",
    body: rateLimitsQuotasAndModelFallbacks,
    sourceUrls: [
      { title: "Gemini API rate limits", url: "https://ai.google.dev/gemini-api/docs/rate-limits" },
      { title: "Upstash Ratelimit", url: "https://upstash.com/docs/redis/sdks/ratelimit-ts/overview" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-production-ready-ai-product", "article-ai-observability", "article-hybrid-ai-assistant"],
  }),
  article({
    slug: "agent-readable-websites",
    title: "Making Websites Readable for AI Agents",
    summary:
      "Server rendering, semantic HTML, JSON-LD, sitemaps and llms.txt: what helps AI systems read and use a site, and what to keep out.",
    category: "Architecture",
    tags: ["SEO", "Accessibility", "Structured Data", "Agents"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "search",
    body: agentReadableWebsites,
    sourceUrls: [
      { title: "schema.org: TechArticle", url: "https://schema.org/TechArticle" },
      { title: "The llms.txt proposal", url: "https://llmstxt.org" },
      { title: "Next.js: JSON-LD", url: "https://nextjs.org/docs/app/guides/json-ld" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-webmcp-agent-ready-websites", "article-ai-trust-ux-patterns"],
  }),
  article({
    slug: "testing-ai-uis",
    title: "Testing AI UIs Without Calling the Model",
    summary:
      "Scripted streams and mock providers for testing streaming, error, stop and approval states, kept separate from model-quality evals.",
    category: "AI Engineering",
    tags: ["Testing", "Vitest", "Playwright", "Streaming"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "flask",
    body: testingAiUis,
    sourceUrls: [
      { title: "AI SDK: Testing", url: "https://ai-sdk.dev/docs/ai-sdk-core/testing" },
      { title: "Testing Library", url: "https://testing-library.com/docs/react-testing-library/intro/" },
      { title: "Playwright: Mock APIs", url: "https://playwright.dev/docs/mock" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-testing-and-evaluating-rag", "article-streaming-ux-patterns"],
  }),
  article({
    slug: "design-systems-for-ai-agents",
    title: "Design Systems for AI Agents",
    summary:
      "Making a design system usable by coding agents and generative UI: semantic tokens, typed variants, instruction files, a small catalogue and lint rules.",
    category: "Architecture",
    tags: ["Design System", "Generative UI", "Claude Code", "TypeScript"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "layout-dashboard",
    body: designSystemsForAiAgents,
    sourceUrls: [
      { title: "AGENTS.md", url: "https://agents.md" },
      { title: "Claude Code: memory and CLAUDE.md", url: "https://docs.claude.com/en/docs/claude-code/memory" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-a2ui-declarative-generative-ui", "article-engineering-with-claude-code", "article-generative-ui"],
  }),
  article({
    slug: "ai-feature-product-metrics",
    title: "Product Metrics for AI Features",
    summary:
      "Measuring whether an AI feature helps: outcome events, acceptance, stops and rephrases, cost per success and keeping message text out of analytics.",
    category: "AI Engineering",
    tags: ["Analytics", "Product", "Observability", "Privacy"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "activity",
    body: aiFeatureProductMetrics,
    sourceUrls: [
      { title: "GA4: Recommended events", url: "https://support.google.com/analytics/answer/9267735" },
      { title: "Google People + AI Guidebook: Feedback and control", url: "https://pair.withgoogle.com/chapter/feedback-controls/" },
    ],
    relatedProjects: [PROJECT_ASSISTANT],
    relatedArticles: ["article-ai-observability", "article-ai-trust-ux-patterns"],
  }),
  article({
    slug: "in-browser-models-webgpu",
    title: "Running Small Models in the Browser with WebGPU",
    summary:
      "Embeddings, classification and small models in a Web Worker with Transformers.js: caching, progress, fallbacks and when the download is worth it.",
    category: "AI Engineering",
    tags: ["WebGPU", "Transformers.js", "On-device", "Embeddings"],
    publicationStatus: "draft",
    learningStatus: "Learning Notes",
    updatedAt: "2026-11-26",
    icon: "cpu",
    body: inBrowserModelsWebgpu,
    sourceUrls: [
      { title: "Transformers.js documentation", url: "https://huggingface.co/docs/transformers.js" },
      { title: "MDN: WebGPU API", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API" },
    ],
    relatedProjects: [],
    relatedArticles: ["article-chrome-built-in-ai-prompt-api", "article-embeddings-and-vector-databases"],
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
