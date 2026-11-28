import { absoluteUrl } from "@/lib/site"

// Public facts about the MCP server, shared by /mcp, the home banner, llms.txt and the server card.

export const MCP_ENDPOINT = absoluteUrl("/api/mcp")
export const MCP_SERVER_NAME = "ayush-pathak-portfolio"
export const MCP_VERSION = "1.1.0"

export const MCP_TOOLS = [
  { name: "get_profile", description: "Role, experience, skills, education and resume link." },
  { name: "search_portfolio", description: "Semantic search over published case studies, articles and FAQ." },
  { name: "list_projects", description: "Published projects with summaries and links." },
  { name: "get_project", description: "One full case study: problem, architecture, decisions, impact." },
  { name: "list_articles", description: "Published blog articles, optionally by category." },
  { name: "get_article", description: "One published article in full, with sources." },
] as const

export const MCP_EXAMPLE_PROMPTS = [
  "What has Ayush built with Next.js, and what was his role?",
  "Summarise Ayush's Backend-for-Frontend case study in 5 bullet points.",
  "Is Ayush a good fit for a senior React role focused on performance? Cite his projects.",
] as const
