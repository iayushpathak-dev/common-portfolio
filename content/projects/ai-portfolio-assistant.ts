import type { Project } from "@/content/types"

// This project is this repository, so its details are verifiable in the code.
export const aiPortfolioAssistant: Project = {
  id: "project-ai-portfolio-assistant",
  slug: "ai-portfolio-assistant",
  contentType: "project",
  title: "Personal AI Assistant with RAG and Web Search",
  summary:
    "This website's assistant: a Next.js chat that answers questions about my work from my published portfolio content using retrieval-augmented generation (RAG), cites its sources, and uses Google Search only for current technical questions.",
  publicationStatus: "published",
  evidence: "Hands-on Implementation",
  organization: "Personal project",
  period: "2026",
  categories: ["AI", "Web App", "Architecture"],
  tags: ["Next.js", "Vercel AI SDK", "RAG", "Embeddings", "Upstash Vector", "Gemini"],
  stack: [
    "Next.js 16 (App Router)",
    "TypeScript",
    "Vercel AI SDK v7",
    "Google Gemini / Gemma models",
    "Gemini embeddings",
    "Upstash Vector",
    "Upstash Redis (rate limiting)",
    "Tailwind CSS v4",
    "Vitest",
  ],
  featured: true,
  visual: { kind: "icon", icon: "sparkles" },
  links: { github: "https://github.com/iayushpathak-dev/common-portfolio" },
  updatedAt: "2026-10-18",
  sections: {
    problem:
      "Recruiters and engineers want quick, specific answers about my experience and projects. A chatbot that invents details would be worse than no chatbot, so every personal answer has to be grounded in content I have published.",
    challenge:
      "Making a language model answer only from my content, cite where each answer came from, say clearly when it doesn't know, keep web search out of personal questions, and stay inside free-tier quotas.",
    contribution:
      "I designed and built the whole assistant: the chat UI, the streaming API route, the content model, the ingestion pipeline, retrieval, routing, citations, rate limiting and the tests.",
    architecture: `\`\`\`text
Question
  └─► /api/chat: validate (Zod) ─► rate limit ─► route (scope + intent rules)
        ├─ out of scope / injection ─► fixed reply, no model call
        ├─ personal or technical ─► embed question (Gemini)
        │      └─► Upstash Vector query (published content only, top-K, threshold)
        │             ├─ relevant chunks ─► grounded prompt ─► stream answer + source links
        │             └─ nothing relevant ─► "I don't have that information"
        └─ current tech question ─► model with Google Search grounding ─► answer + web sources

Content (content/*.ts, *.md) ─► POST /api/rag/reindex (secret) ─► chunk ─► hash diff
  ─► embed only changed chunks ─► upsert ─► delete obsolete chunks
\`\`\``,
    decisions: `- **Retrieval instead of stuffing everything into the prompt.** The first version sent all portfolio data with every request. RAG sends only the relevant chunks, which scales to many articles and makes citations possible.
- **Application-level routing before the model.** Out-of-scope questions and obvious prompt-injection attempts get a fixed reply without calling the model, so scope doesn't depend on the prompt alone.
- **Personal questions never use web search.** Facts about me come only from retrieved portfolio content.
- **Idempotent ingestion keyed by content hashes.** Re-running the indexer re-embeds only changed chunks and deletes chunks that no longer exist, so it's safe to run after every deploy.
- **Content is data.** Projects and articles live in typed files under content/ with a publication status; drafts are never indexed.`,
    tradeoffs: `- **Upstash Vector vs pgvector or Cloudflare Vectorize:** Upstash has a REST API that works from Vercel functions with no connection pooling, and a free tier; pgvector would allow SQL joins but needs a database to run.
- **Heuristic router vs LLM classifier:** keyword rules are instant, free and testable, but miss nuance; an LLM classifier understands intent better but adds latency, cost and another failure point.
- **Similarity thresholds:** a high threshold reduces wrong context but causes more "I don't know" answers; the threshold is configurable and should be tuned with the evaluation set.`,
    limitations: `- Retrieval quality depends on the threshold and chunking, which still need tuning against real questions.
- The heuristic router can misclassify unusual phrasing.
- Prompt-injection defences reduce risk but cannot eliminate it.
- Free-tier quotas (Gemini, Upstash) limit throughput; the app degrades to a clear error when limits are hit.`,
    impact: null,
    lessons: null,
  },
  relatedArticles: [
    "article-building-ai-chat-interfaces",
    "article-vercel-ai-sdk-architecture",
    "article-embeddings-and-vector-databases",
    "article-building-rag-from-scratch",
    "article-keeping-knowledge-base-in-sync",
    "article-hybrid-ai-assistant",
    "article-testing-and-evaluating-rag",
    "article-ai-observability",
    "article-ai-application-security",
  ],
  todos: ["Lessons learned while building it, and any usage numbers you'd like to share once it has been live for a while."],
}
