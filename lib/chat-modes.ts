import type { UIMessage } from "ai"

export const CHAT_MODES = ["auto", "knowledge", "web"] as const

export type ChatMode = (typeof CHAT_MODES)[number]

export type AssistantMessage = UIMessage<{ createdAt?: number; mode?: ChatMode; searchUnavailable?: boolean }>
