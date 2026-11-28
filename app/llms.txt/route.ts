import { articleHref, projectHref, publishedArticles, publishedProjects } from "@/content"
import { MCP_ENDPOINT } from "@/lib/mcp/info"
import { PORTFOLIO } from "@/lib/portfolio"
import { absoluteUrl } from "@/lib/site"

// llms.txt: a plain-text map of the site for AI crawlers. Published content only.

export function GET() {
  const { profile } = PORTFOLIO
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${profile.role}, ${profile.location}. ${profile.totalExperience.toLowerCase()} of frontend experience (React, Next.js).`,
    "",
    "## MCP server",
    "",
    `- [MCP endpoint](${MCP_ENDPOINT}): read-only tools get_profile, search_portfolio, list_projects, get_project, list_articles, get_article. No authentication.`,
    `- [How to connect](${absoluteUrl("/mcp")})`,
    "",
    "## Pages",
    "",
    `- [About](${absoluteUrl("/about")})`,
    `- [Experience](${absoluteUrl("/experience")})`,
    `- [Resume](${absoluteUrl("/resume")})`,
    "",
    "## Projects",
    "",
    ...publishedProjects().map((p) => `- [${p.title}](${absoluteUrl(projectHref(p.slug))}): ${p.summary}`),
  ]
  const articles = publishedArticles()
  if (articles.length > 0) {
    lines.push("", "## Articles", "", ...articles.map((a) => `- [${a.title}](${absoluteUrl(articleHref(a.slug))}): ${a.summary}`))
  }
  return new Response(lines.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
