import { Bot, Lock, MessageSquare, Plug, Wrench } from "lucide-react"

import { CopyButton } from "@/components/mcp/copy-button"
import { PageShell } from "@/components/page-shell"
import { card, PageIntro, SectionTitle } from "@/components/page-ui"
import { MCP_ENDPOINT, MCP_EXAMPLE_PROMPTS, MCP_TOOLS } from "@/lib/mcp/info"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Use my portfolio in your AI (MCP)",
  description:
    "Connect Ayush Pathak's portfolio to Claude, ChatGPT, Cursor or Claude Code as an MCP server and ask about his projects, experience and articles.",
  path: "/mcp",
})

const code = "block overflow-x-auto rounded-lg border bg-background/60 p-3 text-xs leading-relaxed"

const cursorConfig = JSON.stringify({ mcpServers: { "ayush-pathak-portfolio": { url: MCP_ENDPOINT } } }, null, 2)
const claudeCodeCommand = `claude mcp add --transport http ayush-pathak-portfolio ${MCP_ENDPOINT}`

export default function McpPage() {
  return (
    <PageShell className="flex max-w-4xl flex-col gap-4">
      <PageIntro
        icon={Plug}
        title="Use my portfolio in your AI"
        subtitle="This site is an MCP server."
        description="MCP (Model Context Protocol) lets AI assistants call tools on other sites. Add this URL to your assistant and ask it about my work: it reads my published case studies and articles directly, with links back to the source."
      />

      <section className={card}>
        <SectionTitle icon={Plug}>Server URL</SectionTitle>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 truncate rounded-lg border bg-background/60 px-3 py-2 text-sm">{MCP_ENDPOINT}</code>
          <CopyButton text={MCP_ENDPOINT} label="Copy URL" />
        </div>
        <p className="mt-2 text-xs text-foreground/70">No sign-in needed. Transport: Streamable HTTP.</p>
      </section>

      <section className={card}>
        <SectionTitle icon={Bot}>Connect it</SectionTitle>
        <div className="flex flex-col gap-4 text-sm">
          <div>
            <p className="font-medium">Claude (claude.ai or the desktop app)</p>
            <p className="text-foreground/80">Add a custom connector in your connector settings and paste the server URL above.</p>
          </div>
          <div>
            <p className="font-medium">ChatGPT</p>
            <p className="text-foreground/80">Add a custom MCP connector (developer mode) and paste the server URL above.</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">Claude Code</p>
            <div className="flex items-start gap-2">
              <code className={`${code} min-w-0 flex-1`}>{claudeCodeCommand}</code>
              <CopyButton text={claudeCodeCommand} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">Cursor</p>
            <p className="text-foreground/80">
              Add this to <code>~/.cursor/mcp.json</code>:
            </p>
            <div className="flex items-start gap-2">
              <pre className={`${code} min-w-0 flex-1`}>{cursorConfig}</pre>
              <CopyButton text={cursorConfig} />
            </div>
          </div>
        </div>
      </section>

      <section className={card}>
        <SectionTitle icon={MessageSquare}>Try asking</SectionTitle>
        <ul className="flex flex-col gap-2 text-sm">
          {MCP_EXAMPLE_PROMPTS.map((prompt) => (
            <li key={prompt} className="flex items-start justify-between gap-2 rounded-lg border bg-background/40 p-3">
              <span>{prompt}</span>
              <CopyButton text={prompt} />
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <SectionTitle icon={Wrench}>Tools</SectionTitle>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {MCP_TOOLS.map((tool) => (
            <li key={tool.name} className="rounded-lg border bg-background/40 p-3">
              <code className="font-medium">{tool.name}</code>
              <p className="text-foreground/75">{tool.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <SectionTitle icon={Lock}>What it can and can&apos;t see</SectionTitle>
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
          <li>Every tool is read-only and only returns content that is already public on this site.</li>
          <li>Drafts, private pages and questions visitors ask the site&apos;s assistant are never exposed.</li>
          <li>No AI model runs on my side for these tools; your assistant does the answering.</li>
          <li>Requests are rate-limited per visitor.</li>
        </ul>
      </section>
    </PageShell>
  )
}
