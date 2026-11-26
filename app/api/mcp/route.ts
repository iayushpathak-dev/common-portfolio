import { createMcpHandler } from "mcp-handler"
import { z } from "zod"

import { getProfile, getProjectDetails, listProjects } from "@/lib/mcp/portfolio-tools"
import { clientKey, getMcpRateLimiter } from "@/lib/rate-limit"

/**
 * Public, read-only MCP server for this portfolio.
 *
 * Any MCP client (Claude, ChatGPT, Cursor, Claude Code…) can connect to
 * https://ayushpathak.co.in/api/mcp and call these tools. The client sends JSON-RPC:
 *   initialize  → handshake (handled by mcp-handler)
 *   tools/list  → the three tools registered below, with their input schemas
 *   tools/call  → runs one tool and returns its result as text
 */

const asText = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] })

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_profile",
      {
        title: "Get profile",
        description:
          "Get Ayush Pathak's professional profile: role, total experience, work history, skills, education and resume link. Use this first for any question about Ayush.",
        inputSchema: z.object({}),
      },
      async () => asText(getProfile()),
    )

    server.registerTool(
      "list_projects",
      {
        title: "List projects",
        description:
          "List Ayush's published projects with a short summary, tags and a link. Use this to find a project's slug before calling get_project.",
        inputSchema: z.object({}),
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
      },
      async ({ slug }) => {
        const project = getProjectDetails(slug)
        return project
          ? asText(project)
          : { content: [{ type: "text" as const, text: `No published project with slug "${slug}". Call list_projects to see valid slugs.` }], isError: true }
      },
    )
  },
  { serverInfo: { name: "ayush-pathak-portfolio", version: "1.0.0" } },
)

async function handler(req: Request) {
  const limit = await getMcpRateLimiter()
    .limit(clientKey(req))
    .catch(() => ({ success: true, remaining: 0, reset: 0 })) // a limiter outage shouldn't take MCP down
  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))
    return Response.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfter) } })
  }
  return mcpHandler(req)
}

export { handler as GET, handler as POST, handler as DELETE }
