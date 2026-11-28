import { MCP_ENDPOINT, MCP_SERVER_NAME, MCP_TOOLS, MCP_VERSION } from "@/lib/mcp/info"
import { absoluteUrl } from "@/lib/site"

// MCP server card for automatic discovery by agents and crawlers. The format is still an
// experimental proposal, so this only lists plain facts about the server.

export function GET() {
  return Response.json({
    name: MCP_SERVER_NAME,
    title: "Ayush Pathak — portfolio",
    version: MCP_VERSION,
    description: "Read-only access to Ayush Pathak's published portfolio: profile, case studies, articles and semantic search.",
    endpoints: [{ transport: "streamable-http", url: MCP_ENDPOINT }],
    authentication: { required: false },
    tools: MCP_TOOLS.map(({ name, description }) => ({ name, description, readOnly: true })),
    documentation: absoluteUrl("/mcp"),
  })
}
