"use client"

import { useState } from "react"
import { History, MessageSquare, Plus, Search, Sparkles, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTrackSearch } from "@/lib/analytics"
import { deleteChat, timeAgo, type StoredChat } from "@/lib/chat-history"
import { modeOptions, type ChatMode } from "@/lib/chat-modes"
import { PORTFOLIO } from "@/lib/portfolio"
import { cn } from "@/lib/utils"

const { sidebar } = PORTFOLIO

type ChatSidebarProps = {
  chats: StoredChat[]
  activeId: string | null
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
  onNewChat: () => void
  onSelectChat: (chat: StoredChat) => void
  /** Breakpoint at which the sidebar appears (default lg:flex). */
  className?: string
}

export function ChatSidebar({
  chats,
  activeId,
  mode,
  onModeChange,
  onNewChat,
  onSelectChat,
  className = "lg:flex",
}: ChatSidebarProps) {
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const visible = chats.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
  useTrackSearch(query, "chat_history", visible.length)

  return (
    <aside
      className={cn(
        "hidden min-h-0 flex-col gap-4 overflow-y-auto scrollbar-hide border-r bg-sidebar p-3 print:hidden",
        className,
      )}
    >
      <Button
        variant="outline"
        className="h-10 w-full border-primary/70 hover:bg-primary/10 dark:border-primary/70"
        onClick={onNewChat}
      >
        <Plus /> {sidebar.newChat}
      </Button>

      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-1 pb-1">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <History className="size-4" /> {sidebar.recentChats}
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Search chats"
            aria-pressed={searching}
            onClick={() => {
              setSearching((s) => !s)
              setQuery("")
            }}
          >
            <Search />
          </Button>
        </div>
        {searching && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={sidebar.searchPlaceholder}
            className="mb-1 h-9 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        )}

        {visible.length === 0 ? (
          <p className="px-1 py-2 text-sm text-muted-foreground">
            {chats.length === 0 ? sidebar.emptyHistory : sidebar.noMatches}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {visible.map((chat) => (
              <li key={chat.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelectChat(chat)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl p-2 pr-9 text-left transition-colors hover:bg-muted",
                    chat.id === activeId && "bg-accent hover:bg-accent",
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border bg-background/60">
                    <MessageSquare className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{chat.title}</span>
                    <span className="block text-xs text-muted-foreground">{timeAgo(chat.updatedAt)}</span>
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Delete ${chat.title}`}
                  className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  onClick={() => deleteChat(chat.id)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2 px-1 pb-1 font-semibold">
          <Sparkles className="size-5 text-violet-400" /> {sidebar.assistantTitle}
        </h2>
        {modeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={mode === option.value}
            onClick={() => onModeChange(option.value)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors hover:bg-muted",
              mode === option.value && "border-primary/60 bg-accent hover:bg-accent",
            )}
          >
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", option.tone)}>
              <option.icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">
                {option.label}
                {option.value === "auto" && <span className="font-normal text-muted-foreground"> {sidebar.recommended}</span>}
              </span>
              <span className="block truncate text-xs text-muted-foreground">{option.description}</span>
            </span>
          </button>
        ))}
      </section>

      <section className="mt-auto rounded-2xl bg-linear-to-br from-hero-from to-hero-to p-4">
        <h2 className="mb-3 text-sm font-medium">{sidebar.connectTitle}</h2>
        <div className="flex gap-2">
          {sidebar.socials.map((social) => (
            <SocialLink key={social.label} href={social.href} label={social.label}>
              <social.icon className="size-4" />
            </SocialLink>
          ))}
        </div>
      </section>
    </aside>
  )
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid size-10 place-items-center rounded-xl bg-background/40 transition-colors hover:bg-background/70"
    >
      {children}
    </a>
  )
}
