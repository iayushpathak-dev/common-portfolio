"use client"

import { useState } from "react"
import { Check, Copy, Globe, ThumbsDown, ThumbsUp, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import type { AssistantMessage } from "@/lib/chat-modes"
import { cn } from "@/lib/utils"

export function messageText(message: AssistantMessage) {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function ChatMessage({ message, streaming }: { message: AssistantMessage; streaming?: boolean }) {
  const text = messageText(message)

  if (message.role === "user") {
    return (
      <div className="flex items-start justify-end gap-3">
        <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground whitespace-pre-wrap wrap-anywhere">
          {text}
        </p>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
          <User className="size-4" />
        </span>
      </div>
    )
  }

  const sources = message.parts.filter((p) => p.type === "source-url")

  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border bg-card px-4 py-3 lg:px-5 lg:py-3.5">
        {text ? (
          <div className="prose-chat text-sm leading-relaxed wrap-anywhere">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        ) : (
          <TypingDots />
        )}

        {message.metadata?.searchUnavailable && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="size-3.5" /> Web search limit reached, so this answer uses my portfolio data only.
          </p>
        )}

        {sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sources.map((s) => (
              <a
                key={s.sourceId}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-56 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Globe className="size-3 shrink-0" />
                <span className="truncate">{s.title ?? hostname(s.url)}</span>
              </a>
            ))}
          </div>
        )}

        {!streaming && text && <MessageActions text={text} createdAt={message.metadata?.createdAt} />}
      </div>
    </div>
  )
}

export function AssistantAvatar() {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-blue-500 to-violet-500 font-bold text-white">
      A
    </span>
  )
}

export function TypingDots() {
  return (
    <span className="flex gap-1 py-1.5" aria-label="Assistant is typing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-2 animate-bounce rounded-full bg-muted-foreground/70"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

function MessageActions({ text, createdAt }: { text: string; createdAt?: number }) {
  const [copied, setCopied] = useState(false)
  const [vote, setVote] = useState<"up" | "down" | null>(null)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="mt-3 flex items-center gap-1 text-muted-foreground">
      <Button variant="ghost" size="icon-sm" aria-label="Copy answer" onClick={copy}>
        {copied ? <Check /> : <Copy />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Helpful"
        aria-pressed={vote === "up"}
        className={cn(vote === "up" && "text-primary")}
        onClick={() => setVote(vote === "up" ? null : "up")}
      >
        <ThumbsUp />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Not helpful"
        aria-pressed={vote === "down"}
        className={cn(vote === "down" && "text-destructive")}
        onClick={() => setVote(vote === "down" ? null : "down")}
      >
        <ThumbsDown />
      </Button>
      {createdAt && (
        <time className="ml-auto text-xs" dateTime={new Date(createdAt).toISOString()}>
          {new Date(createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </time>
      )}
    </div>
  )
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}
