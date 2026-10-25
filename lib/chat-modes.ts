import type { UIMessage } from "ai"

import { PORTFOLIO } from "@/lib/portfolio"
import type { ChatRoute } from "@/lib/rag/types"

export const CHAT_MODES = ["auto", "knowledge", "web"] as const

export type ChatMode = (typeof CHAT_MODES)[number]

export type AssistantMetadata = {
  createdAt?: number
  mode?: ChatMode
  /** Which path answered: personal RAG, web search, general knowledge, a fixed reply… */
  route?: ChatRoute
  requestId?: string
  searchUnavailable?: boolean
}

export type AssistantMessage = UIMessage<AssistantMetadata>

/** The kind of source an answer is based on, for the label under each answer. */
export function sourceKind(route: ChatRoute | undefined): "portfolio" | "web" | "general" | "none" | null {
  switch (route) {
    case "personal_rag":
    case "technical_rag":
    case "fallback":
      return "portfolio"
    case "web_search":
      return "web"
    case "general":
      return "general"
    case "no_context":
      return "none"
    default:
      return null
  }
}

const MODE_TONES: Record<ChatMode, string> = {
  auto: "bg-primary text-primary-foreground",
  knowledge: "bg-success text-white",
  web: "bg-blue-600 text-white",
}

/** Copy from PORTFOLIO.modes plus each mode's icon colour, in display order. */
export const modeOptions = CHAT_MODES.map((value) => ({ value, ...PORTFOLIO.modes[value], tone: MODE_TONES[value] }))
