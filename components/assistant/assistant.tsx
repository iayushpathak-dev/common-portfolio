"use client"

import { Suspense, useEffect, useEffectEvent, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import { generateId } from "ai"
import { RotateCcw } from "lucide-react"

import { ChatComposer } from "@/components/assistant/chat-composer"
import { AssistantAvatar, ChatMessage, TypingDots } from "@/components/assistant/chat-message"
import { ChatSidebar } from "@/components/assistant/chat-sidebar"
import { HeroCard } from "@/components/assistant/hero-card"
import { InsightsPanel } from "@/components/assistant/insights-panel"
import { NavRail } from "@/components/nav-rail"
import { Button } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"
import { getChat, saveChat, useChatHistory, type StoredChat } from "@/lib/chat-history"
import { CHAT_MODES, sourceKind, type AssistantMessage, type ChatMode } from "@/lib/chat-modes"
import { PORTFOLIO } from "@/lib/portfolio"

export function Assistant({ modelId, online }: { modelId: string; online: boolean }) {
  const chats = useChatHistory()
  const [mode, setMode] = useState<ChatMode>("auto")
  // Chat ids are created lazily on first save: random values can't run during prerender.
  const [activeId, setActiveId] = useState<string | null>(null)
  // onFinish is captured when the chat is created, so it reads the live id from a ref.
  const activeIdRef = useRef<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, stop, error, setMessages, regenerate, clearError } = useChat<AssistantMessage>({
    // A fixed id stops useChat generating a random one during prerender; history uses activeId.
    id: "portfolio-assistant",
    onFinish: ({ messages, isError }) => {
      if (isError) return
      if (!activeIdRef.current) {
        activeIdRef.current = generateId()
        setActiveId(activeIdRef.current)
      }
      saveChat(activeIdRef.current, messages)
    },
  })

  const busy = status === "submitted" || status === "streaming"
  const lastAssistant = messages.findLast((m) => m.role === "assistant")
  const usedWeb = sourceKind(lastAssistant?.metadata?.route) === "web"

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, status])

  function switchTo(id: string | null, next: AssistantMessage[]) {
    if (busy) stop()
    clearError()
    activeIdRef.current = id
    setActiveId(id)
    setMessages(next)
  }

  function send(text: string) {
    if (busy) return
    sendMessage({ text }, { body: { mode } })
    trackEvent("chat_message_sent", { chat_mode: mode, message_length: text.length, source: "composer" })
  }

  // Links from other pages arrive as ?new=1, ?chat=<id>, ?mode=<mode> or ?ask=<question>.
  function applyUrlIntent({ newChat, chatId, mode: nextMode, ask }: UrlIntentParams) {
    const validMode = CHAT_MODES.includes(nextMode as ChatMode) ? (nextMode as ChatMode) : null
    if (validMode) setMode(validMode)

    const chat = chatId ? getChat(chatId) : undefined
    if (chat) switchTo(chat.id, chat.messages)
    else if (newChat || ask) switchTo(null, [])

    // A question from another page (blog post, project) starts a fresh chat with it.
    if (ask) {
      sendMessage({ text: ask }, { body: { mode: validMode ?? mode } })
      trackEvent("chat_message_sent", { chat_mode: validMode ?? mode, message_length: ask.length, source: "link" })
    }
  }

  return (
    <div className="grid min-h-0 flex-1 md:grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_280px] 2xl:grid-cols-[272px_minmax(0,1fr)_320px]">
      <NavRail className="md:flex lg:hidden" />
      <ChatSidebar
        chats={chats}
        activeId={activeId}
        mode={mode}
        onModeChange={setMode}
        onNewChat={() => switchTo(null, [])}
        onSelectChat={(chat: StoredChat) => switchTo(chat.id, chat.messages)}
      />

      <main className="flex min-h-0 min-w-0 flex-col">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 lg:p-5">
            <HeroCard onPick={send} disabled={busy} />

            {messages.map((message, i) => (
              <ChatMessage
                key={message.id}
                message={message}
                streaming={busy && i === messages.length - 1 && message.role === "assistant"}
              />
            ))}

            {status === "submitted" && (
              <div className="flex items-start gap-3">
                <AssistantAvatar />
                <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-3">
                  <TypingDots />
                </div>
              </div>
            )}

            {error && (
              <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <span>
                  {online ? friendlyError(error) : PORTFOLIO.chat.notConfigured}
                </span>
                <Button size="sm" variant="outline" onClick={() => regenerate({ body: { mode } })}>
                  <RotateCcw /> {PORTFOLIO.chat.retry}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl px-3 pb-3 lg:px-5 lg:pb-4">
          <ChatComposer mode={mode} onModeChange={setMode} onSend={send} onStop={stop} busy={busy} />
        </div>
      </main>

      <InsightsPanel mode={mode} usedWeb={usedWeb} modelId={modelId} online={online} onPick={send} />

      {/* useSearchParams needs a Suspense boundary so the rest of the page stays prerendered. */}
      <Suspense fallback={null}>
        <UrlIntent onIntent={applyUrlIntent} />
      </Suspense>
    </div>
  )
}

/** Error responses are JSON ({ error }); stream errors are already plain, safe text. */
function friendlyError(error: Error) {
  try {
    const parsed = JSON.parse(error.message) as { error?: unknown }
    if (typeof parsed.error === "string") return parsed.error
  } catch {}
  return error.message || PORTFOLIO.chat.genericError
}

type UrlIntentParams = { newChat: boolean; chatId: string | null; mode: string | null; ask: string | null }

function UrlIntent({ onIntent }: { onIntent: (intent: UrlIntentParams) => void }) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const newChat = params.has("new")
  const chatId = params.get("chat")
  const mode = params.get("mode")
  const ask = params.get("ask")
  const handle = useEffectEvent(onIntent)

  useEffect(() => {
    if (!newChat && chatId === null && mode === null && ask === null) return
    handle({ newChat, chatId, mode, ask })
    // Drop the params so a refresh doesn't reapply them and the same link works again.
    router.replace(pathname, { scroll: false })
  }, [newChat, chatId, mode, ask, pathname, router])

  return null
}
