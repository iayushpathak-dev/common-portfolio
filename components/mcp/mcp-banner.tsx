import { Plug } from "lucide-react"
import Link from "next/link"

import { CopyButton } from "@/components/mcp/copy-button"
import { MCP_ENDPOINT } from "@/lib/mcp/info"

/** Small home-page card pointing people to the portfolio's MCP server. */
export function McpBanner() {
  return (
    <section className="mx-auto mt-6 flex max-w-6xl flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between lg:p-5">
      <div className="flex min-w-0 gap-3">
        <Plug className="mt-0.5 size-6 shrink-0 text-violet-500 dark:text-violet-300" />
        <div className="min-w-0">
          <p className="font-semibold">Ask your own AI about my work</p>
          <p className="text-sm text-foreground/75">
            This portfolio is an MCP server. Add it to Claude, ChatGPT or Cursor and ask about my projects and experience.{" "}
            <Link href="/mcp" className="underline underline-offset-2">
              How to connect
            </Link>
          </p>
          <code className="mt-1 block truncate text-xs text-foreground/70">{MCP_ENDPOINT}</code>
        </div>
      </div>
      <CopyButton text={MCP_ENDPOINT} label="Copy URL" />
    </section>
  )
}
