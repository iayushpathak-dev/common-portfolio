"use client"

import { useRouter } from "next/navigation"

import { ChatSidebar } from "@/components/assistant/chat-sidebar"
import { useChatHistory } from "@/lib/chat-history"
import { PORTFOLIO } from "@/lib/portfolio"

const ASSISTANT = PORTFOLIO.pages.assistant.href

/** The chat sidebar on pages other than the assistant: every action opens the assistant. */
export function LinkedSidebar({ className }: { className?: string }) {
  const router = useRouter()
  const chats = useChatHistory()

  return (
    <ChatSidebar
      chats={chats}
      activeId={null}
      mode="auto"
      onModeChange={(mode) => router.push(`${ASSISTANT}?mode=${mode}`)}
      onNewChat={() => router.push(`${ASSISTANT}?new=1`)}
      onSelectChat={(chat) => router.push(`${ASSISTANT}?chat=${encodeURIComponent(chat.id)}`)}
      className={className}
    />
  )
}
