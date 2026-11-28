import { createMcpHandler } from "mcp-handler"
import { after } from "next/server"
import { z } from "zod"

import { ARTICLE_CATEGORIES, getArticle, getProfile, getProjectDetails, listArticles, listProjects } from "@/lib/mcp/portfolio-tools"
import { searchPortfolio } from "@/lib/mcp/search"
import { scheduleIndexSync } from "@/lib/rag/auto-sync"
import { clientKey, getMcpRateLimiter } from "@/lib/rate-limit"

/**
 * Public, read-only MCP server for this portfolio.
 *
 * Any MCP client (Claude, ChatGPT, Cursor, Claude Code…) can connect to
 * https://ayushpathak.co.in/api/mcp and call these tools. The client sends JSON-RPC:
 *   initialize  → handshake (handled by mcp-handler)
 *   tools/list  → the tools registered below, with their input schemas
 *   tools/call  → runs one tool and returns its result as text
 *
 * Every tool only reads published content. Private pages (/findjobs, /userquestions), drafts,
 * planned topics and visitor questions are never reachable from here.
 */

const asText = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] })
const notFound = (text: string) => ({ content: [{ type: "text" as const, text }], isError: true })
const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }

const INSTRUCTIONS = `This server answers questions about Ayush Pathak, a Senior Frontend Engineer (React, Next.js) based in Delhi NCR, India.
Start with get_profile for who he is and his experience. Use search_portfolio for a specific question (it searches all his published case studies and articles), then get_project or get_article for full detail. Cite the url from each result. Everything here is published, public content.`

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_profile",
      {
        title: "Get profile",
        description:
          "Get Ayush Pathak's professional profile: role, total experience, work history, skills, education and resume link. Use this first for any question about Ayush.",
        inputSchema: z.object({}),
        annotations: readOnly,
      },
      async () => asText(getProfile()),
    )

    server.registerTool(
      "search_portfolio",
      {
        title: "Search portfolio",
        description:
          "Semantic search over Ayush's published case studies, articles, experience and FAQ. Returns the best-matching excerpts with their page URL. Use it for specific questions like 'Has Ayush built a BFF?' or 'How did he handle WebView keyboards?'.",
        inputSchema: z.object({
          query: z.string().trim().min(2).max(200).describe("What to look for, in plain words"),
          limit: z.number().int().min(1).max(8).optional().describe("Number of results (default 5)"),
        }),
        annotations: readOnly,
      },
      async ({ query, limit }) => {
        const result = await searchPortfolio(query, limit ?? 5)
        if (!result.ok) return notFound(result.error)
        if (result.hits.length === 0) return asText({ hits: [], note: "Nothing relevant found. Try different words, or list_projects / list_articles." })
        return asText({ hits: result.hits })
      },
    )

    server.registerTool(
      "list_projects",
      {
        title: "List projects",
        description:
          "List Ayush's published projects with a short summary, tags and a link. Use this to find a project's slug before calling get_project.",
        inputSchema: z.object({}),
        annotations: readOnly,
      },
      async () => asText(listProjects()),
    )

    server.registerTool(
      "get_project",
      {
        title: "Get project",
        description:
          "Get the full case study of one published project by its slug (from list_projects): problem, contribution, architecture, decisions, impact and stack.",
        inputSchema: z.object({
          slug: z.string().min(1).max(100).describe("Project slug from list_projects, e.g. 'backend-for-frontend'"),
        }),
        annotations: readOnly,
      },
      async ({ slug }) => {
        const project = getProjectDetails(slug)
        return project ? asText(project) : notFound(`No published project with slug "${slug}". Call list_projects to see valid slugs.`)
      },
    )

    server.registerTool(
      "list_articles",
      {
        title: "List articles",
        description:
          "List Ayush's published blog articles (newest first) with summary, category and link. Optionally filter by category. Use this to find an article's slug before calling get_article.",
        inputSchema: z.object({
          category: z.enum(ARTICLE_CATEGORIES).optional().describe("Only this category"),
        }),
        annotations: readOnly,
      },
      async ({ category }) => asText(listArticles(category)),
    )

    server.registerTool(
      "get_article",
      {
        title: "Get article",
        description: "Get one published article in full (Markdown) by its slug from list_articles, with its sources.",
        inputSchema: z.object({
          slug: z.string().min(1).max(100).describe("Article slug from list_articles"),
        }),
        annotations: readOnly,
      },
      async ({ slug }) => {
        const article = getArticle(slug)
        return article ? asText(article) : notFound(`No published article with slug "${slug}". Call list_articles to see valid slugs.`)
      },
    )
  },
  { serverInfo: { name: "ayush-pathak-portfolio", version: "1.1.0" }, instructions: INSTRUCTIONS },
)

async function handler(req: Request) {
  const limit = await getMcpRateLimiter()
    .limit(clientKey(req))
    .catch(() => ({ success: true, remaining: 0, reset: 0 })) // a limiter outage shouldn't take MCP down
  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))
    return Response.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfter) } })
  }
  if (req.method === "POST") scheduleIndexSync(after)
  return mcpHandler(req)
}

export { handler as GET, handler as POST, handler as DELETE }
