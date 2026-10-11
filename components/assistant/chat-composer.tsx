"use client"

import { useState } from "react"
import { Send, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import { modeOptions, type ChatMode } from "@/lib/chat-modes"
import { PORTFOLIO } from "@/lib/portfolio"
import { cn } from "@/lib/utils"

const { composer } = PORTFOLIO

type ChatComposerProps = {
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
  onSend: (text: string) => void
  onStop: () => void
  busy: boolean
}

export function ChatComposer({ mode, onModeChange, onSend, onStop, busy }: ChatComposerProps) {
  const [input, setInput] = useState("")

  function submit() {
    const text = input.trim()
    if (!text || busy) return
    onSend(text)
    setInput("")
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="rounded-2xl border bg-card p-2 shadow-lg shadow-black/5 sm:p-3"
    >
      <div className="flex items-end gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Ask me anything
        </label>
        <textarea
          id="chat-input"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            const isCoarse = window.matchMedia("(pointer: coarse)").matches
            // Ctrl/Cmd+Enter always sends; plain Enter sends on desktop (Shift+Enter = newline).
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey || (!e.shiftKey && !isCoarse))) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={composer.placeholder}
          className="field-sizing-content max-h-40 min-h-10 w-full min-w-0 flex-1 resize-none overflow-y-auto scrollbar-hide wrap-anywhere bg-transparent px-2 py-2 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
        {busy ? (
          <Button type="button" size="icon-lg" variant="secondary" onClick={onStop} aria-label="Stop generating" className="sm:hidden">
            <Square className="fill-current" />
          </Button>
        ) : (
          <Button type="submit" size="icon-lg" disabled={!input.trim()} aria-label="Send" className="sm:hidden">
            <Send />
          </Button>
        )}
      </div>

      <div className="mt-1 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
        {modeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={mode === option.value}
            onClick={() => onModeChange(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs whitespace-nowrap transition-colors hover:bg-muted sm:px-3 sm:py-1.5 sm:text-sm",
              mode === option.value && "border-primary/70 bg-primary/15 text-foreground",
            )}
          >
            <option.icon className="size-3.5 sm:size-4" />
            {option.label}
          </button>
        ))}

        <div className="ml-auto hidden flex-col items-end gap-1 sm:flex">
          {busy ? (
            <Button type="button" size="lg" variant="secondary" onClick={onStop} className="px-4">
              <Square className="fill-current" /> {composer.stop}
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={!input.trim()} className="px-5">
              <Send /> {composer.send}
            </Button>
          )}
          <span className="text-xs text-muted-foreground">{composer.shortcutHint}</span>
        </div>
      </div>
    </form>
  )
}
