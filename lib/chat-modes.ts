import type { UIMessage } from "ai"

import { PORTFOLIO } from "@/lib/portfolio"

export const CHAT_MODES = ["auto", "knowledge", "web"] as const

export type ChatMode = (typeof CHAT_MODES)[number]

export type AssistantMessage = UIMessage<{ createdAt?: number; mode?: ChatMode; searchUnavailable?: boolean }>

const MODE_TONES: Record<ChatMode, string> = {
  auto: "bg-primary text-primary-foreground",
  knowledge: "bg-success text-white",
  web: "bg-blue-600 text-white",
}

/** Copy from PORTFOLIO.modes plus each mode's icon colour, in display order. */
export const modeOptions = CHAT_MODES.map((value) => ({ value, ...PORTFOLIO.modes[value], tone: MODE_TONES[value] }))
