import { PROJECTS } from "@/content"
import { PORTFOLIO } from "@/lib/portfolio"
import type { ChatMode } from "@/lib/chat-modes"
import type { ChatRoute } from "@/lib/rag/types"

// Application-level routing. It runs before any model call, so scope and web-search rules
// don't depend on the model following its prompt. It's intentionally simple and table-tested
// (tests/rag/router.test.ts); retrieval scores can still pull a question back into scope.

export type Intent = "blocked" | "greeting" | "personal" | "current" | "technical" | "unknown"

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const NAMES = [
  PORTFOLIO.profile.name,
  PORTFOLIO.profile.firstName,
  "pathak",
  ...PORTFOLIO.experience.map((j) => j.company),
  ...PROJECTS.flatMap((p) => [p.title, p.aka ?? ""]),
]
  .map((n) => n.trim().toLowerCase())
  .filter((n) => n.length >= 3)

const PERSONAL = new RegExp(
  [
    String.raw`\b(you|your|yours|yourself|he|his|him)\b`,
    // Only strong signals: generic words like "projects" or "skills" go through retrieval instead.
    String.raw`\b(resume|cv|hire|hiring|availability|notice period|reach out|linkedin|mentor(ing|ed)?)\b`,
    ...NAMES.map((n) => `\\b${escape(n)}\\b`),
  ].join("|"),
  "i",
)

const CURRENT = new RegExp(
  [
    String.raw`\b(latest|newest|recent(ly)?|current(ly)? (version|release)|new in|what'?s new|just (released|announced))\b`,
    String.raw`\b(release[sd]?|changelog|roadmap|announce(d|ment)|deprecat(ed|ion)|upcoming)\b`,
    String.raw`\b(today|this (week|month|year)|news)\b`,
    String.raw`\bv?\d+\.\d+(\.\d+)?\b`,
    String.raw`\b20[2-9]\d\b`,
  ].join("|"),
  "i",
)

const TECHNICAL = new RegExp(
  String.raw`\b(` +
    [
      "react(\\.js)?", "next(\\.js)?", "javascript", "typescript", "js", "ts", "jsx", "tsx", "node(\\.js)?", "deno", "bun",
      "html", "css", "tailwind", "sass", "dom", "browser", "web ?apis?", "frontend", "front-end", "backend", "full ?stack",
      "redux", "zustand", "react query", "tanstack", "state management", "context api", "hooks?", "components?",
      "server components?", "server actions?", "app router", "pages router", "ssr", "ssg", "isr", "csr", "rendering",
      "hydration", "streaming", "suspense", "caching", "cache", "cdn", "edge", "middleware", "route handlers?",
      "api", "apis", "rest", "graphql", "grpc", "bff", "webhooks?", "websockets?", "sse", "http",
      "pwa", "service workers?", "offline", "performance", "web vitals", "core web vitals", "lcp", "inp", "cls", "lighthouse",
      "seo", "accessibility", "a11y", "wcag", "testing", "jest", "vitest", "playwright", "cypress", "unit tests?",
      "architecture", "system design", "micro ?frontends?", "monorepo", "design systems?", "bundl(e|er|ing)", "webpack",
      "vite", "turbopack", "vercel", "git", "ci/cd", "ci", "deploy(ment)?", "docker", "security", "auth(entication)?",
      "oauth", "xss", "csrf", "cors", "debugging", "refactor(ing)?", "code review", "programming", "software", "engineering",
      "llms?", "ai", "ml", "genai", "generative ai", "rag", "retrieval", "embeddings?", "vectors?", "vector databases?",
      "prompts?", "prompt injection", "tokens?", "context window", "inference", "fine-?tuning", "agents?", "agentic",
      "tool calling", "function calling", "structured outputs?", "evals?", "evaluation", "observability", "gemini",
      "gemma", "claude", "claude code", "openai", "gpt", "ai sdk", "langchain", "mcp", "chatbots?", "models?",
      "tensorflow", "computer vision", "upstash", "redis", "postgres", "databases?", "sql", "nosql",
    ].join("|") +
    String.raw`)\b`,
  "i",
)

const GREETING = /^\s*(hi|hello|hey|hii+|namaste|good (morning|afternoon|evening)|thanks|thank you|ok(ay)?)\b[\s!.?]*$/i

// Common prompt-injection phrasings. This catches casual attempts only; the real defences are
// architectural (no secrets in context, no write tools, published content only).
const INJECTION = new RegExp(
  [
    String.raw`\b(ignore|disregard|forget|override)\b.{0,40}\b(instructions|rules|prompts?|guidelines|polic(y|ies))\b`,
    String.raw`\b(reveal|show|print|repeat|output|leak|tell me)\b.{0,30}\b(system|hidden|initial|developer)\s+(prompt|message|instructions)\b`,
    String.raw`\byour (system )?(prompt|instructions)\b.{0,20}\b(verbatim|exactly|word for word)\b`,
    String.raw`\b(developer mode|jailbreak|dan mode|do anything now)\b`,
  ].join("|"),
  "i",
)

export function classify(question: string): Intent {
  const q = question.trim()
  if (INJECTION.test(q)) return "blocked"
  if (GREETING.test(q)) return "greeting"
  if (PERSONAL.test(q)) return "personal"
  const technical = TECHNICAL.test(q)
  if (technical && CURRENT.test(q)) return "current"
  if (technical) return "technical"
  return "unknown"
}

/**
 * The route for an intent, given the selected source mode and whether web search is available.
 * Personal questions never use web search. "unknown" is resolved after retrieval (see pipeline).
 */
export function routeFor(intent: Intent, mode: ChatMode): ChatRoute {
  switch (intent) {
    case "blocked":
      return "blocked"
    case "greeting":
      return "greeting"
    case "personal":
      return "personal_rag"
    case "current":
      return mode === "knowledge" ? "technical_rag" : "web_search"
    case "technical":
      return mode === "web" ? "web_search" : "technical_rag"
    case "unknown":
      return "out_of_scope"
  }
}
